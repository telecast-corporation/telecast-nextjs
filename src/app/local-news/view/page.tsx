'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Grid,
} from '@mui/material';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
}

const ViewNewsPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const articles = JSON.parse(localStorage.getItem('newsArticles') || '[]');
      const selectedArticle = articles.find((a: NewsArticle) => a.id === id);

      if (selectedArticle) {
        setArticle(selectedArticle);
        setLoading(false);
      } else {
        setError('News article not found in local storage.');
        setLoading(false);
      }
    } else {
      setError('No article ID provided.');
      setLoading(false);
    }
  }, [id]);

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

  if (!article) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">News article not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h1" align="center" gutterBottom>
            {article.title}
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          {article.videoUrl && (
            <Card raised sx={{ mb: 4 }}>
              <CardMedia
                component="video"
                src={article.videoUrl}
                title={article.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                }}
                controls
              />
            </Card>
          )}
          <Card raised>
            <CardContent>
              <Typography variant="body1" component="p" color="text.secondary">
                {article.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

const ViewNewsPageWrapper = () => (
  <Suspense
    fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    }
  >
    <ViewNewsPage />
  </Suspense>
);

export default ViewNewsPageWrapper;
