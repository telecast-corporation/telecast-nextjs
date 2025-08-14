import { loadStripe } from '@stripe/stripe-js';

// Get the publishable key from environment variables
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

// Load Stripe with the publishable key
export const stripePromise = loadStripe(publishableKey);

// Export the publishable key for debugging
export const getStripePublishableKey = () => publishableKey;
