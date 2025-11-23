'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CircularProgress, 
  Box, 
  TextField, 
  Button, 
  Alert, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';
import { countries } from '@/lib/countries';

interface LocalNewsItem {
  id: string;
  title: string;
  city: string;
  country: string;
  thumbnailUrl?: string;
}

export default function LocalNewsPage() {
  const [news, setNews] = useState<LocalNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const router = useRouter();

  const fetchNews = async (filterCity = '', filterCountry = '') => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(filterCity && { city: filterCity }),
        ...(filterCountry && { country: filterCountry }),
      }).toString();
      
      const response = await fetch(`/api/local-news?${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleFilter = () => {
    fetchNews(city, country);
  };

  const handleItemClick = (item: LocalNewsItem) => {
    router.push(`/video/${item.id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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

  const cities = countries.find(c => c.name === country)?.cities || [];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Local News
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="country-filter-label">Country</InputLabel>
          <Select
            labelId="country-filter-label"
            value={country}
            label="Country"
            onChange={(e) => {
              setCountry(e.target.value as string);
              setCity('');
            }}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {countries.map((c) => (
              <MenuItem key={c.code} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="city-filter-label">City</InputLabel>
          <Select
            labelId="city-filter-label"
            value={city}
            label="City"
            onChange={(e) => setCity(e.target.value as string)}
            disabled={!country}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {cities.map((cityName) => (
              <MenuItem key={cityName} value={cityName}>
                {cityName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleFilter}>Filter</Button>
      </Box>
      <Grid container spacing={3}>
        {news.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card 
              sx={{ height: '100%', cursor: 'pointer' }}
              onClick={() => handleItemClick(item)}
            >
              <CardMedia
                component="img"
                height="140"
                image={item.thumbnailUrl || 'https://via.placeholder.com/150'}
                alt={item.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.city}, {item.country}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
