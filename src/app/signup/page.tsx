'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { typography, spacing, borderRadius } from '@/styles/typography';
import { Box, Typography, Button, useTheme, Divider, Alert } from '@mui/material';
import { Google as GoogleIcon, Email as EmailIcon } from '@mui/icons-material';
import { signIn } from 'next-auth/react';

export default function SignUp() {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await signIn('google', {
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.error) {
        setError('Google signup failed. Please try again.');
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Sign up failed');
      }
      
      // Show success message instead of redirecting
      setSuccess(data.message || 'Account created successfully! You can now log in.');
      
      // Clear form
      setUsername('');
      setEmail('');
      setPassword('');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        Create your account
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
        Join us to start your journey
      </Typography>
      
      <style jsx global>{`
        input::placeholder {
          font-size: 0.9rem !important;
        }
      `}</style>

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
        {/* Google Signup Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignup}
          disabled={loading}
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
          {loading ? 'Signing up...' : 'Continue with Google'}
        </Button>

        <Divider sx={{ my: 0.5 }}>
          <Typography variant="body1" color="text.secondary" sx={{ ...typography.body }}>
            Or sign up with email
          </Typography>
        </Divider>

        {/* Email Signup Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
        >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="username" sx={{ mb: 0.5, ...typography.subheading, color: 'text.primary' }}>
            Username
          </Typography>
          <input
            type="text"
            id="username"
            name="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            style={{
              padding: '0.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: typography.input.fontSize.lg || '0.9rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="email" sx={{ mb: 0.5, ...typography.subheading, color: 'text.primary' }}>
            Email
          </Typography>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              padding: '0.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: typography.input.fontSize.lg || '0.9rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="password" sx={{ mb: 0.5, ...typography.subheading, color: 'text.primary' }}>
            Password
          </Typography>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              padding: '0.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: typography.input.fontSize.lg || '0.9rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={<EmailIcon />}
            sx={{
              ...typography.button,
              padding: spacing.button,
              borderRadius: borderRadius.medium,
              textTransform: 'none',
              mt: 1,
            }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
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
              Sign in
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
      </Box>
    </Box>
  );
} 