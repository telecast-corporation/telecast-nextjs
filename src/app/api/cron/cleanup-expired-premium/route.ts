import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a legitimate cron job
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    
    // Find all users who are marked as premium but have expired
    const expiredUsers = await prisma.user.findMany({
      where: {
        isPremium: true,
        premiumExpiresAt: {
          lt: now, // Less than current time
        },
      },
      select: {
        id: true,
        email: true,
        premiumExpiresAt: true,
      },
    });

    console.log(`Found ${expiredUsers.length} users with expired premium`);

    // Update all expired users to set isPremium to false
    if (expiredUsers.length > 0) {
      const result = await prisma.user.updateMany({
        where: {
          isPremium: true,
          premiumExpiresAt: {
            lt: now,
          },
        },
        data: {
          isPremium: false,
        },
      });

      console.log(`Updated ${result.count} users to remove premium access`);
    }

    return NextResponse.json({
      success: true,
      expiredUsersCount: expiredUsers.length,
      updatedCount: expiredUsers.length,
    });

  } catch (error) {
    console.error('Error cleaning up expired premium users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 