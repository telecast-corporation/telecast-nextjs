import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Alert } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/styles/typography';

const SubscriptionForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check if user is already premium
    if (isAuthenticated && user?.isPremium) {
      setError('You are already a premium user!');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // Redirect to Stripe Checkout
    } else {
      setError(data.error || 'Failed to start checkout');
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubscribe} sx={{ mt: 2 }}>
      <Typography 
        variant="h6" 
        align="center" 
        sx={{ 
          mb: 3,
          ...typography.subheading,
          color: '#1F2937',
          fontWeight: 600,
          fontSize: '1.1rem',
        }}
      >
        Subscribe to Premium
      </Typography>
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.medium,
            height: '48px',
            ...typography.input,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563EB',
              borderWidth: '2px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563EB',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6B7280',
            ...typography.label,
            '&.Mui-focused': {
              color: '#2563EB',
              fontWeight: 600,
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '12px 16px',
            fontSize: '0.875rem',
            color: '#374151',
            '&::placeholder': {
              color: '#9CA3AF',
              opacity: 1,
            },
          },
        }}
      />
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: borderRadius.medium,
            fontSize: '0.875rem',
            '& .MuiAlert-icon': {
              fontSize: '1.25rem',
            },
            '& .MuiAlert-message': {
              padding: '8px 0',
            },
          }}
        >
          {error}
        </Alert>
      )}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
        sx={{
          background: '#2563EB',
          color: 'white',
          fontWeight: 600,
          py: 1.5,
          borderRadius: borderRadius.medium,
          textTransform: 'none',
          fontSize: '0.875rem',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
          '&:hover': {
            background: '#1D4ED8',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            background: '#9CA3AF',
            color: 'white',
            transform: 'none',
            boxShadow: 'none',
          },
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? 'Redirecting...' : 'Subscribe with Stripe'}
      </Button>
    </Box>
  );
};

export default SubscriptionForm; 