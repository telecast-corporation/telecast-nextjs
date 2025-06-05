'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  IconButton,
  Slider,
  Chip,
  Link,
  Divider,
  Pagination,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Speed,
  Language,
  Category,
  Person,
  Email,
  Warning,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useAudio } from '@/contexts/AudioContext';
import { PodcastIndex } from '@/lib/podcast-index';
import { Podcast, Episode } from '@/lib/podcast-index';
import { formatDuration, formatDate } from '@/lib/utils';

export default function PodcastPage() {
  const params = useParams();
  const { play } = useAudio();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const episodesPerPage = 7;

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setLoading(true);
        const podcastIndex = new PodcastIndex();
        const podcastId = params.id as string;
        const podcastData = await podcastIndex.getPodcastById(Number(podcastId));
        if (podcastData) {
          setPodcast(podcastData);
          setEpisodes(podcastData.episodes || []);
        }
      } catch (err) {
        setError('Failed to load podcast');
        console.error('Error fetching podcast:', err);
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
    }
  };

  // Function to strip HTML tags and decode HTML entities
  const cleanDescription = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top of episodes section
    const episodesSection = document.getElementById('episodes-section');
    if (episodesSection) {
      episodesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate pagination
  const totalPages = podcast ? Math.ceil(episodes.length / episodesPerPage) : 0;
  const startIndex = (page - 1) * episodesPerPage;
  const endIndex = startIndex + episodesPerPage;
  const currentEpisodes = episodes.slice(startIndex, endIndex);

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
            {podcast.url && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon color="action" />
                  <Link href={podcast.url} target="_blank" rel="noopener">
                    {podcast.url}
                  </Link>
                </Box>
              </Grid>
            )}
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
                            {formatDate(episode.publishDate)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            •
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDuration(episode.duration)}
                          </Typography>
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Box>
    </Container>
  );
} 