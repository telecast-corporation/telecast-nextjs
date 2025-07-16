'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  List as ListIcon,
  Mic as MicIcon,
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
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { user } = useAuth();
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [newPodcast, setNewPodcast] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    imageFile: null as File | null,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    imageFile: null as File | null,
  });
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    audioFile: null as File | null,
    episodeNumber: '',
    seasonNumber: '',
    keywords: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);


  useEffect(() => {
    if (status === 'authenticated' && user?.id) {
      fetchPodcasts();
    }
  }, [status, user?.id]);



  const fetchPodcasts = async () => {
    try {
      const response = await fetch(`/api/podcasts?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch podcasts');
      const data = await response.json();
      setPodcasts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch podcasts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePodcast = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newPodcast.title);
      formData.append('description', newPodcast.description);
      formData.append('category', newPodcast.category);
      formData.append('tags', newPodcast.tags);
      if (newPodcast.imageFile) {
        formData.append('imageFile', newPodcast.imageFile);
      }

      const response = await fetch('/api/podcasts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create podcast');

      await fetchPodcasts();
      setCreateDialogOpen(false);
      setNewPodcast({
        title: '',
        description: '',
        category: '',
        tags: '',
        imageFile: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create podcast');
    }
  };

  const handleCreateAndRedirect = async (redirectPath: string) => {
    try {
      const formData = new FormData();
      formData.append('title', newPodcast.title);
      formData.append('description', newPodcast.description);
      formData.append('category', newPodcast.category);
      formData.append('tags', newPodcast.tags);
      if (newPodcast.imageFile) {
        formData.append('imageFile', newPodcast.imageFile);
      }

      const response = await fetch('/api/podcasts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create podcast');

      const result = await response.json();
      
      // Store the created podcast ID in sessionStorage for the upload/record pages
      sessionStorage.setItem('newPodcastId', result.id);
      sessionStorage.setItem('newPodcastTitle', newPodcast.title);
      
      setCreateDialogOpen(false);
      setNewPodcast({
        title: '',
        description: '',
        category: '',
        tags: '',
        imageFile: null,
      });
      
      // Redirect to the specified path
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create podcast');
    }
  };

  const handleDeletePodcast = async (podcastId: string) => {
    if (!confirm('Are you sure you want to delete this podcast?')) return;

    try {
      const response = await fetch(`/api/podcasts/${podcastId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete podcast');

      await fetchPodcasts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete podcast');
    }
  };

  const handleUploadEpisode = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setUploadForm({
      title: '',
      description: '',
      audioFile: null,
      episodeNumber: '',
      seasonNumber: '',
      keywords: '',
    });
    setUploadDialogOpen(true);
  };

  const handleEpisodeUpload = async () => {
    if (!selectedPodcast) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('podcastId', selectedPodcast.id);
      if (uploadForm.audioFile) {
        formData.append('audioFile', uploadForm.audioFile);
      }
      if (uploadForm.episodeNumber) {
        formData.append('episodeNumber', uploadForm.episodeNumber);
      }
      if (uploadForm.seasonNumber) {
        formData.append('seasonNumber', uploadForm.seasonNumber);
      }
      if (uploadForm.keywords) {
        formData.append('keywords', uploadForm.keywords);
      }

      const response = await fetch('/api/episodes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload episode');
      }

      setUploadDialogOpen(false);
      setSelectedPodcast(null);
      setUploadForm({
        title: '',
        description: '',
        audioFile: null,
        episodeNumber: '',
        seasonNumber: '',
        keywords: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload episode');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (podcast: Podcast) => {
    setEditingPodcast(podcast);
    setEditForm({
      title: podcast.title,
      description: podcast.description,
      category: podcast.category,
      tags: podcast.tags.join(', '),
      imageFile: null,
    });
    setEditDialogOpen(true);
  };

  const handleEditPodcast = async () => {
    if (!editingPodcast) return;

    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      formData.append('category', editForm.category);
      formData.append('tags', editForm.tags);
      if (editForm.imageFile) {
        formData.append('imageFile', editForm.imageFile);
      }

      const response = await fetch(`/api/podcasts/${editingPodcast.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update podcast');

      await fetchPodcasts();
      setEditDialogOpen(false);
      setEditingPodcast(null);
      setEditForm({
        title: '',
        description: '',
        category: '',
        tags: '',
        imageFile: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update podcast');
    }
  };

  const handlePodcastClick = async (podcast: Podcast) => {
    router.push(`/podcast/${podcast.id}`);
  };

  const handlePlayEpisode = (episode: any) => {
    if (currentlyPlaying === episode.id) {
      // If clicking the currently playing episode, pause it
      if (audioElement) {
        audioElement.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      // If clicking a different episode, stop current and play new one
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(episode.audioUrl);
      audio.play();
      setAudioElement(audio);
      setCurrentlyPlaying(episode.id);

      // Handle audio end
      audio.onended = () => {
        setCurrentlyPlaying(null);
      };
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          My Podcasts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create New Podcast
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {podcasts.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Podcasts Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't created any podcasts yet. Start by creating your first podcast!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Your First Podcast
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {podcasts.map((podcast) => (
            <Grid item xs={12} sm={6} md={4} key={podcast.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
                onClick={() => handlePodcastClick(podcast)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={podcast.coverImage}
                  alt={podcast.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {podcast.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {podcast.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    {podcast.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                </CardContent>
                <CardActions>
                  <Tooltip title="View Episodes">
                    <IconButton onClick={() => handlePodcastClick(podcast)}>
                      <ListIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Podcast">
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(podcast);
                    }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Podcast">
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePodcast(podcast.id);
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}



      {/* Create Podcast Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Podcast</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Podcast Title"
              fullWidth
              value={newPodcast.title}
              onChange={(e) =>
                setNewPodcast({ ...newPodcast, title: e.target.value })
              }
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={newPodcast.description}
              onChange={(e) =>
                setNewPodcast({ ...newPodcast, description: e.target.value })
              }
            />
            <TextField
              select
              label="Category"
              fullWidth
              value={newPodcast.category}
              onChange={(e) =>
                setNewPodcast({ ...newPodcast, category: e.target.value })
              }
            >
              <MenuItem value="Technology">Technology</MenuItem>
              <MenuItem value="Business">Business</MenuItem>
              <MenuItem value="Entertainment">Entertainment</MenuItem>
              <MenuItem value="Education">Education</MenuItem>
              <MenuItem value="News">News</MenuItem>
              <MenuItem value="Sports">Sports</MenuItem>
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Music">Music</MenuItem>
              <MenuItem value="Arts">Arts</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              label="Tags (comma-separated)"
              fullWidth
              value={newPodcast.tags}
              onChange={(e) =>
                setNewPodcast({ ...newPodcast, tags: e.target.value })
              }
              helperText="Enter tags separated by commas"
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload Cover Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  setNewPodcast({
                    ...newPodcast,
                    imageFile: e.target.files?.[0] || null,
                  })
                }
              />
            </Button>
            {newPodcast.imageFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {newPodcast.imageFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePodcast}
            variant="contained"
            disabled={!newPodcast.title || !newPodcast.description || !newPodcast.category}
          >
            Create Podcast
          </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Podcast</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            select
            value={editForm.category}
            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
          >
            <MenuItem value="Technology">Technology</MenuItem>
            <MenuItem value="Business">Business</MenuItem>
            <MenuItem value="Education">Education</MenuItem>
            <MenuItem value="Entertainment">Entertainment</MenuItem>
            <MenuItem value="News">News</MenuItem>
            <MenuItem value="Sports">Sports</MenuItem>
            <MenuItem value="Health">Health</MenuItem>
            <MenuItem value="Science">Science</MenuItem>
            <MenuItem value="Arts">Arts</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Tags (comma-separated)"
            fullWidth
            value={editForm.tags}
            onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
          />
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadIcon />}
            sx={{ mt: 2 }}
          >
            Change Cover Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setEditForm({ ...editForm, imageFile: file });
                }
              }}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditPodcast} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 