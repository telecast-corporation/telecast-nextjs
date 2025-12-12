'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

const LocalNewsPage = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/local-news');
        if (!response.ok) {
          throw new Error('Failed to fetch local news');
        }
        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Local News
      </Typography>
      {news.length > 0 ? (
        <Grid container spacing={4}>
          {news.map((article) => (
            <Grid item key={article.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea component={Link} href={`/local-news/view?id=${article.id}`}>
                  {article.videoUrl && (
                    <CardMedia
                      component="video"
                      src={article.videoUrl}
                      title={article.title}
                      sx={{ height: 140 }}
                      controls
                    />
                  )}
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {article.description && `${article.description.slice(0, 100)}...`}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No local news found.</Typography>
      )}
    </Container>
  );
};

export default LocalNewsPage;
