'use client';

import { Suspense, ReactNode } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface SearchParamsWrapperProps {
  children: ReactNode;
}

function SearchParamsContent({ children }: SearchParamsWrapperProps) {
  return <>{children}</>;
}

export default function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body1" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      }
    >
      <SearchParamsContent>{children}</SearchParamsContent>
    </Suspense>
  );
} 