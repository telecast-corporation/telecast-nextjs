'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
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
} from '@mui/material';
import { PlayArrow, Pause as PauseIcon } from '@mui/icons-material';
import { useAudio } from '@/contexts/AudioContext';

interface Episode {
  id: number;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  publishDate: string;
  imageUrl?: string;
}

interface Podcast {
  id: number;
  title: string;
  author: string;
  description: string;
  image: string;
  url: string;
  categories?: string[];
  language?: string;
  explicit?: boolean;
  episodeCount?: number;
  lastUpdateTime?: number;
  episodes?: Episode[];
}

export default function ExternalPodcastPage() {
  const params = useParams();
  const { play, currentEpisode } = useAudio();

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
        const id = params.id as string;
        const response = await fetch(`/api/podcast/external/${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load podcast');
        }
        setPodcast(data);
        setEpisodes(data.episodes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load podcast');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchPodcast();
  }, [params.id]);

  const visibleEpisodes = useMemo(() => {
    const start = (currentPage - 1) * episodesPerPage;
    return episodes.slice(start, start + episodesPerPage);
  }, [episodes, currentPage]);

  const totalPages = Math.ceil(episodes.length / episodesPerPage);

  const handlePlayEpisode = (episode: Episode) => {
    if (!podcast) return;
    const playablePodcast = {
      id: podcast.id.toString(),
      title: podcast.title,
      author: podcast.author,
      description: podcast.description,
      image: podcast.image,
      url: podcast.url,
    };
    const playableEpisode = {
      id: episode.id.toString(),
      title: episode.title,
      description: episode.description,
      audioUrl: episode.audioUrl,
      duration: episode.duration,
      publishDate: episode.publishDate,
    };
    play(playablePodcast, playableEpisode);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !podcast) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" color="error">
          {error || 'Podcast not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ mb: 4, maxWidth: 900, mx: 'auto' }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 2 }}>
            <CardMedia component="img" image={podcast.image} alt={podcast.title} sx={{ width: 200, height: 200, borderRadius: 2, mb: 2 }} />
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              sx={{ fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.6rem' }, fontWeight: 700 }}
            >
              {podcast.title}
            </Typography>
            <Box
              component="p"
              sx={{
                color: 'text.primary',
                fontSize: {
                  xs: '1.6rem !important',
                  sm: '1.8rem !important',
                  md: '2rem !important',
                },
                fontWeight: 700,
                lineHeight: 1.35,
                mt: 0.25,
                mb: 0.5,
                letterSpacing: 0.2,
              }}
            >
              {podcast.author}
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 700, mt: 1, fontSize: { xs: '0.9rem', sm: '0.95rem' }, lineHeight: 1.5 }}
            >
              {podcast.description}
            </Typography>
            {!!podcast.categories?.length && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {podcast.categories.map((c) => (
                  <Chip key={c} label={c} size="small" />
                ))}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Box>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' }, fontWeight: 600 }}
        >
          Episodes
        </Typography>
        <Card>
          <List>
            {visibleEpisodes.map((episode) => (
              <ListItem key={episode.id} disablePadding divider>
                <ListItemButton onClick={() => handlePlayEpisode(episode)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <IconButton size="small" sx={{ mr: 1, color: 'primary.main' }}>
                      {currentEpisode?.id === episode.id.toString() ? <PauseIcon /> : <PlayArrow />}
                    </IconButton>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{ fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' }, fontWeight: 500 }}
                        >
                          {episode.title}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' } }}
                        >
                          {new Date(episode.publishDate).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Card>
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination count={totalPages} page={currentPage} onChange={(_, p) => setCurrentPage(p)} color="primary" />
          </Box>
        )}
      </Box>
    </Container>
  );
}


