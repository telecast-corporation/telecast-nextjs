import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth0 } from '@/lib/auth0';
import { getOrCreateUser } from '@/lib/auth0-user';

export async function POST(request: NextRequest) {
  try {
    // Get the current user from Auth0 session
    const session = await auth0.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get or create user from database
    const dbUser = await getOrCreateUser(request);

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to get or create user' },
        { status: 500 }
      );
    }

    if (dbUser.usedFreeTrial) {
      return NextResponse.json(
        { success: false, message: 'Free trial already used' },
        { status: 400 }
      );
    }

    // Start free trial (90 days)
    const freeTrialExpiresAt = new Date();
    freeTrialExpiresAt.setDate(freeTrialExpiresAt.getDate() + 90);

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        isPremium: true,
        premiumExpiresAt: freeTrialExpiresAt,
        usedFreeTrial: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Free trial activated successfully! You now have access to all premium features for 90 days.',
      expiresAt: freeTrialExpiresAt.toISOString()
    });

  } catch (error) {
    console.error('Error starting free trial:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to start free trial. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
