import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth0-user';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Ensure user is authenticated
    const user = await getOrCreateUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's platform connections
    const connections = await prisma.platformConnection.findMany({
      where: { userId: user.id },
      select: {
        platform: true,
        expiresAt: true,
        updatedAt: true
      }
    });

    // Check if connections are still valid (not expired)
    const now = new Date();
    const status = {
      spotify: false,
      apple: false,
      google: false,
      telecast: true // Always true since it's our platform
    };

    connections.forEach(connection => {
      if (connection.platform in status) {
        // Check if token is not expired (with 1 hour buffer)
        const isExpired = connection.expiresAt && connection.expiresAt < new Date(now.getTime() + 60 * 60 * 1000);
        status[connection.platform as keyof typeof status] = !isExpired;
      }
    });

    console.log('Platform status for user:', user.id, status);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking platform status:', error);
    return NextResponse.json(
      { error: 'Error checking platform status' },
      { status: 500 }
    );
  }
} 