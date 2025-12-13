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
  TextField,
} from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/dexie';

const LocalNewsPage = () => {
  const news = useLiveQuery(() => db.localNews.toArray(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (news) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [news]);

  const filteredNews = news?.filter(article => {
    if (!article) return false;
    const categoryMatch = category
      ? article.category?.toLowerCase().includes(category.toLowerCase())
      : true;
    const countryMatch = country
      ? article.country?.toLowerCase().includes(country.toLowerCase())
      : true;
    const cityMatch = city
      ? article.city?.toLowerCase().includes(city.toLowerCase())
      : true;
    return categoryMatch && countryMatch && cityMatch;
  });

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

      <Box mb={4}>
        <Typography variant="h6" component="h2" gutterBottom align="center">
          Search News
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Category"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Country"
              value={country}
              onChange={e => setCountry(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      {filteredNews && filteredNews.length > 0 ? (
        <Grid container spacing={4} justifyContent="center">
          {filteredNews.map(article => (
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
                  href={`/local-news/view?id=${article.id}`}
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
