import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth0-user';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  try {
    // Ensure user is authenticated
    const user = await getOrCreateUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Disconnecting Spotify for user:', user.id);

    // Delete the platform connection
    await prisma.platformConnection.deleteMany({
      where: {
        userId: user.id,
        platform: 'spotify'
      }
    });

    console.log('Spotify disconnected for user:', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Spotify:', error);
    return NextResponse.json(
      { error: 'Error disconnecting Spotify' },
      { status: 500 }
    );
  }
} 