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
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

function LoginPageContent() {
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
                Check your password and try again. <Link href="/forgot-password" style={{ color: 'inherit', textDecoration: 'underline' }}>Forgot your password?</Link>
              </Typography>
            )}
            {error.includes('verify your email') && (
              <Typography variant="body2" color="text.secondary">
                Check your inbox for a verification link. <Link href="/signup" style={{ color: 'inherit', textDecoration: 'underline' }}>Need to sign up again?</Link>
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        disabled={isLoading}
        sx={{
          mb: 3,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          borderColor: theme.palette.grey[300],
          color: theme.palette.text.primary,
          '&:hover': {
            borderColor: theme.palette.grey[400],
            backgroundColor: theme.palette.grey[50],
          },
        }}
      >
        Continue with Google
      </Button>

      <Divider sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
      </Divider>

      <Box component="form" onSubmit={handleEmailLogin}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          sx={{
            mb: 2,
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
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          sx={{
            mb: 3,
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
          fullWidth
          type="submit"
          variant="contained"
          startIcon={<EmailIcon />}
          disabled={isLoading}
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            ...typography.button,
            padding: spacing.button,
          }}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link 
            href="/signup" 
            style={{ 
              color: theme.palette.primary.main, 
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Sign up
          </Link>
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <Link 
            href="/forgot-password" 
            style={{ 
              color: theme.palette.primary.main, 
              textDecoration: 'none',
            }}
          >
            Forgot your password?
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <SearchParamsWrapper>
      <LoginPageContent />
    </SearchParamsWrapper>
  );
} 