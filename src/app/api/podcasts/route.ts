import { NextResponse, NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/auth0-user';
import { prisma } from '@/lib/prisma';
import { uploadPodcastFile } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser(req as NextRequest);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('User:', user);
    console.log('User ID:', user.id);

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
    const { url: coverImage } = await uploadPodcastFile(
      imageBuffer,
      imageFile.name,
      imageFile.type,
      true // Set isImage to true for podcast cover images
    );

    // Create podcast in database using the user's database ID
    const podcast = await prisma.podcast.create({
      data: {
        title,
        description,
        category,
        tags,
        coverImage,
        userId: user.id, // Use the database user ID
        author: user.name || 'Anonymous',
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
    const user = await getOrCreateUser(req as NextRequest);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const podcasts = await prisma.podcast.findMany({
      where: {
        userId: user.id,
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