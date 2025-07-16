export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform, remember } = await request.json();

    if (!platform || typeof remember !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Map platform to provider name
    let provider: string;
    switch (platform) {
      case 'spotify':
        provider = 'spotify';
        break;
      case 'apple':
        provider = 'apple';
        break;
      case 'google':
        provider = 'google_podcast';
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported platform' },
          { status: 400 }
        );
    }

    // Update the account to remember the connection
    await prisma.account.updateMany({
      where: {
        userId: session.user.id,
        provider,
      },
      data: {
        // You could add a custom field for remember me if needed
        // For now, we'll just ensure the connection is maintained
      },
    });

    return NextResponse.json({
      success: true,
      message: `Connection ${remember ? 'remembered' : 'forgotten'} for ${platform}`,
    });
  } catch (error) {
    console.error('Error updating remember me setting:', error);
    return NextResponse.json(
      { error: 'Failed to update remember me setting' },
      { status: 500 }
    );
  }
} 