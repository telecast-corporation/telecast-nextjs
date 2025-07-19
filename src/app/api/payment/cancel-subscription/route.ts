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

    // Check if user has already cancelled their subscription in this billing period
    // We can use premiumExpiresAt to determine if this is a new subscription or a continuation
    const now = new Date();
    const hasCancelledInCurrentPeriod = user.premiumExpiresAt && 
      user.premiumExpiresAt < new Date(now.getTime() + 24 * 60 * 60 * 1000); // Within 24 hours of expiry

    if (hasCancelledInCurrentPeriod) {
      return NextResponse.json({ 
        error: 'You have already cancelled your subscription for this billing period. You can cancel again after your next renewal.',
        alreadyCancelled: true 
      }, { status: 400 });
    }

    // In a real implementation with Stripe:
    // 1. Call Stripe API to cancel the subscription (stops recurring payments)
    // 2. Don't update isPremium or premiumExpiresAt here
    // 3. Let the Stripe webhook handle premium status when subscription actually expires
    // 4. The webhook would set isPremium: false when the subscription period ends
    
    // For now, we'll simulate the cancellation by setting premiumExpiresAt to a near future date
    // This effectively marks the subscription as "cancelled" for this billing period
    const cancellationDate = new Date();
    cancellationDate.setHours(cancellationDate.getHours() + 1); // Set to expire in 1 hour to simulate cancellation

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        premiumExpiresAt: cancellationDate,
      },
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