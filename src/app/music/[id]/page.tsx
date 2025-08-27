'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Rating,
  Paper,
  Button,
  IconButton,
} from '@mui/material';
import {
  Album as AlbumIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  MusicNote as MusicIcon,
  Person as PersonIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Headphones as HeadphonesIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface MusicDetails {
  id: string;
  title: string;
  artist: {
    name: string;
    image: string;
    genres: string[];
  };
  album: {
    name: string;
    image: string;
    releaseDate: string;
  };
  duration: string;
  popularity: number;
  previewUrl: string | null;
  previewOptions?: {
    type: string;
    url: string;
    label: string;
    duration: string;
    source: string;
  }[];
  hasPreview?: boolean;
  relatedTracks: {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
  }[];
}

export default function MusicPage() {
  const params = useParams();
  const router = useRouter();
  const [music, setMusic] = useState<MusicDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'spotify' | 'youtube'>('spotify');
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchMusicDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/music/${params.id}`);
        console.log('Music details:', {
          id: response.data.id,
          title: response.data.title,
          previewUrl: response.data.previewUrl,
          hasPreview: !!response.data.previewUrl
        });
        setMusic(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching music details:', err);
        const errorMessage = err.response?.data?.error || 'Failed to load music details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMusicDetails();
    }
  }, [params.id]);

  // Fetch YouTube video ID when platform changes to YouTube
  useEffect(() => {
    const fetchYoutubeVideo = async () => {
      if (selectedPlatform === 'youtube' && music) {
        try {
          const response = await axios.get('/api/video', {
            params: {
              q: `${music.artist.name} - ${music.title} official audio`,
              type: 'video'
            }
          });
          if (response.data.videoId) {
            setYoutubeVideoId(response.data.videoId);
          }
        } catch (err) {
          console.error('Error fetching YouTube video:', err);
          // Fallback to music video search if audio search fails
          try {
            const fallbackResponse = await axios.get('/api/video', {
              params: {
                q: `${music.artist.name} - ${music.title} official music video`,
                type: 'video'
              }
            });
            if (fallbackResponse.data.videoId) {
              setYoutubeVideoId(fallbackResponse.data.videoId);
            }
          } catch (fallbackErr) {
            console.error('Error fetching fallback YouTube video:', fallbackErr);
          }
        }
      }
    };

    fetchYoutubeVideo();
  }, [selectedPlatform, music]);

  const handleTrackClick = (trackId: string) => {
    router.push(`/music/${trackId}`);
  };

  const handlePlayPause = () => {
    if (!music?.previewUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(music.previewUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !music) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Music not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <CardMedia
              component="img"
              image={music.album.image}
              alt={music.title}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3,
                objectFit: 'cover',
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {music.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="action" />
                <Typography variant="body1" color="text.secondary" sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                  lineHeight: 1.4
                }}>
                  {music.artist.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlbumIcon color="action" />
                <Typography variant="body1" color="text.secondary" sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                  lineHeight: 1.4
                }}>
                  Album: {music.album.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon color="action" />
                <Typography variant="body1" color="text.secondary" sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                  lineHeight: 1.4
                }}>
                  Duration: {music.duration}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon color="action" />
                <Typography variant="body1" color="text.secondary" sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                  lineHeight: 1.4
                }}>
                  Popularity: {music.popularity}/100
                </Typography>
              </Box>
              {music.artist.genres.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {music.artist.genres.map((genre) => (
                    <Chip key={genre} label={genre} />
                  ))}
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                {music.previewOptions && music.previewOptions.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Spotify Preview Button (if available) */}
                    {music.previewUrl && (
                      <Button
                        variant="contained"
                        onClick={handlePlayPause}
                        startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        {isPlaying ? 'Pause' : 'Play Preview (30s)'}
                      </Button>
                    )}
                    
                    {/* Other listening options */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                        fontWeight: 500,
                        mb: 1
                      }}>
                        Listen on:
                      </Typography>
                      {music.previewOptions.map((option, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(option.url, '_blank')}
                          startIcon={<PlayIcon />}
                          sx={{ 
                            alignSelf: 'flex-start',
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            py: 0.5,
                            px: 2
                          }}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MusicIcon color="action" />
                    <Typography color="text.secondary" variant="body2" sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }
                    }}>
                      Preview not available for this track
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Spotify Embed Player */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <HeadphonesIcon color="primary" />
          <Typography variant="h6" component="h2">
            Listen to Full Song
          </Typography>
        </Box>
        
        {/* Platform Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
            mb: 2
          }}>
            Choose your preferred platform:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => setSelectedPlatform('spotify')}
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                bgcolor: selectedPlatform === 'spotify' ? 'primary.main' : 'grey.300',
                color: selectedPlatform === 'spotify' ? 'white' : 'text.primary'
              }}
            >
              Spotify
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelectedPlatform('youtube')}
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                borderColor: selectedPlatform === 'youtube' ? 'primary.main' : 'grey.300',
                color: selectedPlatform === 'youtube' ? 'primary.main' : 'text.primary'
              }}
            >
              YouTube Music
            </Button>
          </Box>
        </Box>
        
        {/* Spotify Embed */}
        {selectedPlatform === 'spotify' && (
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '352px',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <iframe
              src={`https://open.spotify.com/embed/track/${music.id}?utm_source=generator&theme=0`}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{
                border: 'none',
                borderRadius: '8px'
              }}
            />
          </Box>
        )}
        
        {/* YouTube Music Embed */}
        {selectedPlatform === 'youtube' && (
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '352px',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {youtubeVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                flexDirection: 'column',
                gap: 2
              }}>
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary">
                  Loading video...
                </Typography>
              </Box>
            )}
          </Box>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
            textAlign: 'center'
          }}>
            Powered by {selectedPlatform === 'spotify' ? 'Spotify' : 'YouTube Music'} • Full track streaming available
          </Typography>
        </Box>
      </Paper>

      {/* Related Tracks */}
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Related Tracks
        </Typography>
        <List>
          {music.relatedTracks.map((track, index) => (
            <React.Fragment key={track.id}>
              <ListItem
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => handleTrackClick(track.id)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={track.thumbnail}
                    alt={track.title}
                    variant="rounded"
                    sx={{ width: 48, height: 48 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography 
                      variant="subtitle2" 
                      component="div"
                      sx={{ 
                        whiteSpace: 'normal',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.2,
                        mb: 0.5,
                        fontSize: { xs: '0.8rem', sm: '0.85rem' }
                      }}
                    >
                      {track.title}
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      component="span"
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        whiteSpace: 'normal',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {track.artist}
                    </Typography>
                  }
                />
              </ListItem>
              {index < music.relatedTracks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
} 