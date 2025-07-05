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

    const body = await req.json();
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

    if (!title || !description || !author || !episodeTitle || !episodeDescription || !audioFileData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert base64 audio data to buffer
    const audioBuffer = Buffer.from(audioFileData, 'base64');

    // Upload audio file to storage
    const { url: audioUrl } = await uploadPodcastFile(
      audioBuffer,
      audioFileName,
      audioFileType,
      false // Set isImage to false for audio files
    );

    // Create podcast first
    const podcast = await prisma.podcast.create({
      data: {
        title,
        description,
        category,
        tags: [], // Will be populated from episode keywords
        imageUrl: '', // Will be set to a default image or uploaded separately
        userId: session.user.id,
        author,
        published: true,
        language,
        explicit,
      },
    });

    // Create episode
    const episode = await prisma.episode.create({
      data: {
        title: episodeTitle,
        description: episodeDescription,
        audioUrl,
        duration: 0, // Will be calculated from audio file
        podcastId: podcast.id,
        episodeNumber: episodeNumber ? parseInt(episodeNumber) : null,
        seasonNumber: null, // Can be added later
        explicit,
        keywords: [], // Will be populated from episode description
      },
    });

    return NextResponse.json({
      podcast,
      episode,
      message: 'Successfully broadcast podcast and episode'
    });
  } catch (error) {
    console.error('Error broadcasting podcast:', error);
    return NextResponse.json(
      { error: 'Error broadcasting podcast' },
      { status: 500 }
    );
  }
} 