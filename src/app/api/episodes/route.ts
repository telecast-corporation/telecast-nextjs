import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadPodcastFile } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const podcastId = formData.get('podcastId') as string;
    const audioFile = formData.get('audioFile') as File;
    const episodeNumber = formData.get('episodeNumber') as string;
    const seasonNumber = formData.get('seasonNumber') as string;
    const keywords = (formData.get('keywords') as string)?.split(',').map(k => k.trim()) || [];

    if (!title || !description || !podcastId || !audioFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if podcast exists and belongs to user
    const podcast = await prisma.podcast.findUnique({
      where: { id: podcastId },
    });

    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    if (podcast.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Upload audio file
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const { url: audioUrl } = await uploadPodcastFile(
      audioBuffer,
      audioFile.name,
      audioFile.type,
      false // Set isImage to false for audio files
    );

    // Create episode
    const episode = await prisma.episode.create({
      data: {
        title,
        description,
        audioUrl,
        duration: 0, // TODO: Calculate duration from audio file
        podcastId,
        episodeNumber: episodeNumber ? parseInt(episodeNumber) : null,
        seasonNumber: seasonNumber ? parseInt(seasonNumber) : null,
        keywords,
      },
    });

    return NextResponse.json(episode);
  } catch (error) {
    console.error('Error creating episode:', error);
    return NextResponse.json(
      { error: 'Error creating episode' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const podcastId = searchParams.get('podcastId');
    const search = searchParams.get('search');

    if (!podcastId) {
      return NextResponse.json(
        { error: 'Podcast ID is required' },
        { status: 400 }
      );
    }

    const episodes = await prisma.episode.findMany({
      where: {
        podcastId,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { keywords: { hasSome: [search] } },
              ],
            }
          : {}),
      },
      orderBy: [
        { seasonNumber: 'desc' },
        { episodeNumber: 'desc' },
      ],
      include: {
        podcast: {
          select: {
            title: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return NextResponse.json(
      { error: 'Error fetching episodes' },
      { status: 500 }
    );
  }
} 