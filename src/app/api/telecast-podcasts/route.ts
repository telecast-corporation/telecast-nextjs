import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      author,
      language,
      category,
      explicit,
      episodeTitle,
      episodeDescription,
      episodeType,
      episodeNumber,
      pubDate,
      audioFileName,
      audioFileSize,
      audioFileType,
      audioFileData,
    } = body;

    // Validate required fields
    if (!title || !description || !author || !episodeTitle || !episodeDescription || !audioFileData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create Telecast podcast
    const telecastPodcast = await prisma.telecastPodcast.create({
      data: {
        title,
        description,
        author,
        language: language || 'en',
        category: category || 'Other',
        explicit: explicit || false,
        episodeTitle,
        episodeDescription,
        episodeType: episodeType || 'full',
        episodeNumber: episodeNumber || null,
        pubDate: pubDate ? new Date(pubDate) : new Date(),
        audioFileName,
        audioFileSize,
        audioFileType,
        audioFileData,
        userId: user.id,
        published: true,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      telecastPodcast: {
        id: telecastPodcast.id,
        title: telecastPodcast.title,
        episodeTitle: telecastPodcast.episodeTitle,
        publishedAt: telecastPodcast.publishedAt,
      },
    });

  } catch (error) {
    console.error('Error creating Telecast podcast:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's Telecast podcasts
    const telecastPodcasts = await prisma.telecastPodcast.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        episodeTitle: true,
        published: true,
        publishedAt: true,
        views: true,
        likes: true,
        createdAt: true,
        audioFileData: true,
        audioFileName: true,
        audioFileType: true,
      },
    });

    return NextResponse.json({ telecastPodcasts });

  } catch (error) {
    console.error('Error fetching Telecast podcasts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 