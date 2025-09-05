import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

const PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_1RkoI5L1gjoL2pfG31JiL1Ut'; // Use environment variable or fallback
const DISCOUNTED_PRICE_ID = process.env.STRIPE_DISCOUNTED_PRICE_ID || 'price_1RkoI5L1gjoL2pfG31JiL1Ut'; // Discounted price for post-trial users

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const user = await getAuth0User(request);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const email = user.email;
    console.log('Creating checkout session for email:', email);

    // Check if user is eligible for post-trial discount
    let priceId = PRICE_ID;
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { 
        usedFreeTrial: true, 
        freeTrialEndedAt: true,
        isPremium: true 
      }
    });

    // Check if user is eligible for discount (used free trial, trial ended within last 30 days, not currently premium)
    if (dbUser?.usedFreeTrial && dbUser.freeTrialEndedAt && !dbUser.isPremium) {
      const trialEndDate = new Date(dbUser.freeTrialEndedAt);
      const now = new Date();
      const daysSinceTrialEnd = Math.floor((now.getTime() - trialEndDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceTrialEnd <= 30) {
        priceId = DISCOUNTED_PRICE_ID;
        console.log(`User eligible for discount: ${daysSinceTrialEnd} days since trial ended`);
      }
    }

    // Create a Checkout Session for subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
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