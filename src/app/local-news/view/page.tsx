'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import Link from 'next/link';
import { FiMapPin, FiTag, FiArrowLeft } from 'react-icons/fi';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  locationCity: string;
  locationCountry: string;
  category: string;
  status: string;
}

const ApprovedNewsPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    setLoading(true);
    const localNewsData = localStorage.getItem('localNews');
    if (localNewsData) {
      try {
        const parsedData = JSON.parse(localNewsData);
        setNews(parsedData);
      } catch (error) {
        console.error("Failed to parse local news data:", error);
      }
    }
    setLoading(false);
  }, []);

  const handleCardClick = (item: NewsItem) => {
    setSelectedNews(item);
  };

  const handleBackToList = () => {
    setSelectedNews(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (selectedNews) {
    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <Box sx={{ mb: 4 }}>
                <Button startIcon={<FiArrowLeft />} onClick={handleBackToList}>
                    Back to News
                </Button>
            </Box>
            <Paper elevation={12} sx={{ p: { xs: 2, sm: 4, md: 6 }, borderRadius: 4 }}>
                <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {selectedNews.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Chip
                        icon={<FiMapPin />}
                        label={`${selectedNews.locationCity}, ${selectedNews.locationCountry}`}
                        variant="outlined"
                    />
                    <Chip
                        icon={<FiTag />}
                        label={selectedNews.category}
                        variant="outlined"
                        color="primary"
                    />
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={8}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>Stream News Video</Typography>
                    <Box sx={{
                    position: 'relative',
                    paddingTop: '56.25%', // 16:9 aspect ratio
                    backgroundColor: '#000',
                    borderRadius: 2,
                    overflow: 'hidden'
                    }}>
                    <video
                        controls
                        src={selectedNews.videoUrl}
                        style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        }}
                    />
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>Story Details</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedNews.description}
                    </Typography>
                </Grid>
                </Grid>
            </Paper>
        </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ display