'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import AudioRecorder from '../../components/AudioRecorder';

export default function RecordPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Only redirect if we're certain the user is unauthenticated
    if (status === 'unauthenticated' && authChecked) {
      // Store the current page as the callback URL
      const callbackUrl = encodeURIComponent('/record');
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [status, authChecked, router]);

  useEffect(() => {
    if (status !== 'loading') {
      setAuthChecked(true);
    }
  }, [status]);

  // Show loading state while session is loading or we're checking auth
  if (status === 'loading' || !authChecked) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Loading professional audio editor...
        </Typography>
      </Box>
    );
  }

  // Show error if authentication failed
  if (status === 'unauthenticated') {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        p={3}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          Please log in to access the professional audio editor.
        </Alert>
      </Box>
    );
  }

  // If authenticated, render the AudioRecorder (now with embedded AudioMass)
  return <AudioRecorder />;
} 