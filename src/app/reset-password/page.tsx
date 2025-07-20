'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { typography, spacing, borderRadius } from '@/styles/typography';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

function ResetPasswordPageContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No reset token provided.');
      setIsValidating(false);
    } else {
      setIsValidating(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
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
          textAlign: 'center',
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Validating reset token...
        </Typography>
      </Box>
    );
  }

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
        Reset Password
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
        Enter your new password below.
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
          <br />
          Redirecting to login page...
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          label="New Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
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
            startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />, 
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirm New Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
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
            startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />, 
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          sx={{
            ...typography.button,
            padding: spacing.button,
            borderRadius: borderRadius.medium,
            textTransform: 'none',
            mt: spacing.gap.xs,
          }}
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </Box>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <SearchParamsWrapper>
      <ResetPasswordPageContent />
    </SearchParamsWrapper>
  );
} 