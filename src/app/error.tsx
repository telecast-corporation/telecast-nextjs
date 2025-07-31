'use client';

import { useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Something went wrong!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          We encountered an unexpected error. Please try again.
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
          onClick={() => window.location.href = '/'}
        >
          Go to homepage
        </Button>
      </Box>
    </Container>
  );
} 