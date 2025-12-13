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
import { db } from '@/lib/dexie';
import { LocalNews } from '@/lib/dexie';

const ViewEventPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [item, setItem] = useState<LocalNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
        const itemId = parseInt(id, 10);
        if (!isNaN(itemId)) {
            db.localNews.get(itemId).then(foundItem => {
                if (foundItem) {
                    setItem(foundItem);
                } else {
                    setError('Event not found.');
                }
                setLoading(false);
            });
        } else {
            setError('Invalid event ID.');
            setLoading(false);
        }
    } else {
      setError('No event ID provided.');
      setLoading(false);
    }
  }, [id]);

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

  if (!item) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Event not found.</Alert>
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
            {item.title}
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          {item.videoUrl && (
            <Card raised sx={{ mb: 4 }}>
              <CardMedia
                component="video"
                src={item.videoUrl}
                title={item.title}
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
                {item.title}
              </Typography>
              <Typography
                variant="body1"
                component="p"
                color="text.secondary"
              >
                {item.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

const ViewEventPageWrapper = () => (
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
    <ViewEventPage />
  </Suspense>
);

export default ViewEventPageWrapper;
