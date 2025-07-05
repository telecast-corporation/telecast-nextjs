'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

function VerifyEmailPageContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'logging-in'>('loading');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const hasVerified = useRef(false);

  const verifyEmail = useCallback(async (token: string) => {
    // Prevent duplicate verification attempts
    if (hasVerified.current) {
      return;
    }
    hasVerified.current = true;

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setUserEmail(data.user.email);
        
        // Automatically sign in the user after successful verification
        setTimeout(async () => {
          setStatus('logging-in');
          try {
            console.log('🔍 Attempting auto-login with token:', data.token ? `${data.token.substring(0, 8)}...` : 'null');
            
            const result = await signIn('verification', {
              email: data.user.email,
              verificationToken: data.token,
              redirect: false,
            });
            
            console.log('🔍 Auto-login result:', result);
            
            if (result?.ok) {
              // Clean up the verification token
              try {
                await fetch('/api/auth/cleanup-verification', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ token: data.token }),
                });
              } catch (cleanupError) {
                console.error('Failed to cleanup token:', cleanupError);
              }
              
              // Redirect to main page with success message
              router.push('/?message=Email verified and logged in successfully!');
            } else {
              // If automatic login fails, show success but let user login manually
              setStatus('success');
              setMessage('Email verified successfully! Please log in to continue.');
              
              // Clean up the token anyway
              try {
                await fetch('/api/auth/cleanup-verification', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ token: data.token }),
                });
              } catch (cleanupError) {
                console.error('Failed to cleanup token:', cleanupError);
              }
            }
          } catch (loginError) {
            console.error('Auto login error:', loginError);
            setStatus('success');
            setMessage('Email verified successfully! Please log in to continue.');
          }
        }, 2000); // Wait 2 seconds before auto-login
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification.');
    }
  }, [router]);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    verifyEmail(token);
  }, [token, verifyEmail]);

  const handleLogin = () => {
    router.push('/login');
  };

  if (status === 'loading') {
  return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Verifying your email...
          </Typography>
          <Typography color="text.secondary">
            Please wait while we verify your email address.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (status === 'logging-in') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Logging you in...
          </Typography>
          <Typography color="text.secondary">
            Please wait while we sign you in automatically.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        {status === 'success' ? (
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        ) : (
          <Error sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        )}
        
        <Typography variant="h5" gutterBottom>
          {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
        </Typography>
        
        <Alert 
          severity={status === 'success' ? 'success' : 'error'}
          sx={{ mb: 3 }}
        >
          {message}
        </Alert>

        {status === 'success' && (
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {userEmail ? 
                `Your email (${userEmail}) has been successfully verified.` :
                'Your email has been successfully verified.'
              }
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Redirecting you to the main page...
            </Typography>
            <CircularProgress size={24} sx={{ mb: 2 }} />
          </Box>
        )}

        {status === 'error' && (
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              If you're having trouble verifying your email, please try signing up again or contact support.
            </Typography>
          <Button
            variant="outlined"
              onClick={handleLogin}
              sx={{ mr: 2 }}
          >
              Go to Login
          </Button>
        </Box>
        )}
      </Paper>
    </Container>
  );
}

export default function VerifyEmailPage() {
  return (
    <SearchParamsWrapper>
      <VerifyEmailPageContent />
    </SearchParamsWrapper>
  );
} 