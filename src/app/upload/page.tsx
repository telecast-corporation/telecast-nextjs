'use client';

import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Grid, Alert } from '@mui/material';

interface NewsData {
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  locationCity: string;
  locationCountry: string;
}

const DEFAULT_NEWS_DATA: NewsData = {
  title: '',
  description: '',
  category: '',
  videoUrl: '',
  locationCity: '',
  locationCountry: '',
};

export default function UploadNewsPage() {
  const [newsData, setNewsData] = useState<NewsData>(DEFAULT_NEWS_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onChange = (field: keyof NewsData, value: string) => {
    setNewsData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      if (!newsData.title || !newsData.description || !newsData.videoUrl || !newsData.locationCity || !newsData.locationCountry) {
        setError('Please fill in all required fields.');
        setSubmitting(false);
        return;
      }

      const resp = await fetch('/api/local-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsData),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit news');
      }

      setNewsData(DEFAULT_NEWS_DATA);
      setSuccess('Your news has been submitted for review. Thank you!');
    } catch (e: any) {
      setError(e?.message || 'Failed to submit news');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 6, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
          Upload Local News
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Share what's happening in your community by submitting a video.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="News Title" fullWidth required value={newsData.title} onChange={e => onChange('title', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline minRows={4} required value={newsData.description} onChange={e => onChange('description', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Category" fullWidth value={newsData.category} onChange={e => onChange('category', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Video URL" fullWidth required value={newsData.videoUrl} onChange={e => onChange('videoUrl', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="City" fullWidth required value={newsData.locationCity} onChange={e => onChange('locationCity', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Country" fullWidth required value={newsData.locationCountry} onChange={e => onChange('locationCountry', e.target.value)} />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit News'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
