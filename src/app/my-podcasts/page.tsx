'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  List as ListIcon,
  Visibility as PublishIcon,
  VisibilityOff as UnpublishIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface Podcast {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  tags: string[];
  createdAt: string;
  published: boolean;
}

function MyPodcastsContent() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      fetchPodcasts();
    }
  }, [isLoading, user]);

  // Refresh podcasts when navigating back to this page
  useEffect(() => {
    const handleRouteChange = () => {
      if (user) {
        fetchPodcasts();
      }
    };

    // Refresh on mount and when the page becomes visible
    handleRouteChange();
    
    // Also refresh when the window gains focus (e.g., after navigation back)
    const handleFocus = () => {
      if (user) {
        fetchPodcasts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const fetchPodcasts = async () => {
    try {
      const response = await fetch('/api/podcast/internal');
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
      const response = await fetch(`/api/podcast/internal/${selectedPodcast.id}`, {
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





  // Removed inline audio preview for podcasts listing

  if (isLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
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
          onClick={() => {
            console.log('Create New Podcast button clicked');
            router.push('/my-podcasts/create');
          }}
          sx={{
            backgroundColor: '#2563eb',
            borderRadius: '8px',
            px: 4,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#1d4ed8',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          Create New Podcast
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
                image={podcast.coverImage}
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
                    <IconButton onClick={() => router.push(`/podcast/${podcast.id}`)} color="primary">
                      <ListIcon />
                    </IconButton>
                    <IconButton onClick={() => { setSelectedPodcast(podcast); setDeleteDialogOpen(true); }} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>





      {/* Delete Podcast Dialog */}
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

export default function MyPodcasts() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <MyPodcastsContent />
    </Suspense>
  )
}
