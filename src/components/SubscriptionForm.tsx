import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { typography, spacing, borderRadius } from '@/styles/typography';
import { stripePromise } from '@/lib/stripe-client';

const SubscriptionForm: React.FC = () => {
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

    try {
      // Load Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Create checkout session
      const res = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      setError(error.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
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