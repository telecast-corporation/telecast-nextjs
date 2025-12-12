'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/dexie';
import { LocalNews } from '@/lib/dexie';

const LocalNewsPage = () => {
  const news = useLiveQuery(() => db.localNews.toArray(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (news) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [news]);

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

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Local News
      </Typography>
      {news && news.length > 0 ? (
        <Grid container spacing={4} justifyContent="center">
          {news.map(article => (
            <Grid item key={article.id} xs={12} sm={8} md={6}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardActionArea
                  component={Link}
                  href={`/local-news/view?title=${encodeURIComponent(
                    article.title
                  )}`}
                >
                  {article.videoUrl && (
                    <CardMedia
                      component="video"
                      src={article.videoUrl}
                      title={article.title}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                      }}
                      controls
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {`${article.description.slice(0, 100)}...`}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography align="center">No local news found.</Typography>
      )}
    </Container>
  );
};

export default LocalNewsPage;
