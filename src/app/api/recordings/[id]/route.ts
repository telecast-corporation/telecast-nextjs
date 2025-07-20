import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuth0User(request);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recording = await prisma.recording.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    // Check if user can access this recording
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Allow access if recording is public or belongs to the user
    if (!recording.isPublic && recording.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Increment view count
    await prisma.recording.update({
      where: { id: params.id },
      data: { views: { increment: 1 } }
    });

    return NextResponse.json(recording);
  } catch (error) {
    console.error('Get recording error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recording' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuth0User(request);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, tags, isPublic } = body;

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if recording exists and belongs to user
    const existingRecording = await prisma.recording.findUnique({
      where: { id: params.id }
    });

    if (!existingRecording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    if (existingRecording.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update recording
    const updatedRecording = await prisma.recording.update({
      where: { id: params.id },
      data: {
        title,
        description,
        tags,
        isPublic,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(updatedRecording);
  } catch (error) {
    console.error('Update recording error:', error);
    return NextResponse.json(
      { error: 'Failed to update recording' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuth0User(request);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if recording exists and belongs to user
    const existingRecording = await prisma.recording.findUnique({
      where: { id: params.id }
    });

    if (!existingRecording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    if (existingRecording.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete recording
    await prisma.recording.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    console.error('Delete recording error:', error);
    return NextResponse.json(
      { error: 'Failed to delete recording' },
      { status: 500 }
    );
  }
} 