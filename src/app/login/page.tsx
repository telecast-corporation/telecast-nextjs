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

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Check for success message from signup
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccess(decodeURIComponent(message));
    }
  }, [searchParams]);

  // Check for error message from Google OAuth
  useEffect(() => {
    const error = searchParams.get('error');
    const email = searchParams.get('email');
    
    if (error === 'no_account' && email) {
      setError(`No account found with Google email "${email}". Please sign up first.`);
      // Clear the error from URL
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

  // Redirect authenticated users to main page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

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

  // Don't render login form if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      await login('google');
      // NextAuth will handle the redirect automatically to the main page
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed. Please try again.');
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
      await login('credentials', {
        email: formData.email,
        password: formData.password,
      });
      // Redirect to main page after successful login
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      
      // Clear password field on error for security
      setFormData(prev => ({ ...prev, password: '' }));
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
        Welcome Back
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
        Sign in to continue your journey
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              {error}
            </Typography>
            {error.includes('No account found') && (
              <Typography variant="body2" color="text.secondary">
                Don't have an account? <Link href="/signup" style={{ color: 'inherit', textDecoration: 'underline' }}>Sign up here</Link>
              </Typography>
            )}
            {error.includes('Google email') && (
              <Typography variant="body2" color="text.secondary">
                This Google account is not registered. <Link href="/signup" style={{ color: 'inherit', textDecoration: 'underline' }}>Sign up with Google</Link> to create an account.
              </Typography>
            )}
            {error.includes('Google account') && (
              <Typography variant="body2" color="text.secondary">
                Try signing in with Google instead
              </Typography>
            )}
            {error.includes('Incorrect password') && (
              <Typography variant="body2" color="text.secondary">
                Make sure your password is correct and try again
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
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

        <Divider sx={{ my: 0.5 }}>
          <Typography variant="body1" color="text.secondary" sx={{ ...typography.body }}>
            Or sign in with email
          </Typography>
        </Divider>

        {/* Email Login Form */}
        <Box
          component="form"
          onSubmit={handleEmailLogin}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
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

          {/* Forgot Password Link */}
          <Box sx={{ textAlign: 'right', mt: -0.5 }}>
            <Link 
              href="/forgot-password" 
              style={{ 
                color: theme.palette.primary.main, 
                textDecoration: 'none', 
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Forgot password?
            </Link>
          </Box>

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
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>

        {/* Links */}
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography sx={{ ...typography.body, color: 'text.secondary', mb: 0.5 }}>
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              style={{ 
                color: theme.palette.primary.main, 
                textDecoration: 'none', 
                fontWeight: 600 
              }}
            >
              Sign Up
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