import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { prisma } from '@/lib/prisma';
import { uploadPodcastFile } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const user = await getAuth0User(req as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const language = formData.get('language') as string || 'en';
    const explicit = formData.get('explicit') === 'true';
    const copyright = formData.get('copyright') as string || null;
    const website = formData.get('website') as string || null;
    const author = formData.get('author') as string;
    const tagsString = formData.get('tags') as string || '';
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    const imageFile = formData.get('imageFile') as File;

    if (!title || !description || !category || !author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let coverImage = null;
    if (imageFile) {
      // Convert image to buffer
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

      // Upload image to bucket
      const { url } = await uploadPodcastFile(
        imageBuffer,
        imageFile.name,
        imageFile.type,
        true // Set isImage to true for podcast cover images
      );
      coverImage = url;
    }

    // Create podcast in database
    const podcast = await prisma.podcast.create({
      data: {
        title,
        description,
        category,
        tags,
        coverImage: imageFile ? coverImage : null,
        userId: dbUser.id,
        author,
        published: false,
        language,
        explicit,
        copyright,
        website
      },
    });

    return NextResponse.json(podcast);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating podcast' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await getAuth0User(req as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const podcasts = await prisma.podcast.findMany({
      where: {
        userId: dbUser.id,
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