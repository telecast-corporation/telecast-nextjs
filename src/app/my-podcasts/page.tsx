'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Podcast {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  audioUrl: string;
  createdAt: string;
}

export default function MyPodcasts() {
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const response = await fetch('/api/podcast/my-podcasts');
      if (!response.ok) {
        throw new Error('Failed to fetch podcasts');
      }
      const data = await response.json();
      setPodcasts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPodcast) return;

    try {
      const response = await fetch(`/api/podcast/${selectedPodcast.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete podcast');
      }

      setPodcasts(podcasts.filter(p => p.id !== selectedPodcast.id));
      setDeleteDialogOpen(false);
      setSelectedPodcast(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete podcast');
    }
  };

  const handlePlay = (podcast: Podcast) => {
    if (currentlyPlaying === podcast.id) {
      audioRef.current?.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(podcast.audioUrl);
      audioRef.current.play();
      setCurrentlyPlaying(podcast.id);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          My Podcasts
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#6c757d',
            maxWidth: '600px',
            mx: 'auto',
            mb: 4,
          }}
        >
          Manage your podcast episodes
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/upload')}
          sx={{
            backgroundColor: '#2196F3',
            '&:hover': {
              backgroundColor: '#1976D2',
            },
          }}
        >
          Upload New Podcast
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {podcasts.map((podcast) => (
          <Grid item xs={12} sm={6} md={4} key={podcast.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={podcast.imageUrl}
                alt={podcast.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {podcast.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {podcast.description}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(podcast.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box>
                    <IconButton
                      onClick={() => handlePlay(podcast)}
                      color="primary"
                    >
                      {currentlyPlaying === podcast.id ? <PauseIcon /> : <PlayIcon />}
                    </IconButton>
                    <IconButton
                      onClick={() => router.push(`/edit-podcast/${podcast.id}`)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedPodcast(podcast);
                        setDeleteDialogOpen(true);
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Podcast</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedPodcast?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 