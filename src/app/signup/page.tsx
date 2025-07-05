'use client';

import { useState, useEffect } from 'react';
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
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/styles/typography';
import { signIn } from 'next-auth/react';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

function SignupPageContent() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, googleSignup, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // Redirect authenticated users to main page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Check for error message from Google OAuth
  useEffect(() => {
    const error = searchParams.get('error');
    const email = searchParams.get('email');
    
    if (error === 'account_exists' && email) {
      setError(`An account with Google email "${email}" already exists. Please sign in instead.`);
      // Clear the error from URL
      router.replace('/signup', { scroll: false });
    }
  }, [searchParams, router]);

  // Check for success message from Google OAuth
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      setSuccess('Account created successfully! Redirecting to main page...');
      // Redirect to main page after a brief delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [searchParams, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Don't render signup form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      // Start Google OAuth flow - it will create account and redirect to main page
      await signIn('google', { 
        callbackUrl: '/',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const result = await signup(formData);
      if (result.success) {
        setSuccess('Account created successfully. Please check your email to verify your account.');
        setFormData({ username: '', email: '', password: '' });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Box
      sx={{
        maxWidth: { xs: '90%', sm: '450px', md: '500px', lg: '550px' },
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 4,
        fontFamily: 'Open Sans, sans-serif',
        minHeight: 'fit-content',
        maxHeight: '50vh',
        overflow: 'auto',
      }}
    >
      <Typography
        variant="h2"
        align="center"
        sx={{
          color: theme.palette.primary.main,
          ...typography.title,
          mb: 1,
        }}
      >
        Create Account
      </Typography>
      
      <Typography 
        variant="body1" 
        align="center"
        sx={{ 
          color: 'text.secondary', 
          ...typography.body,
          mb: 1,
        }}
      >
        Sign up to get started with your account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {/* Google Signup Button removed */}

        {/* Email Signup Form */}
        <Box
          component="form"
          onSubmit={handleEmailSignup}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
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
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
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
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Box>

        {/* Links */}
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography sx={{ ...typography.body, color: 'text.secondary', mb: 0.5 }}>
            Already have an account?{' '}
            <Link 
              href="/login" 
              style={{ 
                color: theme.palette.primary.main, 
                textDecoration: 'none',
                fontWeight: 600 
              }}
            >
              Sign In
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

export default function SignupPage() {
  return (
    <SearchParamsWrapper>
      <SignupPageContent />
    </SearchParamsWrapper>
  );
} 