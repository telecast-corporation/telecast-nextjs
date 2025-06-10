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
                <Typography variant="h6" color="text.secondary">
                  {music.artist.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlbumIcon color="action" />
                <Typography color="text.secondary">
                  Album: {music.album.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon color="action" />
                <Typography color="text.secondary">
                  Duration: {music.duration}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon color="action" />
                <Typography color="text.secondary">
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
                {music.previewUrl ? (
                  <Button
                    variant="contained"
                    onClick={handlePlayPause}
                    startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                  >
                    {isPlaying ? 'Pause' : 'Play Preview'}
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MusicIcon color="action" />
                    <Typography color="text.secondary" variant="body2">
                      Preview not available for this track
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Related Tracks */}
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
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
                    sx={{ width: 56, height: 56 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={track.title}
                  secondary={track.artist}
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