'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Link as MuiLink,
  useTheme,
} from '@mui/material';
import {
  Google as GoogleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signIn('google', {
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.error) {
        setError('Login failed. Please try again.');
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        maxWidth: 700,
        mx: 'auto',
        my: { xs: 4, md: 8 },
        p: { xs: 2, sm: 4 },
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 4,
        fontFamily: 'Open Sans, sans-serif',
      }}
    >
      <Typography
        variant="h2"
        align="center"
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 700,
          mb: 1,
          fontSize: { xs: '2rem', sm: '2.5rem' },
          fontFamily: 'inherit',
        }}
      >
        Welcome Back
      </Typography>
      
      <Typography 
        variant="body1" 
        align="center"
        sx={{ 
          color: 'text.secondary', 
          mb: 4,
          fontSize: '1.1rem'
        }}
      >
        Sign in to continue your journey
      </Typography>

      {error && (
        <Typography sx={{ color: 'error.main', textAlign: 'center', fontSize: '1rem', mb: 3 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={isLoading}
          sx={{
            fontSize: '1.25rem',
            padding: '14px 0',
            borderRadius: '8px',
            fontWeight: 600,
            textTransform: 'none',
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem' }}>
            OR
          </Typography>
        </Divider>

        <Typography sx={{ textAlign: 'center', fontSize: '1rem', color: 'text.secondary' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
            Sign up
          </Link>
        </Typography>

        <Typography sx={{ textAlign: 'center', fontSize: '1rem' }}>
          <Link href="/" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Home
          </Link>
        </Typography>

        <Typography 
          variant="body2" 
          align="center"
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.9rem',
            mt: 2
          }}
        >
          By continuing, you agree to our{' '}
          <Link href="/terms" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </Box>
  );
} 