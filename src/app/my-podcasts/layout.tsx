'use client';

import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PartnerLogos from '@/components/PartnerLogos';

export default function MyPodcastsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      }
    >
      <Box>
        {children}
        <PartnerLogos />
      </Box>
    </Suspense>
  );
}
