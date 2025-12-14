import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { prisma } from '@/lib/prisma';
import { SpotifyPodcast } from '@/lib/spotify';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuth0User(req as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { podcast: externalPodcast }: { podcast: SpotifyPodcast } = await req.json();

    const existingPodcast = await prisma.podcast.findFirst({
      where: {
        AND: [
          { userId: dbUser.id },
          { title: externalPodcast.name },
        ],
      },
    });

    if (existingPodcast) {
      return NextResponse.json({ error: 'Podcast already exists in your list' }, { status: 409 });
    }

    const newPodcast = await prisma.podcast.create({
      data: {
        title: externalPodcast.name,
        description: externalPodcast.description,
        coverImage: externalPodcast.images[0]?.url || '',
        category: '', // Spotify API does not provide categories for shows
        tags: [],
        author: externalPodcast.publisher,
        userId: dbUser.id,
      },
    });

    return NextResponse.json(newPodcast);
  } catch (error) {
    console.error('Error adding external podcast:', error);
    return NextResponse.json(
      { error: 'Error adding external podcast' },
      { status: 500 }
    );
  }
}
