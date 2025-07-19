import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!endpointSecret || !sig) {
      return NextResponse.json(
        { error: 'Missing webhook secret or signature' },
        { status: 400 }
      );
    }

    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Update user premium status
      try {
        const email = paymentIntent.receipt_email;
        if (email) {
          // Set premium for 30 days from now
          const premiumExpiresAt = new Date();
          premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);

          await prisma.user.updateMany({
            where: { email },
            data: {
              isPremium: true,
              premiumExpiresAt,
              usedFreeTrial: true, // Mark that they've used a trial (paid)
            },
          });
        }
      } catch (error) {
        // Error updating user premium status
      }
      
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      
      // Handle failed payment - update user premium status
      try {
        const email = failedPayment.receipt_email;
        if (email) {
          
          // Update user premium status to false
          await prisma.user.updateMany({
            where: { email },
            data: {
              isPremium: false,
              premiumExpiresAt: new Date(), // Set to current date
            },
          });
          
          // You could send an email notification here
        }
      } catch (error) {
        // Error handling failed payment
      }
      
      break;
      
    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription;
              try {
          // Try to get customer email from the subscription metadata or try to retrieve customer
          let email = null;
          
          // First try to get customer details
          try {
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            email = (customer as any).email;
          } catch (customerError) {
          
                      // For test events, try to extract email from subscription metadata or use a test email
            if (subscription.metadata && subscription.metadata.email) {
              email = subscription.metadata.email;
            } else {
              // For test events, use a test email
              email = 'test@example.com';
            }
        }
        
        if (email) {
          // Check if user has used free trial
          const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { usedFreeTrial: true }
          });
          
          // Validate and create a proper date for premium expiration
          let premiumExpiresAt = null;
          try {
            const currentPeriodEnd = (subscription as any).current_period_end;
            if (currentPeriodEnd && typeof currentPeriodEnd === 'number') {
              const date = new Date(currentPeriodEnd * 1000);
              if (!isNaN(date.getTime())) {
                premiumExpiresAt = date;
              }
            }
          } catch (dateError) {
            // Invalid date from subscription, using default
          }
          
          if (!premiumExpiresAt) {
            premiumExpiresAt = new Date();
            // If free trial hasn't been used, give 90 days + 1 month (120 days total)
            const daysToAdd = existingUser?.usedFreeTrial ? 30 : 120;
            premiumExpiresAt.setDate(premiumExpiresAt.getDate() + daysToAdd);
          }
          
          await prisma.user.upsert({
            where: { email },
            update: {
              isPremium: true,
              premiumExpiresAt,
              usedFreeTrial: true,
            },
            create: {
              email,
              name: email.split('@')[0],
              isPremium: true,
              premiumExpiresAt,
              usedFreeTrial: true,
            },
          });
        } else {
          // No email found for customer
        }
      } catch (error) {
        // Error handling subscription creation
      }
      break;
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      try {
        // Try to get customer email from the subscription metadata or try to retrieve customer
        let email = null;
        
        // First try to get customer details
                  try {
            const customer = await stripe.customers.retrieve(updatedSubscription.customer as string);
            email = (customer as any).email;
          } catch (customerError) {
            
            // For test events, try to extract email from subscription metadata or use a test email
            if (updatedSubscription.metadata && updatedSubscription.metadata.email) {
              email = updatedSubscription.metadata.email;
            } else {
              // For test events, use a test email
              email = 'test@example.com';
            }
          }
        
        if (email) {
          // Check if user has used free trial
          const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { usedFreeTrial: true }
          });
          
          // Validate and create a proper date for premium expiration
          let premiumExpiresAt = null;
          try {
            const currentPeriodEnd = (updatedSubscription as any).current_period_end;
            if (currentPeriodEnd && typeof currentPeriodEnd === 'number') {
              const date = new Date(currentPeriodEnd * 1000);
              if (!isNaN(date.getTime())) {
                premiumExpiresAt = date;
              }
            }
          } catch (dateError) {
            // Invalid date from subscription update, using default
          }
          
                      // If we couldn't get a valid date, set it to 30 days if free trial used, 120 days if not
            if (!premiumExpiresAt) {
              premiumExpiresAt = new Date();
              const daysToAdd = existingUser?.usedFreeTrial ? 30 : 120;
              premiumExpiresAt.setDate(premiumExpiresAt.getDate() + daysToAdd);
            }
          
          await prisma.user.upsert({
            where: { email },
            update: {
              isPremium: updatedSubscription.status === 'active',
              premiumExpiresAt,
            },
            create: {
              email,
              name: email.split('@')[0],
              isPremium: updatedSubscription.status === 'active',
              premiumExpiresAt,
            },
          });
        }
      } catch (error) {
        // Error handling subscription update
      }
      break;
      
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      
      // Handle subscription cancellation
      // This event fires when a subscription is canceled (either immediately or at period end)
      try {
        // Get the customer to find the email
        const customer = await stripe.customers.retrieve(deletedSubscription.customer as string);
        const email = (customer as any).email;
        
        if (email) {
          // Check if this is a cancellation at period end or immediate cancellation
          const isCancelAtPeriodEnd = deletedSubscription.cancel_at_period_end;
          const currentPeriodEnd = (deletedSubscription as any).current_period_end;
          
          if (isCancelAtPeriodEnd && currentPeriodEnd) {
            // Subscription was canceled but user keeps access until period end
            // Don't update isPremium or premiumExpiresAt - let them expire naturally
            // The premiumExpiresAt field will handle access control
            console.log(`Subscription canceled for ${email}, but access continues until ${new Date(currentPeriodEnd * 1000)}`);
          } else {
            // Immediate cancellation - remove premium access now
            await prisma.user.updateMany({
              where: { email },
              data: {
                isPremium: false,
                premiumExpiresAt: new Date(), // Set to current date to expire immediately
              },
            });
            console.log(`Subscription immediately canceled for ${email}`);
          }
        }
      } catch (error) {
        console.error('Error handling subscription deletion:', error);
      }
      
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      
      // Handle failed invoice payment - update user premium status
      try {
        const email = failedInvoice.customer_email;
        if (email) {
          
          // Update user premium status to false
          await prisma.user.updateMany({
            where: { email },
            data: {
              isPremium: false,
              premiumExpiresAt: new Date(), // Set to current date
            },
          });
          
          // You could send an email notification here
        }
      } catch (error) {
        // Error handling failed invoice payment
      }
      
      break;
      
    default:
      // Unhandled event type
  }

  return NextResponse.json({ received: true });
} 