'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  TextField,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { typography, spacing, borderRadius } from '@/styles/typography';

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await signIn('google', {
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.error) {
        setError('Google login failed. Please try again.');
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
        <Box
      sx={{
        maxWidth: { xs: '100%', sm: 'md', md: 'lg', lg: 'xl' },
        mx: 'auto',
        p: spacing.component,
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
          ...typography.title,
          mb: spacing.section.xs,
        }}
      >
        Welcome Back
      </Typography>
      
      <Typography 
        variant="body1" 
        align="center"
        sx={{ 
          color: 'text.secondary', 
          ...typography.body,
          mb: spacing.section,
        }}
      >
        Sign in to continue your journey
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Google Login Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={isLoading}
          sx={{
            ...typography.button,
            padding: spacing.button,
            borderRadius: borderRadius.medium,
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

        <Divider sx={{ my: spacing.gap }}>
          <Typography variant="body2" color="text.secondary" sx={{ ...typography.caption }}>
            OR
          </Typography>
        </Divider>

        {/* Email Login Form */}
        <Box
          component="form"
          onSubmit={handleEmailLogin}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.medium,
                ...typography.input,
              },
              '& .MuiInputLabel-root': {
                ...typography.label,
              },
              '& .MuiOutlinedInput-input': {
                padding: spacing.input,
              },
            }}
          />
          
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: borderRadius.medium,
                ...typography.input,
              },
              '& .MuiInputLabel-root': {
                ...typography.label,
              },
              '& .MuiOutlinedInput-input': {
                padding: spacing.input,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            startIcon={<EmailIcon />}
            sx={{
              ...typography.button,
              padding: spacing.button,
              borderRadius: borderRadius.medium,
              textTransform: 'none',
              mt: spacing.gap.xs,
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Email'}
          </Button>
        </Box>

        {/* Links */}
        <Box sx={{ textAlign: 'center', mt: spacing.section }}>
          <Typography sx={{ ...typography.body, color: 'text.secondary', mb: spacing.gap }}>
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              style={{ 
                color: theme.palette.primary.main, 
                textDecoration: 'none', 
                fontWeight: 600 
              }}
            >
              Sign up
            </Link>
          </Typography>

          <Typography sx={{ ...typography.body }}>
            <Link 
              href="/" 
              style={{ 
                color: theme.palette.primary.main, 
                textDecoration: 'none', 
                fontWeight: 600 
              }}
            >
              ← Back to Home
            </Link>
          </Typography>
        </Box>

        {/* Terms and Privacy */}
        <Typography 
          variant="body2" 
          align="center"
          sx={{ 
            color: 'text.secondary',
            ...typography.caption,
            mt: spacing.gap,
          }}
        >
          By continuing, you agree to our{' '}
          <Link 
            href="/terms" 
            style={{ 
              color: theme.palette.primary.main, 
              textDecoration: 'none' 
            }}
          >
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link 
            href="/privacy" 
            style={{ 
              color: theme.palette.primary.main, 
              textDecoration: 'none' 
            }}
          >
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </Box>
  );
} 