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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
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
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import CategoryIcon from '@mui/icons-material/Category';
import ExplicitIcon from '@mui/icons-material/WarningAmber';
import DescriptionIcon from '@mui/icons-material/Description';
import NumbersIcon from '@mui/icons-material/Numbers';
import EventIcon from '@mui/icons-material/Event';
import TypeSpecimenIcon from '@mui/icons-material/TypeSpecimen';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import { alpha } from '@mui/material/styles';

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
  episodeDescription?: string;
  description?: string;
  author?: string;
  language?: string;
  category?: string;
  explicit?: boolean;
  episodeType?: string;
  episodeNumber?: string;
  pubDate?: string;
  audioFileSize?: number;
}

export default function MyTelecastPodcastsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<TelecastPodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchTelecastPodcasts();
  }, []);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = (podcast: TelecastPodcast) => {
    if (!podcast.audioFileData) {
      alert('No audio file available for this podcast');
      return;
    }

    // If the same podcast is already playing, pause it
    if (currentlyPlaying === podcast.id) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setCurrentlyPlaying(null);
      } catch (error) {
        // Silently handle pause errors
        console.log('Pause action completed');
        setCurrentlyPlaying(null);
      }
      return;
    }

    // If a different podcast is playing, stop it first and clean up
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.removeEventListener('ended', onEnded);
        audioRef.current.removeEventListener('error', onError);
      } catch (error) {
        // Silently handle stop errors
        console.log('Previous audio stopped');
      }
      audioRef.current = null;
    }

    // Define event handlers so we can remove them later
    function onEnded() {
      setCurrentlyPlaying(null);
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', onEnded);
        audioRef.current.removeEventListener('error', onError);
      }
    }
    function onError(e: Event) {
      console.error('Audio playback error:', e);
      setCurrentlyPlaying(null);
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', onEnded);
        audioRef.current.removeEventListener('error', onError);
      }
    }

    // Create new audio element and play the selected podcast
    const audio = new Audio(podcast.audioFileData);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    audio.play().then(() => {
      audioRef.current = audio;
      setCurrentlyPlaying(podcast.id);
    }).catch((error) => {
      console.error('Error playing audio:', error);
      if (error.name !== 'AbortError') {
        alert('Error playing audio file');
      }
      setCurrentlyPlaying(null);
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', onEnded);
        audioRef.current.removeEventListener('error', onError);
      }
    });
  };

  const handleStop = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('error', () => {});
        audioRef.current = null;
      }
      setCurrentlyPlaying(null);
    } catch (error) {
      // Silently handle any errors during stop
      console.log('Stop action completed');
      setCurrentlyPlaying(null);
      if (audioRef.current) {
        audioRef.current = null;
      }
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

  // Group podcasts by title
  const groupedPodcasts = podcasts.reduce((acc, podcast) => {
    if (!acc[podcast.title]) acc[podcast.title] = [];
    acc[podcast.title].push(podcast);
    return acc;
  }, {} as Record<string, TelecastPodcast[]>);

  // Add shareEpisode function
  const shareEpisode = (podcast: TelecastPodcast) => {
    const shareUrl = `${window.location.origin}/my-telecast-podcasts?episode=${podcast.id}`;
    const shareText = `Check out my podcast episode: ${podcast.episodeTitle}`;
    if (navigator.share) {
      navigator.share({
        title: podcast.title,
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      });
    }
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
        background: theme.palette.mode === 'dark' ? '#0a0a0f' : '#f8fafc',
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
              color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.main,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
            }}
          >
            My Telecast Podcasts
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            mb={3}
            sx={{ 
              fontWeight: 400, 
              maxWidth: 600, 
              mx: 'auto',
              color: theme.palette.mode === 'dark' ? '#a0a0a0' : theme.palette.text.secondary
            }}
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
          <Box sx={{ textAlign: 'center', py: 10 }}>
            {/* Custom SVG illustration */}
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 24 }}>
              <circle cx="60" cy="60" r="56" fill={theme.palette.mode === 'dark' ? '#2d3748' : theme.palette.primary.light} fillOpacity={theme.palette.mode === 'dark' ? 0.3 : 0.15} />
              <rect x="30" y="50" width="60" height="30" rx="8" fill={theme.palette.primary.main} fillOpacity={theme.palette.mode === 'dark' ? 0.4 : 0.2} />
              <rect x="45" y="60" width="30" height="10" rx="3" fill={theme.palette.primary.main} fillOpacity={theme.palette.mode === 'dark' ? 0.6 : 0.4} />
              <circle cx="60" cy="65" r="6" fill={theme.palette.primary.main} fillOpacity={theme.palette.mode === 'dark' ? 0.9 : 0.7} />
            </svg>
            <Typography variant="h4" fontWeight={700} mb={2} sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit' }}>
              No Podcasts Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4} sx={{ color: theme.palette.mode === 'dark' ? '#a0a0a0' : theme.palette.text.secondary }}>
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
                bgcolor: theme.palette.mode === 'dark' ? '#3b82f6' : theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? '#2563eb' : theme.palette.primary.dark,
                }
              }}
            >
              Start Recording
            </Button>
          </Box>
        ) : (
          <>
            {Object.entries(groupedPodcasts).map(([title, episodes]) => (
              <Card key={title} sx={{
                mb: 6,
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : 4,
                borderRadius: 2,
                background: theme.palette.mode === 'dark' ? '#1a1a2e' : theme.palette.background.paper,
                border: `1px solid ${theme.palette.mode === 'dark' ? '#2d3748' : theme.palette.divider}`,
                transition: 'box-shadow 0.2s',
                '&:hover': { 
                  boxShadow: theme.palette.mode === 'dark' ? '0 8px 30px rgba(0, 0, 0, 0.7)' : 8 
                },
                overflow: 'visible',
              }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: theme.palette.mode === 'dark' ? '#2d3748' : theme.palette.primary.main,
                  color: theme.palette.mode === 'dark' ? '#ffffff' : 'white',
                  px: 4,
                  py: 2.5,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  boxShadow: 1,
                  position: 'relative',
                }}>
                  <Avatar sx={{
                    bgcolor: theme.palette.mode === 'dark' ? '#4a5568' : 'white',
                    color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.main,
                    mr: 3,
                    width: 48,
                    height: 48,
                    fontSize: 28,
                    border: `2px solid ${theme.palette.mode === 'dark' ? '#718096' : theme.palette.primary.light}`,
                    boxShadow: 1,
                  }}>
                    <PodcastIcon fontSize="inherit" />
                  </Avatar>
                  <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: 1 }}>
                    {title}
                  </Typography>
                </Box>
                {/* Podcast Description below header, only once per group */}
                {episodes[0]?.description && (
                  <Box sx={{ 
                    px: 4, 
                    py: 2, 
                    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#2d3748' : theme.palette.divider}`,
                    bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : 'transparent'
                  }}>
                    <Typography variant="body1" color="text.secondary" fontStyle="italic" sx={{ color: theme.palette.mode === 'dark' ? '#a0a0a0' : theme.palette.text.secondary }}>
                      {episodes[0].description}
                    </Typography>
                  </Box>
                )}
                <List disablePadding sx={{ px: { xs: 0, sm: 2 }, py: 2 }}>
                  {episodes.map((podcast, idx) => (
                    <Box key={podcast.id} sx={{ display: 'flex', alignItems: 'stretch', position: 'relative' }}>
                      {/* Timeline dot and connector */}
                      <Box sx={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 32, pt: 2
                      }}>
                        <TimelineDot sx={{ 
                          bgcolor: theme.palette.mode === 'dark' ? '#4a5568' : theme.palette.grey[400], 
                          width: 12, 
                          height: 12, 
                          boxShadow: 1 
                        }} />
                        {idx < episodes.length - 1 && <TimelineConnector sx={{ 
                          bgcolor: theme.palette.mode === 'dark' ? '#2d3748' : theme.palette.grey[200], 
                          width: 3, 
                          flex: 1, 
                          minHeight: 28, 
                          borderRadius: 2 
                        }} />}
                      </Box>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : 'white',
                          border: `1px solid ${theme.palette.mode === 'dark' ? '#2d3748' : theme.palette.divider}`,
                          boxShadow: currentlyPlaying === podcast.id ? (theme.palette.mode === 'dark' ? '0 4px 20px rgba(59, 130, 246, 0.3)' : 2) : 0,
                          borderLeft: currentlyPlaying === podcast.id ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                          transition: 'box-shadow 0.2s, border 0.2s',
                          py: 2.5,
                          px: { xs: 1, sm: 3 },
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          gap: 2,
                          borderRadius: 2,
                          mt: 0,
                          mb: 2,
                          width: '100%',
                          position: 'relative',
                          '&:hover': { 
                            boxShadow: theme.palette.mode === 'dark' ? '0 6px 25px rgba(0, 0, 0, 0.4)' : 4, 
                            borderColor: theme.palette.primary.light 
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? '#4a5568' : theme.palette.grey[200], 
                            borderRadius: 2, 
                            width: 36, 
                            height: 36,
                            color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                          }}>
                            <PodcastIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography fontWeight={800} fontSize={18} sx={{ 
                            wordBreak: 'break-word', 
                            mb: 0.5,
                            color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                          }}>{podcast.episodeTitle}</Typography>
                          <Box sx={{
                            display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', minWidth: 0, mb: 0.5,
                          }}>
                            {podcast.episodeDescription && (
                              <Tooltip title="Episode Description"><Chip icon={<DescriptionIcon />} label={podcast.episodeDescription} color="default" variant="outlined" sx={{ 
                                borderColor: theme.palette.mode === 'dark' ? '#4a5568' : undefined,
                                color: theme.palette.mode === 'dark' ? '#a0a0a0' : undefined
                              }} /></Tooltip>
                            )}
                            {podcast.author && (
                              <Tooltip title="Author"><Chip icon={<PersonIcon />} label={podcast.author} color="default" variant="outlined" sx={{ 
                                borderColor: theme.palette.mode === 'dark' ? '#4a5568' : undefined,
                                color: theme.palette.mode === 'dark' ? '#a0a0a0' : undefined
                              }} /></Tooltip>
                            )}
                            {podcast.language && (
                              <Tooltip title="Language"><Chip icon={<LanguageIcon />} label={podcast.language} color="info" variant="outlined" sx={{ 
                                borderColor: theme.palette.mode === 'dark' ? '#3182ce' : undefined,
                                color: theme.palette.mode === 'dark' ? '#63b3ed' : undefined
                              }} /></Tooltip>
                            )}
                            {podcast.category && (
                              <Tooltip title="Category"><Chip icon={<CategoryIcon />} label={podcast.category} color="secondary" variant="outlined" sx={{ 
                                borderColor: theme.palette.mode === 'dark' ? '#805ad5' : undefined,
                                color: theme.palette.mode === 'dark' ? '#b794f4' : undefined
                              }} /></Tooltip>
                            )}
                            {typeof podcast.explicit === 'boolean' && podcast.explicit !== null && (
                              <Tooltip title="Explicit Content"><Chip icon={<ExplicitIcon />} label={podcast.explicit ? 'Explicit' : 'Clean'} color={podcast.explicit ? 'warning' : 'success'} variant="outlined" sx={{ 
                                borderColor: theme.palette.mode === 'dark' ? (podcast.explicit ? '#d69e2e' : '#38a169') : undefined,
                                color: theme.palette.mode === 'dark' ? (podcast.explicit ? '#f6e05e' : '#68d391') : undefined
                              }} /></Tooltip>
                            )}
                            {podcast.episodeType && (
                              <Tooltip title="Episode Type"><Chip icon={<TypeSpecimenIcon />} label={podcast.episodeType} color="primary" variant="outlined" sx={{ 
                                borderColor: theme.palette.mode === 'dark' ? '#3182ce' : undefined,
                                color: theme.palette.mode === 'dark' ? '#63b3ed' : undefined
                              }} /></Tooltip>
                            )}
                            {podcast.episodeNumber && (
                              <Tooltip title="Episode Number"><Chip icon={<NumbersIcon />} label={`Ep. ${podcast.episodeNumber}`} color="default" variant="outlined" sx={{ 
                                borderColor: theme.palette.mode === 'dark' ? '#4a5568' : undefined,
                                color: theme.palette.mode === 'dark' ? '#a0a0a0' : undefined
                              }} /></Tooltip>
                            )}
                            {podcast.pubDate && (
                              <Tooltip title="Publication Date"><Chip icon={<EventIcon />} label={formatDate(podcast.pubDate)} color="default" variant="outlined" sx={{ 
                                borderColor: theme.palette.mode === 'dark' ? '#4a5568' : undefined,
                                color: theme.palette.mode === 'dark' ? '#a0a0a0' : undefined
                              }} /></Tooltip>
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            mt: 0.5,
                            color: theme.palette.mode === 'dark' ? '#718096' : theme.palette.text.secondary
                          }}>{formatDate(podcast.publishedAt || podcast.createdAt)}</Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1.5,
                            alignItems: 'center',
                            mt: { xs: 2, sm: 0 },
                            ml: { xs: 0, sm: 2 },
                            width: { xs: '100%', sm: 'auto' },
                            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                          }}
                        >
                          <Tooltip title={currentlyPlaying === podcast.id ? 'Pause' : 'Play'}>
                            <IconButton
                              color={currentlyPlaying === podcast.id ? 'primary' : 'default'}
                              onClick={() => handlePlay(podcast)}
                              disabled={!podcast.audioFileData}
                              sx={{
                                bgcolor: currentlyPlaying === podcast.id ? (theme.palette.mode === 'dark' ? '#2b6cb0' : theme.palette.primary.light) : 'transparent',
                                color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                                boxShadow: currentlyPlaying === podcast.id ? 2 : 0,
                                transition: 'all 0.2s',
                                '&:hover': { 
                                  bgcolor: theme.palette.mode === 'dark' ? '#3182ce' : theme.palette.primary.main, 
                                  color: 'white', 
                                  transform: 'scale(1.08)' 
                                },
                                '&:disabled': {
                                  color: theme.palette.mode === 'dark' ? '#4a5568' : undefined
                                }
                              }}
                            >
                              {currentlyPlaying === podcast.id ? <PauseIcon /> : <PlayIcon />}
                            </IconButton>
                          </Tooltip>
                          {currentlyPlaying === podcast.id && (
                            <Tooltip title="Stop playback">
                              <IconButton onClick={handleStop} color="default" sx={{ 
                                transition: 'all 0.2s', 
                                color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                                '&:hover': { 
                                  bgcolor: theme.palette.mode === 'dark' ? '#c53030' : theme.palette.error.light, 
                                  color: 'white', 
                                  transform: 'scale(1.08)' 
                                } 
                              }}>
                                <StopIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Share">
                            <IconButton onClick={() => shareEpisode(podcast)} color="default" sx={{ 
                              transition: 'all 0.2s',
                              color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                              '&:hover': { 
                                bgcolor: theme.palette.mode === 'dark' ? '#805ad5' : theme.palette.secondary.light, 
                                color: 'white', 
                                transform: 'scale(1.08)' 
                              } 
                            }}>
                              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 5l5 5-5 5M20 10H9a6 6 0 100 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </Card>
            ))}
          </>
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
              bgcolor: theme.palette.mode === 'dark' ? '#3b82f6' : theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? '#2563eb' : theme.palette.primary.dark,
              }
            }}
          >
            Record New Episode
          </Button>
        </Box>
      </Box>
    </Box>
  );
} 