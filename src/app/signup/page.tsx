'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { typography, spacing, borderRadius } from '@/styles/typography';
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
          mb: spacing.section,
        }}
      >
        Create your account
      </Typography>
      
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: spacing.gap }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="username" sx={{ mb: 1, ...typography.label, color: 'text.primary' }}>
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
              padding: '1.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.8rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="email" sx={{ mb: 1, ...typography.label, color: 'text.primary' }}>
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
              padding: '1.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.8rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography component="label" htmlFor="password" sx={{ mb: 1, ...typography.label, color: 'text.primary' }}>
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
              padding: '1.75rem',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: borderRadius.medium,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: '1.8rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </Box>

        {error && (
          <Typography sx={{ color: 'error.main', textAlign: 'center', ...typography.body }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography sx={{ color: 'success.main', textAlign: 'center', ...typography.body }}>
            {success}
          </Typography>
        )}

        <Button
          type="submit"
          disabled={loading}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            ...typography.button,
            padding: spacing.button,
            borderRadius: borderRadius.medium,
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            mt: spacing.gap,
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

        <Typography sx={{ textAlign: 'center', ...typography.body, color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>

        <Typography sx={{ textAlign: 'center', ...typography.body }}>
          <Link href="/" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Home
          </Link>
        </Typography>
      </Box>
    </Box>
  );
} 