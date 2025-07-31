'use client';

import { useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';

export default function PodcastError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Podcast page error:', error);
  }, [error]);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Failed to Load Podcast
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          We couldn't load the podcast you requested. This might be because the podcast doesn't exist or there was a network error.
        </Typography>
        <Button
          variant="contained"
          onClick={reset}
          sx={{ mr: 2 }}
        >
          Try again
        </Button>
        <Button
          variant="outlined"
          onClick={() => window.location.href = '/search?type=podcast'}
        >
          Browse Podcasts
        </Button>
      </Box>
    </Container>
  );
} 