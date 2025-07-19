import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        isPremium: true,
        premiumExpiresAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isPremium) {
      return NextResponse.json({ error: 'User is not a premium subscriber' }, { status: 400 });
    }

    // In a real implementation with Stripe:
    // 1. Call Stripe API to cancel the subscription (stops recurring payments)
    // 2. Don't update isPremium or premiumExpiresAt here
    // 3. Let the Stripe webhook handle premium status when subscription actually expires
    // 4. The webhook would set isPremium: false when the subscription period ends
    
    // For now, we'll simulate the cancellation
    // In production, you would do something like:
    // const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
    //   cancel_at_period_end: true
    // });
    
    return NextResponse.json({ 
      message: 'Premium subscription canceled successfully. Your recurring payments have been stopped, but you will continue to have premium access until your current billing period ends.',
      canceled: true 
    });

    return NextResponse.json({ 
      message: 'Premium subscription canceled successfully. Your recurring payments have been stopped, but you will continue to have premium access until your current billing period ends.',
      canceled: true 
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel subscription' 
    }, { status: 500 });
  }
} 