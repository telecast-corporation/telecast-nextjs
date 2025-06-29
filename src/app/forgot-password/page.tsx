'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Link,
} from '@mui/material';
import { Email as EmailIcon, ArrowBack } from '@mui/icons-material';
import { typography, spacing, borderRadius } from '@/styles/typography';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Failed to send reset email.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: { xs: '90%', sm: '450px', md: '500px', lg: '550px' },
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 4,
        backgroundColor: 'background.paper',
        boxShadow: 4,
        fontFamily: 'Open Sans, sans-serif',
        minHeight: 'fit-content',
        mt: 8,
      }}
    >
      <Typography
        variant="h2"
        align="center"
        sx={{
          color: 'primary.main',
          ...typography.title,
          mb: 1,
        }}
      >
        Forgot Password
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
        Enter your email address and we'll send you a link to reset your password.
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <TextField
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          InputProps={{
            startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />, 
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{
            ...typography.button,
            padding: spacing.button,
            borderRadius: borderRadius.medium,
            textTransform: 'none',
            fontWeight: 600,
            mt: spacing.gap.xs,
          }}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#2563eb',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          <ArrowBack sx={{ mr: 1, fontSize: 16 }} />
          Back to Login
        </Link>
      </Box>
    </Box>
  );
} 