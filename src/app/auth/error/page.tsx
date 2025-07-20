'use client';

import { useSearchParams } from 'next/navigation';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            Authentication Error
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {errorDescription || 'Something went wrong during authentication. Please try again.'}
          </Typography>
          
          {error && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Error Code: {error}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              component={Link}
              href="/auth/login"
              sx={{ minWidth: 120 }}
            >
              Try Again
            </Button>
            
            <Button
              variant="outlined"
              component={Link}
              href="/"
              sx={{ minWidth: 120 }}
            >
              Go Home
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            If this problem persists, please check your Auth0 configuration.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
} 