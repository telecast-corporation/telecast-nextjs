export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getValidAccessToken } from '@/lib/podcast-platforms';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check each platform with automatic token refresh
    const platformStatus = {
      spotify: false,
      apple: false,
      google: false,
    };

    // Check each platform
    const platforms = ['spotify', 'apple', 'google'];
    
    for (const platform of platforms) {
      try {
        const accessToken = await getValidAccessToken(session.user.id, platform);
        platformStatus[platform as keyof typeof platformStatus] = !!accessToken;
      } catch (error) {
        console.error(`Error checking ${platform} status:`, error);
        platformStatus[platform as keyof typeof platformStatus] = false;
      }
    }

    return NextResponse.json(platformStatus);
  } catch (error) {
    console.error('Error checking platform status:', error);
    return NextResponse.json(
      { error: 'Failed to check platform status' },
      { status: 500 }
    );
  }
} 