'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Avatar,
  Alert,
  Box,
  CardMedia,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
  Typography,
  ListItemButton,
  IconButton,
  Pagination,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Headphones as HeadphonesIcon,
  Person as PersonIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Assuming episodes are part of the audiobook details
interface Episode {
  id: string;
  title: string;
  url: string; // URL for the episode audio
  duration?: string;
  publishDate?: string;
}

interface AudiobookDetails {
  id: string;
  title: string;
  author: string;
  description: string;
  thumbnail: string;
  url: string; // This is the internal URL for playback or preview
  duration: string;
  narrator: string;
  rating: number;
  source: string;
  sourceUrl: string;
  episodes?: Episode[];
}

// Helper to ensure HTTPS
function ensureHttps(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/^http:/, 'https');
}

export default function AudiobookPage() {
  const params = useParams();
  const [audiobook, setAudiobook] = useState<AudiobookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 10;

  useEffect(() => {
    const fetchAudiobookDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/audiobook/${params.id}`);
        setAudiobook(response.data);
        if (response.data.episodes && response.data.episodes.length > 0) {
          setSelectedEpisode(response.data.episodes[0]);
        }
        setError(null);
      } catch (err: any) {
        console.error('Error fetching audiobook details:', err);
        const errorMessage = err.response?.data?.error || 'Failed to load audiobook details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAudiobookDetails();
    }
  }, [params.id]);

  const visibleEpisodes = useMemo(() => {
    if (!audiobook?.episodes) return [];
    const start = (currentPage - 1) * episodesPerPage;
    return audiobook.episodes.slice(start, start + episodesPerPage);
  }, [audiobook, currentPage]);

  const totalPages = audiobook?.episodes ? Math.ceil(audiobook.episodes.length / episodesPerPage) : 0;

  const handleSelectEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !audiobook) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Audiobook not found'}</Alert>
      </Container>
    );
  }

  const embedUrl = useMemo(() => {
    if (!audiobook) return undefined;
    if (audiobook.source === 'spotify') {
      return `https://open.spotify.com/embed/show/${audiobook.id}`;
    }
    const audioUrl = selectedEpisode ? selectedEpisode.url : audiobook.url;
    return audioUrl ? audioUrl.replace('/episode/', '/embed/episode/') : undefined;
  }, [audiobook, selectedEpisode]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Header Section */}
      <Box sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid item xs={12} md={4}>
            <CardMedia
              component="img"
              image={ensureHttps(audiobook.thumbnail)}
              alt={audiobook.title}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3,
                objectFit: 'cover',
                aspectRatio: '2/3', // Maintain aspect ratio
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  sx={{ fontWeight: 'bold', fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3rem' } }}
                >
                  {audiobook.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <PersonIcon color="action" />
                  <Typography variant="h6" color="text.secondary">
                    {audiobook.author}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: { xs: 2, md: 0 } }}>
                {embedUrl && (
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Episodes Section */}
      {audiobook.episodes && audiobook.episodes.length > 0 && (
        <Box sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Episodes
          </Typography>
          <List>
            {visibleEpisodes.map((episode) => (
              <ListItem key={episode.id} disablePadding divider>
                <ListItemButton onClick={() => handleSelectEpisode(episode)} selected={selectedEpisode?.id === episode.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <IconButton size="small" sx={{ mr: 1, color: 'primary.main' }}>
                      <PlayArrowIcon />
                    </IconButton>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: selectedEpisode?.id === episode.id ? 700 : 500, color: selectedEpisode?.id === episode.id ? 'primary.main' : 'text.primary' }}>
                          {episode.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {episode.duration || ''}
                        </Typography>
                      }
                    />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={currentPage} onChange={(_, p) => setCurrentPage(p)} color="primary" />
            </Box>
          )}
        </Box>
      )}


      {/* Audiobook Details */}
      <Grid container spacing={{ xs: 2, md: 4 }}>
        <Grid item xs={12} md={8}>
          <Box sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              About this audiobook
            </Typography>
            <Typography color="text.secondary" paragraph sx={{ fontSize: '1rem', lineHeight: 1.7 }}>
              {audiobook.description}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Details
            </Typography>
            <List>
              <ListItem disablePadding>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Narrator" secondary={audiobook.narrator || 'N/A'} />
              </ListItem>
              <Divider variant="inset" component="li" sx={{ my: 1 }} />
              {audiobook.duration && (
                <>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Avatar>
                        <CalendarIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Duration" secondary={audiobook.duration} />
                  </ListItem>
                  <Divider variant="inset" component="li" sx={{ my: 1 }} />
                </>
              )}
              <ListItem disablePadding>
                <ListItemAvatar>
                  <Avatar>
                    <Rating value={audiobook.rating} readOnly precision={0.5} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Rating" secondary={audiobook.rating > 0 ? `${audiobook.rating} stars` : 'Not rated'} />
              </ListItem>
            </List>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
