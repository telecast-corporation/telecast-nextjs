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
      const fetchArticle = async () => {
        try {
          const response = await fetch(`/api/local-news?id=${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch news article');
          }
          const data = await response.json();
          if (data.news) {
            setArticle(data.news);
          } else {
            setError('News article not found.');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
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
    <Container sx={{ py: 8 }}>
      <Card>
        {article.videoUrl && (
          <CardMedia
            component="video"
            src={article.videoUrl}
            title={article.title}
            sx={{ width: '100%', maxHeight: '70vh' }}
            controls
          />
        )}
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {article.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {article.description}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

const ViewNewsPageWrapper = () => (
    <Suspense fallback={<Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>}>
        <ViewNewsPage />
    </Suspense>
);


export default ViewNewsPageWrapper;
