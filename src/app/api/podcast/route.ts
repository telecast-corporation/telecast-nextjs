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

    console.log('Session user:', session.user);
    console.log('User ID:', session.user.id);

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim());
    const imageFile = formData.get('imageFile') as File;

    if (!title || !description || !category || !imageFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert image to buffer
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // Upload image to bucket
    const { url: imageUrl } = await uploadPodcastFile(
      imageBuffer,
      imageFile.name,
      imageFile.type,
      true // Set isImage to true for podcast cover images
    );

    // Create podcast in database
    const podcast = await prisma.podcast.create({
      data: {
        title,
        description,
        category,
        tags,
        imageUrl,
        userId: session.user.id,
        author: session.user.name || 'Anonymous',
        published: false,
        language: 'en',
        explicit: false
      },
    });

    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Error creating podcast:', error);
    return NextResponse.json(
      { error: 'Error creating podcast' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const podcasts = await prisma.podcast.findMany({
      where: {
        userId,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { hasSome: [search] } },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(podcasts);
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return NextResponse.json(
      { error: 'Error fetching podcasts' },
      { status: 500 }
    );
  }
} 