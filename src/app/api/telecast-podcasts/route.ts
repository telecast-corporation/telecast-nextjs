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

    // Check for duplicate: same user, episodeTitle, and audioFileName
    const existingPodcast = await prisma.telecastPodcast.findFirst({
      where: {
        userId: user.id,
        episodeTitle,
        audioFileName,
      },
    });
    if (existingPodcast) {
      return NextResponse.json({ error: 'Podcast already exists' }, { status: 409 });
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
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // If ?title= is provided, check for existence
  if (title) {
    const existing = await prisma.telecastPodcast.findFirst({
      where: { userId: user.id, title },
      select: { description: true },
    });
    if (existing) {
      return NextResponse.json({ exists: true, description: existing.description });
    } else {
      return NextResponse.json({ exists: false });
    }
  }

  // Get user's Telecast podcasts
  const telecastPodcasts = await prisma.telecastPodcast.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      author: true,
      language: true,
      category: true,
      explicit: true,
      episodeTitle: true,
      episodeDescription: true,
      episodeType: true,
      episodeNumber: true,
      pubDate: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      audioFileData: true,
      audioFileName: true,
      audioFileType: true,
      audioFileSize: true,
    },
  });
  return NextResponse.json({ telecastPodcasts });
} 