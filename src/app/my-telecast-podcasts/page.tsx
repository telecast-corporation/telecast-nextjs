"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
  Favorite as LikeIcon,
  CalendarToday as DateIcon,
  Podcasts as PodcastIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";

interface TelecastPodcast {
  id: string;
  title: string;
  episodeTitle: string;
  published: boolean;
  publishedAt: string;
  views: number;
  likes: number;
  createdAt: string;
  audioFileData?: string;
  audioFileName?: string;
  audioFileType?: string;
}

export default function MyTelecastPodcastsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<TelecastPodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchTelecastPodcasts();
  }, []);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.src = '';
      }
    };
  }, [audioRef]);

  const handlePlay = (podcast: TelecastPodcast) => {
    if (!podcast.audioFileData) {
      alert('No audio file available for this podcast');
      return;
    }

    // If the same podcast is already playing, pause it
    if (currentlyPlaying === podcast.id) {
      try {
        if (audioRef) {
          audioRef.pause();
          setCurrentlyPlaying(null);
        }
      } catch (error) {
        // Silently handle pause errors
        console.log('Pause action completed');
        setCurrentlyPlaying(null);
      }
      return;
    }

    // If a different podcast is playing, stop it first
    if (audioRef) {
      try {
        audioRef.pause();
        audioRef.src = '';
      } catch (error) {
        // Silently handle stop errors
        console.log('Previous audio stopped');
      }
    }

    // Create new audio element and play the selected podcast
    const audio = new Audio(podcast.audioFileData);
    audio.addEventListener('ended', () => {
      setCurrentlyPlaying(null);
    });
    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      // Don't show alert for common audio errors
      setCurrentlyPlaying(null);
    });

    audio.play().then(() => {
      setAudioRef(audio);
      setCurrentlyPlaying(podcast.id);
    }).catch((error) => {
      console.error('Error playing audio:', error);
      // Only show alert for actual errors, not user-initiated stops
      if (error.name !== 'AbortError') {
        alert('Error playing audio file');
      }
      setCurrentlyPlaying(null);
    });
  };

  const handleStop = () => {
    try {
      if (audioRef) {
        // Pause first, then reset
        audioRef.pause();
        // Use setTimeout to avoid DOM manipulation errors
        setTimeout(() => {
          try {
            audioRef.currentTime = 0;
            audioRef.src = '';
          } catch (e) {
            // Ignore any errors during cleanup
          }
        }, 0);
        setAudioRef(null);
      }
      setCurrentlyPlaying(null);
    } catch (error) {
      // Silently handle any errors during stop
      console.log('Stop action completed');
      setCurrentlyPlaying(null);
      setAudioRef(null);
    }
  };

  const fetchTelecastPodcasts = async () => {
    try {
      const response = await fetch('/api/telecast-podcasts');
      if (!response.ok) {
        throw new Error('Failed to fetch podcasts');
      }
      const data = await response.json();
      setPodcasts(data.telecastPodcasts || []);
    } catch (error) {
      setError('Failed to load your Telecast podcasts');
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.palette.mode === 'dark' ? '#1a1a2e' : '#f8fafc',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' ? '#1a1a2e' : '#f8fafc',
        py: 6,
        px: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            fontWeight={900}
            mb={2}
            sx={{
              color: theme.palette.primary.main,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
            }}
          >
            My Telecast Podcasts
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            mb={3}
            sx={{ fontWeight: 400, maxWidth: 600, mx: 'auto' }}
          >
            Your voice, shared with the world
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {podcasts.length === 0 ? (
          <Card
            sx={{
              textAlign: 'center',
              py: 8,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent>
              <PodcastIcon
                sx={{
                  fontSize: 80,
                  color: theme.palette.primary.main,
                  mb: 3,
                }}
              />
              <Typography variant="h4" fontWeight={700} mb={2}>
                No Podcasts Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Start your podcasting journey by recording and broadcasting your first episode.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/record')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                }}
              >
                Start Recording
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {podcasts.map((podcast) => (
              <Grid item xs={12} sm={6} md={4} key={podcast.id}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    ...(currentlyPlaying === podcast.id && {
                      border: `2px solid ${theme.palette.primary.main}`,
                      boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
                    }),
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          mr: 2,
                        }}
                      >
                        <PodcastIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} noWrap>
                          {podcast.title}
                          {currentlyPlaying === podcast.id && (
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-block',
                                ml: 1,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: theme.palette.primary.main,
                                animation: 'pulse 1.5s ease-in-out infinite',
                                '@keyframes pulse': {
                                  '0%': {
                                    opacity: 1,
                                    transform: 'scale(1)',
                                  },
                                  '50%': {
                                    opacity: 0.5,
                                    transform: 'scale(1.2)',
                                  },
                                  '100%': {
                                    opacity: 1,
                                    transform: 'scale(1)',
                                  },
                                },
                              }}
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {podcast.episodeTitle}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DateIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(podcast.publishedAt || podcast.createdAt)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip
                        icon={<ViewIcon />}
                        label={`${podcast.views} views`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<LikeIcon />}
                        label={`${podcast.likes} likes`}
                        size="small"
                        variant="outlined"
                      />
                      {podcast.published && (
                        <Chip
                          label="Published"
                          color="success"
                          size="small"
                        />
                      )}
                    </Box>

                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                      <Tooltip 
                        title={podcast.audioFileData 
                          ? `${podcast.audioFileName || 'Audio file'} - Click to ${currentlyPlaying === podcast.id ? 'pause' : 'play'}`
                          : 'No audio file available'
                        }
                        placement="top"
                      >
                        <Button
                          variant={currentlyPlaying === podcast.id ? "contained" : "outlined"}
                          size="small"
                          startIcon={currentlyPlaying === podcast.id ? <PauseIcon /> : <PlayIcon />}
                          fullWidth
                          onClick={() => handlePlay(podcast)}
                          disabled={!podcast.audioFileData}
                          sx={{
                            ...(currentlyPlaying === podcast.id && {
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              '&:hover': {
                                bgcolor: theme.palette.primary.dark,
                              },
                            }),
                          }}
                        >
                          {currentlyPlaying === podcast.id ? 'Pause' : 'Play'}
                        </Button>
                      </Tooltip>
                      {currentlyPlaying && (
                        <Tooltip title="Stop playback" placement="top">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<StopIcon />}
                            onClick={handleStop}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            Stop
                          </Button>
                        </Tooltip>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => {
                          // TODO: Implement share functionality
                          alert('Share functionality coming soon!');
                        }}
                      >
                        Share
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/record')}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1.1rem',
              mr: 2,
            }}
          >
            Record New Episode
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/dashboard')}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    </Box>
  );
} 