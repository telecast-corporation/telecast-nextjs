'use client';

import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import {
  Google as GoogleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
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
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to continue your journey
          </Typography>
        </Box>

        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={isLoading}
            sx={{
              py: 1.5,
              borderColor: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>
        </Box>

        <Divider sx={{ my: 4 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <MuiLink href="/signup" underline="hover">
              Sign up
            </MuiLink>
          </Typography>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            By continuing, you agree to our{' '}
            <MuiLink href="/terms" underline="hover">Terms of Service</MuiLink>
            {' '}and{' '}
            <MuiLink href="/privacy" underline="hover">Privacy Policy</MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 