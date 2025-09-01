import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { PrismaClient } from '@prisma/client';
import { Storage } from '@google-cloud/storage';

const prisma = new PrismaClient();

// Initialize Storage client
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const podcastBucket = storage.bucket(process.env.GOOGLE_CLOUD_PODCAST_BUCKET_NAME || '');

// Configure for large file uploads
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuth0User(request);
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: podcastId } = await params;

    // First get the user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify podcast exists and user owns it
    const podcast = await prisma.podcast.findFirst({
      where: { 
        id: podcastId,
        userId: dbUser.id
      }
    });

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found or access denied' }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'File must be an audio file' }, { status: 400 });
    }

    // Validate file size (50MB limit for remote compatibility)
    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 });
    }

    // Create episode first to get episodeId
    const episode = await prisma.episode.create({
      data: {
        podcastId,
        audioUrl: '', // Will be updated after upload
        isFinal: false,
        isPublished: false,
        fileSize: audioFile.size,
      }
    });

    // Convert File to Buffer
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename for the episode with randomized name
    // Since we're converting everything to WAV format on the frontend, always use .wav extension
    const fileExtension = 'wav';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `podcasts/${podcastId}/episodes/${episode.id}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload file directly to storage (without signed URL)
    const fileUpload = podcastBucket.file(filename);
    await fileUpload.save(buffer, {
      metadata: {
        contentType: audioFile.type,
      },
    });

    // Update episode with the file path (not signed URL)
    await prisma.episode.update({
      where: { id: episode.id },
      data: {
        audioUrl: filename, // Store the file path, not signed URL
      }
    });

    return NextResponse.json({
      episodeId: episode.id,
      message: 'Episode created successfully',
      audioUrl: filename
    });

  } catch (error) {
    console.error('Episode creation error:', error);
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
        return NextResponse.json(
          { error: 'File size too large. Please try a smaller file or contact support.' },
          { status: 413 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create episode' },
      { status: 500 }
    );
  }
} 