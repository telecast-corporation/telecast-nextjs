'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../../lib/dexie';

const NewsDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const newsId = Number(id);

  const newsItem = useLiveQuery(() => db.localNews.get(newsId), [newsId]);

  const handleApprove = async () => {
    await db.localNews.update(newsId, { status: 'approved' });
    router.push('/admin/local-news');
  };

  const handleReject = async () => {
    await db.localNews.update(newsId, { status: 'rejected' });
    router.push('/admin/local-news');
  };

  if (!newsItem) {
    return <CircularProgress />;
  }

  if (!newsItem) {
    return <Alert severity="error">News item not found.</Alert>;
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {newsItem.title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {newsItem.category}
        </Typography>
        <Typography paragraph sx={{ mt: 2 }}>
          {newsItem.description}
        </Typography>
        <Typography color="text.secondary">
          {newsItem.city}, {newsItem.country}
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="success" onClick={handleApprove}>
            Approve
          </Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Reject
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewsDetailPage;
