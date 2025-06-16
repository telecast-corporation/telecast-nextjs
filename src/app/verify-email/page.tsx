'use client';

import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import { useTheme as useAppTheme } from '@/contexts/ThemeContext';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmail() {
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend verification email');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 1,
          background: isDarkMode ? theme.palette.background.paper : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: isDarkMode
            ? '0 2px 12px rgba(0,0,0,0.35)'
            : '0 2px 12px rgba(30,64,175,0.08)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: theme.palette.primary.main,
            }}
          >
            Verify Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            We've sent a verification email to:
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 500,
              color: theme.palette.primary.main,
              mb: 3,
            }}
          >
            {email}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please check your email and click the verification link to continue.
          </Typography>
        </Box>

        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {success && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography color="success.main">
              Verification email has been resent!
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleResendEmail}
            disabled={isResending}
            sx={{
              py: 1.5,
              borderRadius: 1,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            href="/login"
            sx={{
              py: 1.5,
              borderRadius: 1,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: isDarkMode 
                  ? 'rgba(96, 165, 250, 0.08)'
                  : 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 