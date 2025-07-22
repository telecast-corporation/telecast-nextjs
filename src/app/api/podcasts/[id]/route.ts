import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth0-user';
// authOptions removed - using Auth0
import { prisma } from '@/lib/prisma';
import { uploadPodcastFile } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const podcast = await prisma.podcast.findUnique({
      where: { id: id },
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim());
    const imageFile = formData.get('imageFile') as File | null;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if podcast exists and belongs to user
    const existingPodcast = await prisma.podcast.findUnique({
      where: { id: id },
    });

    if (!existingPodcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    if (existingPodcast.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Prepare update data
    const updateData: any = {
      title,
      description,
      category,
      tags,
    };

    // If new image is provided, upload it
    if (imageFile) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const { url: coverImage } = await uploadPodcastFile(
        imageBuffer,
        imageFile.name,
        imageFile.type,
        true // Set isImage to true for podcast cover images
      );
      updateData.coverImage = coverImage;
    }

    // Update podcast
    const podcast = await prisma.podcast.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Error updating podcast:', error);
    return NextResponse.json(
      { error: 'Error updating podcast' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if podcast exists and belongs to user
    const existingPodcast = await prisma.podcast.findUnique({
      where: { id: id },
    });

    if (!existingPodcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    if (existingPodcast.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete podcast
    await prisma.podcast.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    console.error('Error deleting podcast:', error);
    return NextResponse.json(
      { error: 'Error deleting podcast' },
      { status: 500 }
    );
  }
} 