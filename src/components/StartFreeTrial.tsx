'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, CircularProgress, Alert } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

interface StartFreeTrialProps {
  variant?: 'contained' | 'outlined';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export default function StartFreeTrial({ 
  variant = 'contained', 
  fullWidth = false,
  children = 'Start Free Trial'
}: StartFreeTrialProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartFreeTrial = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/free-trial/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push(`/free-trial-result?success=true&message=${encodeURIComponent(result.message)}&expiresAt=${encodeURIComponent(result.expiresAt)}`);
      } else {
        router.push(`/free-trial-result?success=false&message=${encodeURIComponent(result.message || 'Failed to start free trial')}`);
      }
    } catch (error) {
      console.error('Error starting free trial:', error);
      setError('Failed to start free trial. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button
        variant={variant}
        fullWidth={fullWidth}
        onClick={handleStartFreeTrial}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} /> : <StarIcon />}
        sx={{
          py: 1.5,
          px: 3,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: '1rem',
          ...(variant === 'contained' && {
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
            },
          }),
          ...(variant === 'outlined' && {
            borderColor: '#F59E0B',
            color: '#F59E0B',
            '&:hover': {
              borderColor: '#D97706',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
            },
          }),
          transition: 'all 0.2s ease',
        }}
      >
        {isLoading ? 'Starting Trial...' : children}
      </Button>
    </>
  );
}
