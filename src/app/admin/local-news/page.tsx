'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';

interface LocalNews {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  city: string;
  country: string;
  status: string;
  createdAt: string;
}

export default function AdminLocalNews() {
  const { user, isLoading } = useUser();
  const [newsItems, setNewsItems] = useState<LocalNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      fetchPendingNews();
    }
  }, [isLoading, user]);

  const fetchPendingNews = async () => {
    try {
      const response = await fetch('/api/admin/local-news');
      if (!response.ok) {
        throw new Error('Failed to fetch pending news');
      }
      const data = await response.json();
      setNewsItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending news');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/local-news', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update news status');
      }

      setNewsItems(newsItems.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  if (isLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // In a real app, you might redirect to a login page or show an unauthorized message.
    // For now, we'll just return null if the user is not authenticated.
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Admin Moderation
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#6c757d',
            maxWidth: '600px',
            mx: 'auto',
            mb: 4,
          }}
        >
          Review and approve local news submissions.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {newsItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label={`${item.city}, ${item.country}`} size="small" />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Submitted: {new Date(item.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="success" onClick={() => handleUpdateStatus(item.id, 'approved')}>
                  Approve
                </Button>
                <Button size="small" color="error" onClick={() => handleUpdateStatus(item.id, 'rejected')}>
                  Reject
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {newsItems.length === 0 && !loading && (
        <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          No pending news items to review.
        </Typography>
      )}
    </Container>
  );
}
