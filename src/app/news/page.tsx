'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useLocation } from '@/hooks/useLocation';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  author: string;
  publishedAt: string;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location, loading: locationLoading } = useLocation();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            limit: 20,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        setArticles(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (!locationLoading) {
      fetchNews();
    }
  }, [location, locationLoading]);

  if (locationLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Latest Global News
      </Typography>
      
      {articles.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No news articles found.
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {articles.map((article) => (
            <Box
              key={article.id}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Typography variant="h6" component="h2" gutterBottom>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {article.title}
                </a>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {article.description}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {article.author}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
}
