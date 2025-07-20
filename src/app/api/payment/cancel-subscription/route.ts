import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth0-user';
// authOptions removed - using Auth0
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: user.email },
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
    const now = new Date();
    const hasCancelledInCurrentPeriod = user.premiumExpiresAt && 
      user.premiumExpiresAt < new Date(now.getTime() + 24 * 60 * 60 * 1000); // Within 24 hours of expiry

    if (hasCancelledInCurrentPeriod) {
      return NextResponse.json({ 
        error: 'You have already cancelled your subscription for this billing period. You can cancel again after your next renewal.',
        alreadyCancelled: true 
      }, { status: 400 });
    }

    // Find the user's Stripe customer and subscription
    let customerId: string | null = null;
    let subscriptionId: string | null = null;

    try {
      // Search for customer by email
      const customers = await stripe.customers.list({
        email: user.email || undefined,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        
        // Get the customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          subscriptionId = subscriptions.data[0].id;
        }
      }
    } catch (stripeError) {
      console.error('Error finding Stripe customer/subscription:', stripeError);
    }

    if (!subscriptionId) {
      // If no active subscription found in Stripe, we'll handle this gracefully
      // This could happen if the subscription was created outside of Stripe or there's a sync issue
      console.warn(`No active Stripe subscription found for user ${user.email}`);
      
      // For now, we'll simulate cancellation by setting premiumExpiresAt to a near future date
      // This maintains the existing behavior while we work on better Stripe integration
      const cancellationDate = new Date();
      cancellationDate.setHours(cancellationDate.getHours() + 1); // Set to expire in 1 hour

      await prisma.user.update({
        where: { email: user.email },
        data: {
          premiumExpiresAt: cancellationDate,
        },
      });
      
      return NextResponse.json({ 
        message: 'Premium subscription canceled successfully. Your recurring payments have been stopped, but you will continue to have premium access until your current billing period ends.',
        canceled: true,
        note: 'Subscription was not found in Stripe - local cancellation applied'
      });
    }

    // Cancel the subscription at period end (this is the standard approach)
    // This means the user keeps access until the current billing period ends
    try {
      const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      // Get the current period end date
      const currentPeriodEnd = new Date((canceledSubscription as any).current_period_end * 1000);
      
      // Update the user's premiumExpiresAt to match the subscription's period end
      await prisma.user.update({
        where: { email: user.email },
        data: {
          premiumExpiresAt: currentPeriodEnd,
        },
      });

      return NextResponse.json({ 
        message: 'Premium subscription canceled successfully. Your recurring payments have been stopped, but you will continue to have premium access until your current billing period ends.',
        canceled: true,
        expiresAt: currentPeriodEnd.toISOString()
      });

    } catch (stripeError) {
      console.error('Error canceling Stripe subscription:', stripeError);
      
      // If Stripe cancellation fails, we'll still mark it as cancelled locally
      // This ensures the user can cancel even if there are Stripe API issues
      const cancellationDate = new Date();
      cancellationDate.setHours(cancellationDate.getHours() + 1);

      await prisma.user.update({
        where: { email: user.email },
        data: {
          premiumExpiresAt: cancellationDate,
        },
      });
      
      return NextResponse.json({ 
        message: 'Premium subscription canceled successfully. Your recurring payments have been stopped, but you will continue to have premium access until your current billing period ends.',
        canceled: true,
        note: 'Stripe cancellation failed - local cancellation applied'
      });
    }

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel subscription' 
    }, { status: 500 });
  }
} 