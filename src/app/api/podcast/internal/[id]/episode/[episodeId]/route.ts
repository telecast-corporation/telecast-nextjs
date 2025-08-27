import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { PrismaClient } from '@prisma/client';

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

    // Get episode with podcast info
    const episode = await prisma.episode.findFirst({
      where: { 
        id: episodeId,
        podcast: {
          id: podcastId,
          userId: dbUser.id
        }
      },
      include: {
        podcast: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    });

    if (!episode) {
      return NextResponse.json({ error: 'Episode not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(episode);

  } catch (error) {
    console.error('Get episode error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episode' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Verify episode exists and user owns it
    const existingEpisode = await prisma.episode.findFirst({
      where: { 
        id: episodeId,
        podcast: {
          id: podcastId,
          userId: dbUser.id
        }
      }
    });

    if (!existingEpisode) {
      return NextResponse.json({ error: 'Episode not found or access denied' }, { status: 404 });
    }

    // Check if this is a file upload or JSON update
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;
      
      if (!audioFile) {
        return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
      }

      // Convert File to Buffer and upload to Google Cloud Storage
      const { uploadPodcastFile } = await import('@/lib/storage');
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadResult = await uploadPodcastFile(
        buffer, 
        audioFile.name, 
        audioFile.type
      );

      // Update episode with new audio URL
      const updatedEpisode = await prisma.episode.update({
        where: { id: episodeId },
        data: { 
          audioUrl: uploadResult.url,
          updatedAt: new Date()
        },
        include: {
          podcast: {
            select: {
              id: true,
              title: true,
              userId: true
            }
          }
        }
      });

      return NextResponse.json(updatedEpisode);
    } else {
      // Handle JSON update
      const body = await request.json();
      
      const updatedEpisode = await prisma.episode.update({
        where: { id: episodeId },
        data: body,
        include: {
          podcast: {
            select: {
              id: true,
              title: true,
              userId: true
            }
          }
        }
      });

      return NextResponse.json(updatedEpisode);
    }

  } catch (error) {
    console.error('Update episode error:', error);
    return NextResponse.json(
      { error: 'Failed to update episode' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify episode exists and user owns it
    const existingEpisode = await prisma.episode.findFirst({
      where: { 
        id: episodeId,
        podcast: {
          id: podcastId,
          userId: dbUser.id
        }
      }
    });

    if (!existingEpisode) {
      return NextResponse.json({ error: 'Episode not found or access denied' }, { status: 404 });
    }

    // Delete episode
    await prisma.episode.delete({
      where: { id: episodeId }
    });

    return NextResponse.json({ message: 'Episode deleted successfully' });

  } catch (error) {
    console.error('Delete episode error:', error);
    return NextResponse.json(
      { error: 'Failed to delete episode' },
      { status: 500 }
    );
  }
} 