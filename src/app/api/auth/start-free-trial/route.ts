import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      const errorMessage = encodeURIComponent('User not authenticated');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/free-trial-result?success=false&message=${errorMessage}`
      );
    }

    // Check if user already used free trial
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      const errorMessage = encodeURIComponent('User not found');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/free-trial-result?success=false&message=${errorMessage}`
      );
    }

    if (user.usedFreeTrial) {
      const errorMessage = encodeURIComponent('Free trial already used');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/free-trial-result?success=false&message=${errorMessage}`
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

    const successMessage = encodeURIComponent('Free trial activated successfully! You now have access to all premium features for 90 days.');
    const expiresAt = encodeURIComponent(freeTrialExpiresAt.toISOString());
    
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/free-trial-result?success=true&message=${successMessage}&expiresAt=${expiresAt}`
    );

  } catch (error) {
    console.error('Error starting free trial:', error);
    const errorMessage = encodeURIComponent('Failed to start free trial. Please try again.');
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/free-trial-result?success=false&message=${errorMessage}`
    );
  }
} 