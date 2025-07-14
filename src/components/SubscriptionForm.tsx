import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Alert } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

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
      <Typography variant="h5" align="center" gutterBottom>
        Subscribe to Premium
      </Typography>
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Redirecting...' : 'Subscribe with Stripe'}
      </Button>
    </Box>
  );
};

export default SubscriptionForm; 