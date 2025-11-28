'use client';
import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" component="h1" gutterBottom color="primary">
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist.
        </Typography>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button variant="contained" size="large">
            Go to Homepage
          </Button>
        </Link>
      </Box>
    </Container>
  );
} 