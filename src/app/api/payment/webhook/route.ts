import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  console.log("=== WEBHOOK CALLED ===");
  console.log("Time:", new Date().toISOString());
  console.log("URL:", request.url);
  console.log("Method:", request.method);
  
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  console.log("Signature present:", !!sig);
  console.log("Body length:", body.length);
  console.log("Body preview:", body.substring(0, 200) + "...");

  let event: Stripe.Event;

  try {
    console.log("Endpoint secret present:", !!endpointSecret);
    if (!endpointSecret || !sig) {
      console.log("Missing webhook secret or signature");
      return NextResponse.json(
        { error: 'Missing webhook secret or signature' },
        { status: 400 }
      );
    }

    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log("Event constructed successfully");
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  console.log('Processing webhook event:', event.type);
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update user premium status
      try {
        const email = paymentIntent.receipt_email;
        if (email) {
          // Set premium for 90 days from now
          const premiumExpiresAt = new Date();
          premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 90);
          
          await prisma.user.updateMany({
            where: { email },
            data: {
              isPremium: true,
              premiumExpiresAt,
              usedFreeTrial: true, // Mark that they've used a trial (paid)
            },
          });
          
          console.log(`Updated premium status for user: ${email}`);
        }
      } catch (error) {
        console.error('Error updating user premium status:', error);
      }
      
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', failedPayment.id);
      
      // Handle failed payment - could send email notification
      try {
        const email = failedPayment.receipt_email;
        if (email) {
          console.log(`Payment failed for user: ${email}`);
          // You could send an email notification here
        }
      } catch (error) {
        console.error('Error handling failed payment:', error);
      }
      
      break;
      
    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription created:', subscription.id);
      console.log('Subscription data:', JSON.stringify(subscription, null, 2));
      try {
        // Try to get customer email from the subscription metadata or try to retrieve customer
        let email = null;
        
        // First try to get customer details
        try {
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          email = (customer as any).email;
          console.log('Customer email from customer retrieve:', email);
        } catch (customerError) {
          console.log('Could not retrieve customer, trying alternative methods');
          
          // For test events, try to extract email from subscription metadata or use a test email
          if (subscription.metadata && subscription.metadata.email) {
            email = subscription.metadata.email;
          } else {
            // For test events, use a test email
            email = 'test@example.com';
            console.log('Using test email for subscription:', email);
          }
        }
        
        if (email) {
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
            console.log('Invalid date from subscription, using default');
          }
          
          // If we couldn't get a valid date, set it to 30 days from now
          if (!premiumExpiresAt) {
            premiumExpiresAt = new Date();
            premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);
          }
          
          console.log('Premium expires at:', premiumExpiresAt);
          
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
          console.log(`Upserted user: ${email}`);
        } else {
          console.log('No email found for customer');
        }
      } catch (error) {
        console.error('Error handling subscription creation:', error);
      }
      break;
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      console.log('Subscription updated:', updatedSubscription.id);
      try {
        // Try to get customer email from the subscription metadata or try to retrieve customer
        let email = null;
        
        // First try to get customer details
        try {
          const customer = await stripe.customers.retrieve(updatedSubscription.customer as string);
          email = (customer as any).email;
          console.log('Customer email from customer retrieve:', email);
        } catch (customerError) {
          console.log('Could not retrieve customer, trying alternative methods');
          
          // For test events, try to extract email from subscription metadata or use a test email
          if (updatedSubscription.metadata && updatedSubscription.metadata.email) {
            email = updatedSubscription.metadata.email;
          } else {
            // For test events, use a test email
            email = 'test@example.com';
            console.log('Using test email for subscription update:', email);
          }
        }
        
        if (email) {
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
            console.log('Invalid date from subscription update, using default');
          }
          
          // If we couldn't get a valid date, set it to 30 days from now
          if (!premiumExpiresAt) {
            premiumExpiresAt = new Date();
            premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);
          }
          
          console.log('Premium expires at:', premiumExpiresAt);
          
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
          console.log(`Upserted user: ${email}`);
        }
      } catch (error) {
        console.error('Error handling subscription update:', error);
      }
      break;
      
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      console.log('Subscription deleted:', deletedSubscription.id);
      
      // Handle subscription cancellation
      try {
        // Get the customer to find the email
        const customer = await stripe.customers.retrieve(deletedSubscription.customer as string);
        const email = (customer as any).email;
        
        if (email) {
          // First, try to find the user
          let user = await prisma.user.findUnique({
            where: { email },
          });
          
          // If user doesn't exist, create them (unlikely for deletion, but safe)
          if (!user) {
            console.log(`User not found, creating new user: ${email}`);
            user = await prisma.user.create({
              data: {
                email,
                name: email.split('@')[0],
                isPremium: false,
                premiumExpiresAt: null,
              },
            });
            console.log(`Created new user: ${email}`);
          } else {
            // Update existing user
            await prisma.user.update({
              where: { email },
              data: {
                isPremium: false,
                premiumExpiresAt: null,
              },
            });
            console.log(`Removed premium status for user: ${email}`);
          }
        }
      } catch (error) {
        console.error('Error handling subscription deletion:', error);
      }
      
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      console.log('Invoice payment failed:', failedInvoice.id);
      
      // Handle failed invoice payment
      try {
        const email = failedInvoice.customer_email;
        if (email) {
          console.log(`Invoice payment failed for user: ${email}`);
          // You could send an email notification here
        }
      } catch (error) {
        console.error('Error handling failed invoice payment:', error);
      }
      
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 