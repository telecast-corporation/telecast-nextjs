import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const podcast = await prisma.podcast.findUnique({
      where: { id },
      include: {
        episodes: {
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            audioUrl: true,
            duration: true,
            publishedAt: true,
            isPublished: true,
            episodeNumber: true,
            seasonNumber: true,
            explicit: true,
            keywords: true,
            createdAt: true,
            updatedAt: true,
            fileSize: true,
          },
        },
      },
    });

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    console.log('Podcast data being returned:', {
      id: podcast.id,
      title: podcast.title,
      coverImage: podcast.coverImage
    });

    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return NextResponse.json(
      { error: 'Error fetching podcast' },
      { status: 500 }
    );
  }
}