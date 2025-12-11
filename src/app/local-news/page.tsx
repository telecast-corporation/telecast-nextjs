
'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Box,
  Alert,
  Paper,
  Button,
  CardActionArea
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FiMapPin, FiVideoOff } from 'react-icons/fi';
import Link from 'next/link';

interface LocalNewsItem {
  id: string;
  title: string;
  videoUrl: string;
  locationCity: string;
  locationCountry: string;
}

const LocalNewsPage = () => {
  const theme = useTheme();
  const [news, setNews] = useState<LocalNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/local-news?status=approved');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper elevation={12} sx={{ p: { xs: 2, sm: 4, md: 6 }, borderRadius: 4, background: 'linear-gradient(145deg, #f0f2f5, #ffffff)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
          <div>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              Local Stories
            </Typography>
            <Typography variant="h6" color="text.secondary">
              News from your community, shared by your neighbors.
            </Typography>
          </div>
          <Link href="/local-news/upload" passHref>
            <Button variant="contained" color="primary" size="large">Upload news</Button>
          </Link>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 4, borderRadius: 2 }}>{error}</Alert>
        )}

        {!loading && !error && news.length === 0 && (
          <Box sx={{ textAlign: 'center', my: 10 }}>
            <FiVideoOff size={60} color={theme.palette.text.secondary} />
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 500 }}>No News Yet</Typography>
            <Typography color="text.secondary">Be the first to share a story from your community!</Typography>
          </Box>
        )}

        {!loading && !error && news.length > 0 && (
          <Grid container spacing={4}>
            {news.map((item) => (
              <Grid item key={item.id} xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[10] } }}>
                  <CardActionArea>
                    <CardMedia
                      component="video"
                      src={item.videoUrl}
                      title={item.title}
                      controls
                      sx={{ height: 220 }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        {item.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <FiMapPin style={{ marginRight: '8px' }} />
                        <Typography variant="body2">
                          {`${item.locationCity}, ${item.locationCountry}`}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default LocalNewsPage;
