"use client";

import { useSearchParams } from 'next/navigation';
import { Box, Paper, Typography, Grid, Card, CardContent, Button, Alert } from '@mui/material';

export default function DistributePage() {
  const searchParams = useSearchParams();
  const podcastId = searchParams.get('podcastId');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://telecast.ca';
  const feedUrl = (platform: 'spotify' | 'apple' | 'podcastindex') =>
    podcastId ? `${baseUrl}/api/podcast/${encodeURIComponent(podcastId)}/rss/${platform}` : '';

  return (
    <Box sx={{ minHeight: '100vh', py: 6, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
          Distribute Your Podcast
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Copy your feed URLs and submit to platforms.
        </Typography>

        {!podcastId && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Missing podcastId. Please finalize an episode first.
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>Spotify</Typography>
                <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-all' }}>
                  {podcastId ? feedUrl('spotify') : 'N/A'}
                </Typography>
                <Button sx={{ mt: 2 }} variant="outlined" size="small" onClick={() => window.open('https://podcasters.spotify.com/submit', '_blank')}>
                  Open Spotify for Podcasters
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>Apple Podcasts</Typography>
                <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-all' }}>
                  {podcastId ? feedUrl('apple') : 'N/A'}
                </Typography>
                <Button sx={{ mt: 2 }} variant="outlined" size="small" onClick={() => window.open('https://podcastsconnect.apple.com/my-podcasts/new', '_blank')}>
                  Open Apple Podcasts Connect
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>Podcast Index</Typography>
                <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-all' }}>
                  {podcastId ? feedUrl('podcastindex') : 'N/A'}
                </Typography>
                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  size="small"
                  disabled={!podcastId}
                  onClick={async () => {
                    if (!podcastId) return;
                    try {
                      const res = await fetch(`/api/podcast/${encodeURIComponent(podcastId)}/podcast-index/submit`, { method: 'POST' });
                      if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error || 'Submit failed');
                      }
                      alert('Submitted to Podcast Index successfully!');
                    } catch (err: any) {
                      alert(`Failed to submit to Podcast Index: ${err?.message || 'Unknown error'}`);
                    }
                  }}
                >
                  Submit to Podcast Index
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
} 