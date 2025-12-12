'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { useLocation } from '@/hooks/useLocation';
import { countries } from '@/lib/countries';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface NewsArticle {
  type: 'news' | 'local';
  id: string;
  title: string;
  url: string;
  description: string;
  author: string;
  source: string;
  sourceUrl: string;
  thumbnail?: string;
  publishedAt: string;
  location?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location, loading: locationLoading } = useLocation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const locationQuery = selectedCity || selectedCountry || '';

        const response = await fetch('/api/news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            limit: 20,
            location: locationQuery,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        setArticles(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (!locationLoading) {
      fetchNews();
    }
  }, [location, locationLoading, selectedCity, selectedCountry]);

  const handleCountryChange = (event: any) => {
    const country = event.target.value;
    setSelectedCountry(country);
    setSelectedCity('');
    updateURL(country, '');
  };

  const handleCityChange = (event: any) => {
    const city = event.target.value;
    setSelectedCity(city);
    updateURL(selectedCountry, city);
  };

  const handleClear = () => {
    setSelectedCountry('');
    setSelectedCity('');
    updateURL('', '');
  };

  const updateURL = (country: string, city: string) => {
    const params = new URLSearchParams();
    if (country) params.set('country', country);
    if (city) params.set('city', city);
    router.push(`/news?${params.toString()}`);
  };

  const cities = countries.find(c => c.name === selectedCountry)?.cities || [];

  if (locationLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          {selectedCity || selectedCountry ? `News from ${selectedCity || selectedCountry}` : 'Latest Global News'}
        </Typography>
        <Box>
          <Button variant="contained" onClick={() => router.push('/local-news')} sx={{ mr: 1 }}>
            Local News
          </Button>
          <Button variant="contained" onClick={() => router.push('/local-news/upload')}>
            Upload News
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Country</InputLabel>
          <Select value={selectedCountry} onChange={handleCountryChange}>
            {countries.map((c) => (
              <MenuItem key={c.code} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }} disabled={!selectedCountry}>
          <InputLabel>City</InputLabel>
          <Select value={selectedCity} onChange={handleCityChange}>
            {cities.map((cityName) => (
              <MenuItem key={cityName} value={cityName}>
                {cityName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button onClick={handleClear} variant="outlined">Clear</Button>
      </Box>
      
      {articles.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No news articles found.
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {articles.map((article) => (
            <Box
              key={article.id}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Typography variant="h6" component="h2" gutterBottom>
                <Link
                  href={`/local-news/view?id=${article.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {article.title}
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {article.description.substring(0, 100)}{article.description.length > 100 && '...'}
              </Typography>
              <Button onClick={() => router.push(`/local-news/view?id=${article.id}`)} variant="outlined" size="small">
                  See More
              </Button>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {article.author}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
}
