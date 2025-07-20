import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

const PRICE_ID = 'price_1RkoI5L1gjoL2pfG31JiL1Ut'; // CAD $9.99/month

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const user = await getAuth0User(request);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const email = user.email;
    console.log('Creating checkout session for email:', email);

    // Create a Checkout Session for subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment?checkout=cancel`,
      allow_promotion_codes: true,
      metadata: {
        email,
      },
      subscription_data: {
        metadata: {
          email,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
} 