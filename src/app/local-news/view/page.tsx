'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Button,
} from '@mui/material';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
}

const ViewNewsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = searchParams.get('title');
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (title) {
      const articles = JSON.parse(localStorage.getItem('localNews') || '[]');
      const selectedArticle = articles.find(
        (a: NewsArticle) => a.title === decodeURIComponent(title)
      );

      if (selectedArticle) {
        setArticle(selectedArticle);
      } else {
        setError('News article not found in local storage.');
      }
    } else {
      setError('No article title provided.');
    }
    setLoading(false);
  }, [title]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
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
      <Button onClick={() => router.back()} sx={{ mb: 2 }}>
        Go Back
      </Button>
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
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
              >
                {article.title}
              </Typography>
              <Typography
                variant="body1"
                component="p"
                color="text.secondary"
              >
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    }
  >
    <ViewNewsPage />
  </Suspense>
);

export default ViewNewsPageWrapper;
