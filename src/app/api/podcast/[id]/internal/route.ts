import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: params.id },
      include: {
        episodes: {
          orderBy: { publishDate: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            audioUrl: true,
            duration: true,
            publishDate: true,
            episodeNumber: true,
            seasonNumber: true,
            explicit: true,
            keywords: true,
            views: true,
            likes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return NextResponse.json(
      { error: 'Error fetching podcast' },
      { status: 500 }
    );
  }
} 