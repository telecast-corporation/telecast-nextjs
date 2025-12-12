
'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  locationCity: string;
  locationCountry: string;
  status: string;
}

const ApprovedNewsPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const localNewsData = localStorage.getItem('localNews');
    if (localNewsData) {
      setNews(JSON.parse(localNewsData));
    }
    setLoading(false);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
          Local News
        </Typography>
        <Link href="/local-news/upload" passHref>
          <Button variant="contained" color="primary" size="large">Upload Your News</Button>
        </Link>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && news.length === 0 && (
        <Typography sx={{ my: 5, textAlign: 'center' }}>
          No local news items found. Why not upload one?
        </Typography>
      )}

      <Grid container spacing={4}>
        {news.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {item.videoUrl && (
                <CardMedia
                  component="video"
                  controls
                  src={item.videoUrl}
                  sx={{ height: 200 }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description.length > 100
                    ? `${item.description.substring(0, 100)}...`
                    : item.description}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  {item.locationCity}, {item.locationCountry}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ApprovedNewsPage;
