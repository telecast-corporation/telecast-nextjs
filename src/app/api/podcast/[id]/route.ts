import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth0-user';
import { prisma } from '@/lib/prisma';
import { uploadPodcastFile } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: id },
      include: {
        episodes: {
          orderBy: { publishedAt: 'desc' },
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

    const updateData: any = {
      title,
      description,
      category,
      tags,
    };

    if (imageFile) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const { url: coverImage } = await uploadPodcastFile(
        imageBuffer,
        imageFile.name,
        imageFile.type,
        true
      );
      updateData.coverImage = coverImage;
    }

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isAvailable } = body;

    const existingPodcast = await prisma.podcast.findUnique({
      where: { id: id },
      include: {
        episodes: true
      }
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

    if (isAvailable && existingPodcast.episodes.length === 0) {
      return NextResponse.json(
        { error: 'Cannot publish podcast without episodes' },
        { status: 400 }
      );
    }

    const podcast = await prisma.podcast.update({
      where: { id: id },
      data: { isAvailable },
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