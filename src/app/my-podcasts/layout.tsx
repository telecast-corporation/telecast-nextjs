'use client';

import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function MyPodcastsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      }
    >
      {children}
    </Suspense>
  );
}
