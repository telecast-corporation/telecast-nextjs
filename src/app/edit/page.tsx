'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import AudioRecorder from '../../components/AudioRecorder';

export default function EditPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Only redirect if we're certain the user is unauthenticated
    if (status === 'unauthenticated' && authChecked) {
      // Store the current page as the callback URL
      const callbackUrl = encodeURIComponent('/edit');
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

  // If authenticated, render the AudioRecorder (with custom audio editor)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AudioRecorder />
    </Suspense>
  );
} 
 