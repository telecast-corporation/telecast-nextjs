'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { SpotifyPodcast } from '@/lib/spotify';

export default function DiscoverPodcasts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyPodcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/search/spotify?term=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search for podcasts');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPodcast = async (podcast: SpotifyPodcast) => {
    try {
      const response = await fetch('/api/podcast/external', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ podcast }),
      });

      if (!response.ok) {
        throw new Error('Failed to add podcast');
      }
      // Optionally, you can provide feedback to the user that the podcast has been added.
      console.log("Podcast added successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add podcast');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Discover New Podcasts from Spotify
      </Typography>
      <Box sx={{ display: 'flex', mb: 4 }}>
        <TextField
          label="Search for podcasts on Spotify"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ ml: 2, whiteSpace: 'nowrap' }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {searchResults.map((podcast) => (
          <Grid item xs={12} sm={6} md={4} key={podcast.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={podcast.images[0]?.url || 'https://via.placeholder.com/150'}
                alt={podcast.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {podcast.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {podcast.description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddPodcast(podcast)}
                >
                  Add
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
