
'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';

interface LocalNews {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  locationCity: string;
  locationCountry: string;
  createdAt: string;
}

export default function VideoPlayerPage() {
  const params = useParams();
  const [news, setNews] = useState<LocalNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsId = params.id as string;
        
        const response = await fetch(`/api/video/${newsId}`);
        
        if (response.ok) {
          const data = await response.json();
          setNews(data);
        } else {
          setError('News not found');
        }
      } catch (err) {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchNews();
    }
  }, [params.id]);

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

  if (error || !news) {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" color="error">
          {error || 'News not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {news.title}
          </Typography>
          <video controls src={news.videoUrl} style={{ width: '100%' }} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            {news.description}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
            {news.locationCity}, {news.locationCountry}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(news.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
