import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { PrismaClient } from '@prisma/client';
import { getFileReadSignedUrl } from '@/lib/storage';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; episodeId: string }> }
) {
  try {
    const user = await getAuth0User(request);
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: podcastId, episodeId } = await params;

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

    // Get episode
    const episode = await prisma.episode.findFirst({
      where: { 
        id: episodeId,
        podcastId: podcastId
      }
    });

    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    if (!episode.audioUrl) {
      return NextResponse.json({ error: 'Episode has no audio file' }, { status: 404 });
    }

    // Handle both old signed URLs and new file paths
    let filePath = episode.audioUrl;
    
    // If audioUrl is a full signed URL, extract the file path
    if (episode.audioUrl.startsWith('https://storage.googleapis.com/')) {
      try {
        const url = new URL(episode.audioUrl);
        // Extract the file path from the URL
        // URL format: https://storage.googleapis.com/bucket-name/file-path
        const pathParts = url.pathname.split('/');
        if (pathParts.length >= 3) {
          // Remove the first empty string and bucket name
          filePath = pathParts.slice(2).join('/');
        } else {
          throw new Error('Invalid storage URL format');
        }
      } catch (error) {
        console.error('Error parsing storage URL:', error);
        return NextResponse.json({ error: 'Invalid audio file URL format' }, { status: 400 });
      }
    }

    // Generate a fresh signed URL (valid for 1 hour)
    const signedUrl = await getFileReadSignedUrl(filePath, 60 * 60 * 1000);

    return NextResponse.json({
      audioUrl: signedUrl,
      expiresIn: 60 * 60 * 1000 // 1 hour in milliseconds
    });

  } catch (error) {
    console.error('Audio URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio URL' },
      { status: 500 }
    );
  }
} 