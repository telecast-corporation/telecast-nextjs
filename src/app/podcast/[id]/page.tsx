'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow,
  Warning,
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import axios from 'axios';

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
  spotifyUrl?: string;
}

export default function PodcastPage() {
  const params = useParams();
  const router = useRouter();
  const [podcast, setPodcast] = useState<DatabasePodcast | null>(null);
  const [episodes, setEpisodes] = useState<DatabaseEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 10;

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
          setPodcast(response.data);
          // Sort episodes by publish date in descending order
          const sortedEpisodes = response.data.episodes?.sort((a: DatabaseEpisode, b: DatabaseEpisode) => 
            new Date(b.publishDate || b.createdAt).getTime() - new Date(a.publishDate || a.createdAt).getTime()
          ) || [];
          setEpisodes(sortedEpisodes);
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

      setEpisodes(episodes.filter(ep => ep.id !== episodeToDelete.id));
      setDeleteDialogOpen(false);
      setEpisodeToDelete(null);
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

  const handlePlayOnSpotify = () => {
    if (podcast?.spotifyUrl) {
      window.open(podcast.spotifyUrl, '_blank');
    }
  };

  const cleanDescription = (html: string) => {
    if (typeof window === 'undefined') {
      return html.replace(/<[^>]*>?/gm, '');
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const publishedEpisodes = episodes.filter(episode => episode.isPublished);
  const draftEpisodes = episodes.filter(episode => !episode.isPublished);
  
  const indexOfLastEpisode = currentPage * episodesPerPage;
  const indexOfFirstEpisode = indexOfLastEpisode - episodesPerPage;
  const currentEpisodes = publishedEpisodes.slice(indexOfFirstEpisode, indexOfLastEpisode);
  const totalPages = Math.ceil(publishedEpisodes.length / episodesPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    const episodesSection = document.getElementById('episodes-section');
    if (episodesSection) {
      episodesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
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

  const spotifyEmbedUrl = podcast.spotifyUrl ? `https://open.spotify.com/embed/show/${podcast.spotifyUrl.split('/').pop()}` : null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
            <CardMedia
              component="img"
              image={podcast.coverImage || ''}
              alt={podcast.title}
              sx={{ width: 200, height: 200, borderRadius: 2, mb: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              {podcast.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {podcast.author}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, mb: 2, maxWidth: 600, fontSize: '0.9rem', lineHeight: 1.4, color: 'text.secondary' }}>
              {cleanDescription(podcast.description || '')}
            </Typography>
          </Box>
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
          {podcast.category && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Category</Typography>
              <Chip label={podcast.category} size="small" sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }} />
            </Box>
          )}
          {podcast.tags && podcast.tags.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Tags</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {podcast.tags.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {spotifyEmbedUrl && (
        <Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
          <iframe 
            src={spotifyEmbedUrl} 
            width="100%" 
            height="232" 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          ></iframe>
        </Box>
      )}

      <Box id="episodes-section">
        {draftEpisodes.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="warning.main">Draft Episodes ({draftEpisodes.length})</Typography>
            <Card>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {draftEpisodes.map((episode, index) => (
                  <ListItem key={episode.id} disablePadding divider={index < draftEpisodes.length - 1}>
                    <ListItemButton onClick={() => router.push(`/podcast/${podcast.id}/episode/${episode.id}/finalize`)} sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <ListItemText
                          primary={<Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{episode.title || 'Untitled Episode'}</Typography>}
                          secondary={`Draft • ${new Date(episode.createdAt).toLocaleDateString()} • ${(episode.fileSize / 1024 / 1024).toFixed(2)} MB`}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title="Finalize Episode">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); router.push(`/podcast/${podcast.id}/episode/${episode.id}/finalize`); }} sx={{ color: 'warning.main' }}>
                              <SaveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Episode">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteEpisode(episode); }} sx={{ color: 'error.main' }}>
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>Published Episodes ({publishedEpisodes.length})</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => router.push(`/podcast/${podcast?.id}/distribute`)}>Distribute</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push(`/podcast/${podcast?.id}/episode/new/edit`)}>Add Episode</Button>
          </Box>
        </Box>
        
        {publishedEpisodes.length === 0 && draftEpisodes.length === 0 ? (
          <Card><Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="h6" color="text.secondary">No episodes yet</Typography></Box></Card>
        ) : (
          <Card>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {currentEpisodes.map((episode, index) => (
                <ListItem key={episode.id} disablePadding divider={index < currentEpisodes.length - 1}>
                  <ListItemButton onClick={() => router.push(`/podcast/${podcast.id}/episode/${episode.id}`)} sx={{ py: 1.5, px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePlayOnSpotify(); }} sx={{ mr: 1, color: 'primary.main' }}>
                        <PlayArrow />
                      </IconButton>
                      <ListItemText
                        primary={<Typography variant="subtitle1">{episode.title}</Typography>}
                        secondary={episode.publishDate ? new Date(episode.publishDate).toLocaleDateString() : new Date(episode.createdAt).toLocaleDateString()}
                      />
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
          </Box>
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={cancelDeleteEpisode}>
        <DialogTitle>Delete Episode</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete "{episodeToDelete?.title || 'Untitled Episode'}"? This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteEpisode} disabled={isDeleting}>Cancel</Button>
          <Button onClick={confirmDeleteEpisode} color="error" variant="contained" disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
