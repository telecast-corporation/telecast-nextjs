'use client';

import { useSearchParams } from 'next/navigation';
import { Box, Typography } from '@mui/material';

export default function DistributePage() {
  const searchParams = useSearchParams();
  const podcastId = searchParams.get('podcastId');

  return (
    <Box sx={{ minHeight: '100vh', py: 6, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
          Distribute Your Podcast
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your podcast is ready! Here is your podcast ID: {podcastId}
        </Typography>
      </Box>
    </Box>
  );
}
