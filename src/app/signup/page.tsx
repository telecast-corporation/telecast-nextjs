'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Typography, Button, useTheme } from '@mui/material';

export default function SignUp() {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
          mb: 3,
          fontSize: { xs: '2rem', sm: '2.5rem' },
          fontFamily: 'inherit',
        }}
      >
        Create your account
      </Typography>
      
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="username" sx={{ mb: 1, fontWeight: 600, color: 'text.primary', fontSize: '1.2rem' }}>
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
              padding: '1rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 10,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.2rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="email" sx={{ mb: 1, fontWeight: 600, color: 'text.primary', fontSize: '1.2rem' }}>
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
              padding: '1rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 10,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.2rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="password" sx={{ mb: 1, fontWeight: 600, color: 'text.primary', fontSize: '1.2rem' }}>
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
              padding: '1rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 10,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.2rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>

        {error && (
          <Typography sx={{ color: 'error.main', textAlign: 'center', fontSize: '1rem' }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography sx={{ color: 'success.main', textAlign: 'center', fontSize: '1rem' }}>
            {success}
          </Typography>
        )}

        <Button
          type="submit"
          disabled={loading}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            fontSize: '1.25rem',
            padding: '14px 0',
            borderRadius: '8px',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            mt: 2,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>

        <Typography sx={{ textAlign: 'center', fontSize: '1rem', color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>

        <Typography sx={{ textAlign: 'center', fontSize: '1rem' }}>
          <Link href="/" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Home
          </Link>
        </Typography>
      </Box>
    </Box>
  );
} 