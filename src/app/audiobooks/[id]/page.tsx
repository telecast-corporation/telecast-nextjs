'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Avatar,
  Alert,
  Box,
  Button,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Rating,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Headphones as HeadphonesIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface AudiobookDetails {
  id: string;
  title: string;
  author: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: string;
  narrator: string;
  rating: number;
  audibleUrl: string;
  source: string;
  sourceUrl: string;
}

// Helper to ensure HTTPS
function ensureHttps(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
}

export default function AudiobookPage() {
  const params = useParams();
  const router = useRouter();
  const [audiobook, setAudiobook] = useState<AudiobookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudiobookDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/audiobook/${params.id}`);
        setAudiobook(response.data);
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

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <PersonIcon color="action" />
                  <Typography variant="h6" color="text.secondary">
                    {audiobook.author}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: { xs: 2, md: 0 } }}>
                <Button
                  variant="contained"
                  size="large" // Larger button
                  startIcon={<HeadphonesIcon />}
                  component="a"
                  href={audiobook.audibleUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={!audiobook.audibleUrl}
                  sx={{ minWidth: 200 }} // Give it a min-width
                >
                  Listen on Audible
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Audiobook Details */}
      <Grid container spacing={{ xs: 2, md: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              About this audiobook
            </Typography>
            <Typography color="text.secondary" paragraph sx={{ fontSize: '1rem', lineHeight: 1.7 }}>
              {audiobook.description}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, height: '100%' }}>
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
                <ListItemText primary="Narrator" secondary={audiobook.narrator} />
              </ListItem>
              <Divider variant="inset" component="li" sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemAvatar>
                  <Avatar>
                    <CalendarIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Duration" secondary={audiobook.duration} />
              </ListItem>
              <Divider variant="inset" component="li" sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemAvatar>
                  <Avatar>
                    <Rating value={audiobook.rating} readOnly precision={0.5} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Rating" secondary={`${audiobook.rating} stars`} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
