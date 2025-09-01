'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Radio as RadioIcon,
} from '@mui/icons-material';
import { useAudio } from '@/contexts/AudioContext';
import { enqueueSnackbar } from 'notistack';

interface Episode {
  id: string;
  title: string | null;
  description: string | null;
  audioUrl: string;
  isFinal: boolean;
  isPublished: boolean;
  duration: number | null;
  fileSize: number | null;
  episodeNumber?: number | null;
  seasonNumber?: number | null;
  keywords: string[];
  explicit: boolean;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  publishDate: Date | null;
}

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  author: string;
}

export default function EpisodeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const podcastId = params.id as string;
  const episodeId = params.episodeId as string;
  const { play, pause, isPlaying, currentEpisode } = useAudio();
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuickBroadcasting, setIsQuickBroadcasting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/podcast/internal/${podcastId}/episode/${episodeId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch episode');
        }
        
        const episodeData = await response.json();
        setEpisode(episodeData);
        
        // Fetch podcast info
        const podcastResponse = await fetch(`/api/podcast/internal/${podcastId}`);
        if (podcastResponse.ok) {
          const podcastData = await podcastResponse.json();
          setPodcast(podcastData);
        }
        
      } catch (error) {
        console.error('Error fetching episode:', error);
        setError('Failed to load episode');
      } finally {
        setLoading(false);
      }
    };

    if (podcastId && episodeId) {
      fetchEpisode();
    }
  }, [podcastId, episodeId]);

  const handlePlayEpisode = async () => {
    if (!episode || !podcast) return;

    // Convert to AudioContext format
    const audioContextEpisode = {
      id: episode.id,
      title: episode.title || 'Untitled Episode',
      description: episode.description || '',
      audioUrl: episode.audioUrl,
      duration: episode.duration || 0,
      publishDate: episode.publishDate?.toISOString() || new Date().toISOString(),
    };

    const audioContextPodcast = {
      id: podcast.id,
      title: podcast.title,
      author: podcast.author,
      description: podcast.description || '',
      image: podcast.coverImage || '',
      url: '',
    };

    // If it's the same episode that's currently playing, pause it
    if (currentEpisode?.id === episode.id && isPlaying) {
      pause();
      return;
    }

    // Play the episode using AudioContext
    try {
      await play(audioContextPodcast, audioContextEpisode);
    } catch (error) {
      console.error('Error playing episode:', error);
      enqueueSnackbar('Failed to play episode', { variant: 'error' });
    }
  };

  const handleQuickBroadcast = async () => {
    try {
      setIsQuickBroadcasting(true);
      
      const response = await fetch('/api/broadcast/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          episodeId,
          useRememberedPlatforms: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        enqueueSnackbar('Episode broadcasted successfully!', { variant: 'success' });
      } else {
        throw new Error('Broadcast failed');
      }
    } catch (error) {
      console.error('Error broadcasting episode:', error);
      enqueueSnackbar('Failed to broadcast episode', { variant: 'error' });
    } finally {
      setIsQuickBroadcasting(false);
    }
  };

  const handleDeleteEpisode = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEpisode = async () => {
    if (!episode) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/podcast/internal/${podcastId}/episode/${episode.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete episode');
      }

      enqueueSnackbar('Episode deleted successfully', { variant: 'success' });
      router.push(`/podcast/${podcastId}`);
    } catch (error) {
      console.error('Error deleting episode:', error);
      enqueueSnackbar('Failed to delete episode', { variant: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const cancelDeleteEpisode = () => {
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !episode) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error">
          {error || 'Episode not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/podcast/${podcastId}`)}
        >
          Back to Podcast
        </Button>
        <Typography variant="h4" component="h1">
          Episode Details
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Episode Info Card */}
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" gutterBottom>
                {episode.title || 'Untitled Episode'}
              </Typography>
              {episode.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {episode.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip 
                  label={episode.isPublished ? 'Published' : 'Draft'} 
                  color={episode.isPublished ? 'success' : 'warning'}
                  size="small"
                />
                {episode.explicit && (
                  <Chip label="Explicit" color="error" size="small" />
                )}
              </Box>
            </Box>
            
            {/* Action Buttons */}
            <Stack direction="row" spacing={1}>
              <Tooltip title={currentEpisode?.id === episode.id && isPlaying ? 'Pause' : 'Play'}>
                <IconButton
                  onClick={handlePlayEpisode}
                  color="primary"
                  size="large"
                >
                  {currentEpisode?.id === episode.id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </Tooltip>
              
              {episode.isPublished && (
                <Tooltip title="Quick Broadcast">
                  <IconButton
                    onClick={handleQuickBroadcast}
                    disabled={isQuickBroadcasting}
                    color="primary"
                  >
                    {isQuickBroadcasting ? <CircularProgress size={20} /> : <RadioIcon />}
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title="Edit Episode">
                <IconButton
                  onClick={() => router.push(`/podcast/${podcastId}/episode/${episode.id}/finalize`)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete Episode">
                <IconButton
                  onClick={handleDeleteEpisode}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          

                     <Divider sx={{ my: 3 }} />

           {/* Episode Metadata */}
           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
             <Box>
               <Stack spacing={1}>
                 {episode.episodeNumber && (
                   <Typography variant="body2">
                     <strong>Episode Number:</strong> {episode.episodeNumber}
                   </Typography>
                 )}
                 {episode.seasonNumber && (
                   <Typography variant="body2">
                     <strong>Season Number:</strong> {episode.seasonNumber}
                   </Typography>
                 )}
                 <Typography variant="body2">
                   <strong>Duration:</strong> {episode.duration ? `${Math.floor(episode.duration / 60)}:${(episode.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}
                 </Typography>
               </Stack>
             </Box>

             <Box>
               <Stack spacing={1}>
                 <Typography variant="body2">
                   <strong>Created:</strong> {new Date(episode.createdAt).toLocaleDateString('en-US', {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric',
                     hour: '2-digit',
                     minute: '2-digit'
                   })}
                 </Typography>
                 <Typography variant="body2">
                   <strong>Updated:</strong> {new Date(episode.updatedAt).toLocaleDateString('en-US', {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric',
                     hour: '2-digit',
                     minute: '2-digit'
                   })}
                 </Typography>
                 {episode.publishDate && (
                   <Typography variant="body2">
                     <strong>Published:</strong> {new Date(episode.publishDate).toLocaleDateString('en-US', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit'
                     })}
                   </Typography>
                 )}
               </Stack>
             </Box>
           </Box>

           {/* Keywords */}
          {episode.keywords && episode.keywords.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {episode.keywords.map((keyword) => (
                  <Chip
                    key={keyword}
                    label={keyword}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          display: deleteDialogOpen ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={cancelDeleteEpisode}
      >
        <Paper
          sx={{ p: 4, maxWidth: 400, mx: 2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Typography variant="h6" gutterBottom>
            Delete Episode
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Are you sure you want to delete "{episode.title || 'Untitled Episode'}"? 
            This action cannot be undone and will permanently remove the episode.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={cancelDeleteEpisode} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteEpisode} 
              color="error" 
              variant="contained"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
} 