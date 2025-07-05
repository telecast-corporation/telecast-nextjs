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
} from '@mui/icons-material';
import { useAudio } from '@/contexts/AudioContext';
import { Podcast, Episode } from '@/lib/podcast-index';
import { formatDuration, formatDate } from '@/lib/utils';
import axios from 'axios';

export default function PodcastPage() {
  const params = useParams();
  const router = useRouter();
  const { play } = useAudio();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 10;
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setLoading(true);
        const podcastId = params.id as string;
        
        const response = await axios.get(`/api/podcast/${podcastId}/internal`);
        
        if (response.data) {
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



  const handlePlayEpisode = (episode: Episode) => {
    if (currentlyPlaying === episode.id) {
      // If clicking the currently playing episode, pause it
      setCurrentlyPlaying(null);
    } else {
      // If clicking a different episode, play new one
      const audio = new Audio(episode.audioUrl);
      audio.play();
      setCurrentlyPlaying(episode.id);

      // Handle audio end
      audio.onended = () => {
        setCurrentlyPlaying(null);
      };
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
  const currentEpisodes = episodes.slice(indexOfFirstEpisode, indexOfLastEpisode);
  const totalPages = Math.ceil(episodes.length / episodesPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    // Scroll to episodes section
    const episodesSection = document.getElementById('episodes-section');
    if (episodesSection) {
      episodesSection.scrollIntoView({ behavior: 'smooth' });
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
              image={podcast.imageUrl}
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
              {cleanDescription(podcast.description)}
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
                    sx={{ 
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.main',
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 0 }}>
            Episodes
          </Typography>
          <Link href={`/upload/${podcast.id}`} style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ minWidth: 'auto' }}
            >
              Add Episode
            </Button>
          </Link>
        </Box>
        
        {episodes.length === 0 ? (
          <Card>
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No episodes yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start building your podcast by creating your first episode
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Link href={`/upload/${podcast.id}`} style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                  >
                    Upload Episode
                  </Button>
                </Link>
                <Link href={`/record/${podcast.id}`} style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    startIcon={<MicIcon />}
                  >
                    Record Episode
                  </Button>
                </Link>
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
                        {currentlyPlaying === episode.id ? <PauseIcon /> : <PlayArrow />}
                      </IconButton>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0 }}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              {new Date(Number(episode.publishDate) * 1000).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Typography>
                            {episode.duration && (
                              <>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                >•</Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                >
                                  {formatDuration(episode.duration)}
                                </Typography>
                              </>
                            )}
                          </Box>
                        }
                      />
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


    </Container>
  );
} 