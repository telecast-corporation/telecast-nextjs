'use client';

import { useEffect, useState, Suspense } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import AudioRecorder from '../../components/AudioRecorder';

export default function EditPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Only redirect if we're certain the user is unauthenticated
    if (!isLoading && !user && authChecked) {
      // Store the current page as the callback URL
      const callbackUrl = encodeURIComponent('/edit');
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
    }
  }, [isLoading, user, authChecked, router]);

  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  // Show loading state while session is loading or we're checking auth
  if (isLoading || !authChecked) {
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
  if (!user) {
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

  // If authenticated, render the AudioRecorder (with custom audio editor)
  return (
    <Box>
      <Suspense fallback={<div>Loading...</div>}>
        <AudioRecorder />
      </Suspense>
    </Box>
  );
} 
 