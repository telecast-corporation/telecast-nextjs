'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Container,
} from '@mui/material';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  description?: string;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'usd',
  onSuccess,
  onError,
  description,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          metadata: {
            email,
            description: description || 'Payment for Telecast service',
          },
        }),
      });

      const { clientSecret, error: intentError } = await response.json();

      if (intentError) {
        throw new Error(intentError);
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            email,
          },
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment failed');
      }

      // Confirm payment on backend
      const confirmResponse = await fetch('/api/payment/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: clientSecret.split('_secret_')[0],
        }),
      });

      const confirmResult = await confirmResponse.json();

      if (confirmResult.success) {
        onSuccess?.(confirmResult.paymentIntent.id);
      } else {
        throw new Error(confirmResult.error || 'Payment confirmation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '14px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontSize: { xs: 18, sm: 20 } }}>
          Payment
        </Typography>
        
        {description && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2, fontSize: 13 }}>
            {description}
          </Typography>
        )}

        <Typography variant="body1" component="h2" gutterBottom sx={{ fontSize: 14, fontWeight: 600 }}>
          Amount: ${amount.toFixed(2)} {currency.toUpperCase()}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            size="small"
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom sx={{ fontSize: 13, fontWeight: 500 }}>
              Card Details
            </Typography>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 1.5,
                backgroundColor: '#fafafa',
              }}
            >
              <CardElement options={cardElementOptions} />
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: 12 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="medium"
            disabled={!stripe || loading}
            sx={{ mt: 2, fontSize: 14 }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  // Check if Stripe is properly configured
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2, fontSize: 12 }}>
            Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables.
          </Alert>
          <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontSize: { xs: 18, sm: 20 } }}>
            Payment Form Preview
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2, fontSize: 13 }}>
            This is a preview of the payment form. Configure Stripe to enable actual payments.
          </Typography>
          <Typography variant="body1" component="h2" gutterBottom sx={{ fontSize: 14, fontWeight: 600 }}>
            Amount: ${props.amount.toFixed(2)} {props.currency?.toUpperCase()}
          </Typography>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="contained" disabled size="medium" sx={{ fontSize: 14 }}>
              Configure Stripe to Enable Payments
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm; 