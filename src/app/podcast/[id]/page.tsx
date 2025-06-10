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
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  PlayArrow,
  Language,
  Category,
  Warning,
  Link as LinkIcon,
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

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setLoading(true);
        const podcastId = params.id as string;
        
        const response = await axios.get(`/api/podcast/${podcastId}`);
        
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
    if (podcast) {
      play(podcast, episode);
      // Update URL without page reload
      router.push(`/podcast/${params.id}?episode=${episode.id}`, { scroll: false });
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !podcast) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color="error">{error || 'Podcast not found'}</Typography>
      </Box>
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
              image={podcast.image}
              alt={podcast.title}
              sx={{ width: 200, height: 200, borderRadius: 2, mb: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              {podcast.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {podcast.author}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, mb: 2, maxWidth: 600 }}>
              {cleanDescription(podcast.description)}
            </Typography>
          </Box>

          {/* Podcast Details */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {podcast.language && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Language color="action" />
                  <Typography variant="body2">{podcast.language}</Typography>
                </Box>
              </Grid>
            )}
            {podcast.explicit && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning color="warning" />
                  <Typography variant="body2">Explicit Content</Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Categories */}
          {podcast.categories && podcast.categories.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {podcast.categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    size="small"
                    icon={<Category />}
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
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Episodes
        </Typography>
        
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
                    py: 2,
                    px: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <IconButton
                      size="large"
                      sx={{
                        mr: 2,
                        color: 'primary.main',
                      }}
                    >
                      <PlayArrow />
                    </IconButton>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 500,
                            color: 'text.primary',
                          }}
                        >
                          {episode.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(Number(episode.publishDate) * 1000).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                          {episode.duration && (
                            <>
                              <Typography variant="body2" color="text.secondary">•</Typography>
                              <Typography variant="body2" color="text.secondary">
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