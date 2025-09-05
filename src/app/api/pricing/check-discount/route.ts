import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const user = await getAuth0User(request);
    
    if (!user?.email) {
      return NextResponse.json({ 
        eligible: false, 
        price: 17.99,
        message: 'Authentication required' 
      });
    }

    const email = user.email;

    // Check if user is eligible for post-trial discount
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
        return NextResponse.json({
          eligible: true,
          price: 15.99,
          daysSinceTrialEnd,
          message: `You're eligible for our special discount! Only $15.99/month for the next ${30 - daysSinceTrialEnd} days.`
        });
      }
    }

    return NextResponse.json({
      eligible: false,
      price: 17.99,
      message: 'Standard pricing applies'
    });

  } catch (error) {
    console.error('Error checking discount eligibility:', error);
    return NextResponse.json({ 
      eligible: false, 
      price: 17.99,
      error: 'Failed to check discount eligibility' 
    }, { status: 500 });
  }
}
