'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Pagination,
  Stack,
  ListItemSecondaryAction,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  PlayArrow,
  Language,
  Category,
  Warning,
  Link as LinkIcon,
  Pause as PauseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Mic as MicIcon,
  Upload as UploadIcon,
  Radio as RadioIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAudio } from '@/contexts/AudioContext';
import { useAudioUrl } from '@/hooks/useAudioUrl';
import { enqueueSnackbar } from 'notistack';

// Define the database episode type
interface DatabaseEpisode {
  id: string;
  title: string | null;
  description: string | null;
  audioUrl: string;
  duration: number | null;
  publishDate: Date | null;
  episodeNumber?: number | null;
  seasonNumber?: number | null;
  explicit: boolean;
  keywords: string[];
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  isFinal: boolean;
  isPublished: boolean;
  fileSize: number | null;
}

// Define the database podcast type
interface DatabasePodcast {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  userId: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  tags: string[];
  category: string;
  language: string;
  explicit: boolean;
  copyright: string | null;
  website: string | null;
  rssFeed: string | null;
  isPublic: boolean;
  episodes: DatabaseEpisode[];
}
import { formatDuration, formatDate } from '@/lib/utils';
import axios from 'axios';

export default function PodcastPage() {
  const params = useParams();
  const router = useRouter();
  const { play, pause, isPlaying, currentEpisode } = useAudio();
  const [podcast, setPodcast] = useState<DatabasePodcast | null>(null);
  const [episodes, setEpisodes] = useState<DatabaseEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 10;

  const [isQuickBroadcasting, setIsQuickBroadcasting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<DatabaseEpisode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setLoading(true);
        const podcastId = params.id as string;
        
        const response = await axios.get(`/api/podcast/internal/${podcastId}`);
        
        if (response.data) {
          console.log('Podcast data received:', {
            id: response.data.id,
            title: response.data.title,
            coverImage: response.data.coverImage
          });
          console.log('Episodes data:', response.data.episodes);
          setPodcast(response.data);
          setEpisodes(response.data.episodes || []);
        } else {
          setError('Podcast not found');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to load podcast');
        } else {
          setError('Failed to load podcast');
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPodcast();
    }
  }, [params.id]);



  const handleDeleteEpisode = (episode: DatabaseEpisode) => {
    setEpisodeToDelete(episode);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEpisode = async () => {
    if (!episodeToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/podcast/internal/${params.id}/episode/${episodeToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete episode');
      }

      // Remove episode from local state
      setEpisodes(episodes.filter(ep => ep.id !== episodeToDelete.id));
      
      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setEpisodeToDelete(null);
      
      // Show success message
      enqueueSnackbar('Episode deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting episode:', error);
      enqueueSnackbar('Failed to delete episode', { variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteEpisode = () => {
    setDeleteDialogOpen(false);
    setEpisodeToDelete(null);
  };

  const handlePlayEpisode = async (episode: DatabaseEpisode) => {
    if (!episode.audioUrl) {
      console.error('No audio file path available for episode:', episode.id);
      alert('Audio file not available for this episode');
      return;
    }

    // Convert database episode to AudioContext episode format
    const audioContextEpisode = {
      id: episode.id,
      title: episode.title || 'Untitled Episode',
      description: episode.description || '',
      audioUrl: episode.audioUrl,
      duration: episode.duration || 0,
      publishDate: episode.publishDate?.toISOString() || new Date().toISOString(),
    };

    // Convert database podcast to AudioContext podcast format
    const audioContextPodcast = {
      id: podcast?.id || '',
      title: podcast?.title || '',
      author: podcast?.author || '',
      description: podcast?.description || '',
      image: podcast?.coverImage || '',
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
      alert('Failed to play episode');
    }
  };

  // Function to strip HTML tags and decode HTML entities
  const cleanDescription = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Calculate pagination
  const indexOfLastEpisode = currentPage * episodesPerPage;
  const indexOfFirstEpisode = indexOfLastEpisode - episodesPerPage;
  // Separate published and draft episodes
  const publishedEpisodes = episodes.filter(episode => episode.isPublished);
  const draftEpisodes = episodes.filter(episode => !episode.isPublished);
  
  const currentEpisodes = publishedEpisodes.slice(indexOfFirstEpisode, indexOfLastEpisode);
  const totalPages = Math.ceil(publishedEpisodes.length / episodesPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    // Scroll to episodes section
    const episodesSection = document.getElementById('episodes-section');
    if (episodesSection) {
      episodesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickBroadcast = async (episodeId: string) => {
    try {
      setIsQuickBroadcasting(episodeId);
      
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
        
        // Show success message with platform results
        const successfulPlatforms = Object.entries(result.results)
          .filter(([platform, res]) => res && (res as any).success)
          .map(([platform]) => platform);
        
        if (successfulPlatforms.length > 0) {
          alert(`Successfully broadcast to: ${successfulPlatforms.join(', ')}`);
        } else {
          alert('Broadcast completed but no platforms were successfully updated.');
        }
      } else {
        const error = await response.json();
        alert(`Broadcast failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Quick broadcast error:', error);
      alert('Failed to perform quick broadcast');
    } finally {
      setIsQuickBroadcasting(null);
    }
  };

  if (loading) {
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



  if (error || !podcast) {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" color="error">
          {error || 'Podcast not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Podcast Header Card */}
      <Card sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
            <CardMedia
              component="img"
              image={podcast.coverImage || 'https://via.placeholder.com/200x200?text=No+Cover+Image'}
              alt={podcast.title}
              sx={{ width: 200, height: 200, borderRadius: 2, mb: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              {podcast.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {podcast.author}
            </Typography>
            <Typography 
              variant="body1" 

              sx={{ 
                mt: 2, 
                mb: 2, 
                maxWidth: 600,
                fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                lineHeight: 1.4,
                color: 'text.secondary'
              }}
            >
              {cleanDescription(podcast.description || '')}
            </Typography>
          </Box>

          {/* Podcast Details */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {podcast.explicit && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <Warning color="warning" />
                  <Typography variant="body2">Explicit Content</Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Category */}
          {podcast.category && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Category
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip
                  label={podcast.category}
                  size="small"
                  sx={{ 
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    }
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Tags */}
          {podcast.tags && podcast.tags.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {podcast.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderColor: 'secondary.main',
                      color: 'secondary.main',
                      '&:hover': {
                        backgroundColor: 'secondary.light',
                        color: 'secondary.contrastText',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Episodes Section */}
      <Box id="episodes-section">
        {/* Draft Episodes Section */}
        {draftEpisodes.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="warning.main">
              Draft Episodes ({draftEpisodes.length})
            </Typography>
            <Card>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {draftEpisodes.map((episode, index) => (
                  <ListItem
                    key={episode.id}
                    disablePadding
                    divider={index < draftEpisodes.length - 1}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemButton
                      onClick={() => router.push(`/podcast/${podcast.id}/episode/${episode.id}/finalize`)}
                      sx={{
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle1"
                              component="div"
                              sx={{
                                fontWeight: 500,
                                color: 'text.primary',
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                lineHeight: 1.2,
                                mb: 0.5
                              }}
                            >
                              {episode.title || 'Untitled Episode'}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography 
                                variant="body2" 
                                component="span"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              >
                                Draft • {new Date(episode.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </Typography>
                              {episode.fileSize && (
                                <Typography 
                                  variant="body2" 
                                  component="span"
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, ml: 1 }}
                                >
                                  • {(episode.fileSize / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                              )}
                            </>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title="Finalize Episode">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/podcast/${podcast.id}/episode/${episode.id}/finalize`);
                              }}
                              sx={{
                                color: 'warning.main',
                                '&:hover': {
                                  backgroundColor: 'warning.light',
                                }
                              }}
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Episode">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEpisode(episode);
                              }}
                              sx={{
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'error.light',
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Card>
          </Box>
        )}

        {/* Published Episodes Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 0 }}>
            Published Episodes ({publishedEpisodes.length})
          </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ minWidth: 'auto' }}
            onClick={() => router.push(`/podcast/${podcast?.id}/episode/new/edit`)}
            >
              Add Episode
            </Button>
        </Box>
        
        {publishedEpisodes.length === 0 && draftEpisodes.length === 0 ? (
          <Card>
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No episodes yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start building your podcast by creating your first episode
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push(`/podcast/${podcast.id}/episode/new/edit`)}
                  >
                  Add Episode
                  </Button>
              </Box>
            </Box>
          </Card>
        ) : (
          <Card>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {currentEpisodes.map((episode, index) => (
                <ListItem
                  key={episode.id}
                  disablePadding
                  divider={index < currentEpisodes.length - 1}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemButton
                    onClick={() => handlePlayEpisode(episode)}
                    sx={{
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <IconButton
                        size="small"
                        sx={{
                          mr: 1,
                          color: 'primary.main',
                        }}
                      >
                        {currentEpisode?.id === episode.id && isPlaying ? <PauseIcon /> : <PlayArrow />}
                      </IconButton>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            component="div"
                            sx={{
                              fontWeight: 500,
                              color: 'text.primary',
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              lineHeight: 1.2,
                              mb: 0.5
                            }}
                          >
                            {episode.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography 
                              variant="body2" 
                              component="span"
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              {episode.publishDate 
                                ? new Date(episode.publishDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : new Date(episode.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                                  })
                              }
                            </Typography>
                            {episode.keywords && episode.keywords.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {episode.keywords.slice(0, 3).map((keyword) => (
                                  <Chip
                                    key={keyword}
                                    label={keyword}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      height: '16px',
                                      fontSize: '0.6rem',
                                      borderColor: 'grey.300',
                                      color: 'text.secondary',
                                      '& .MuiChip-label': {
                                        px: 0.5,
                                      }
                                    }}
                                  />
                                ))}
                                {episode.keywords.length > 3 && (
                                  <Typography 
                                    variant="caption" 
                                    component="span"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.6rem', alignSelf: 'center' }}
                                  >
                                    +{episode.keywords.length - 3} more
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Quick Broadcast to Connected Platforms">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickBroadcast(episode.id);
                            }}
                            disabled={isQuickBroadcasting === episode.id}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.light',
                              }
                            }}
                          >
                            {isQuickBroadcasting === episode.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <RadioIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Episode">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEpisode(episode);
                            }}
                            sx={{
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: 'error.light',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteEpisode}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Episode
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete "{episodeToDelete?.title || 'Untitled Episode'}"? 
            This action cannot be undone and will permanently remove the episode.
          </Typography>
        </DialogContent>
        <DialogActions>
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
        </DialogActions>
      </Dialog>

    </Container>
  );
} 