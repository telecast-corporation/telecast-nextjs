import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // No need to log here, but if you do, be consistent with the returned data
    // console.log('Podcast data being returned:', podcast);

    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return NextResponse.json(
      { error: 'Error fetching podcast' },
      { status: 500 }
    );
  }
}
