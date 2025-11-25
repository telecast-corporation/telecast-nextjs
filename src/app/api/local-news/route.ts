import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth0-user';
import { prisma } from '@/lib/prisma';
import { uploadLocalNewsFile } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser(req as any);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const locationCity = formData.get('locationCity') as string;
    const locationCountry = formData.get('locationCountry') as string;
    const videoFile = formData.get('video') as File;

    if (!title || !description || !category || !locationCity || !locationCountry || !videoFile) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Upload video to storage
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const { url: videoUrl } = await uploadLocalNewsFile(videoBuffer, videoFile.name, videoFile.type);

    const newNews = await prisma.localNews.create({
      data: {
        title,
        description,
        category,
        locationCity,
        locationCountry,
        videoUrl,
        userId: user.id,
      },
    });

    // Simulate sending an alert to the admin
    console.log(`
      New local news submission requires review:
      Title: ${title}
      Category: ${category}
      Location: ${locationCity}, ${locationCountry}
    `);

    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    console.error('Error creating local news:', error);
    return NextResponse.json({ message: 'Failed to create local news' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const country = searchParams.get('country');

  try {
    const where: any = { status: 'approved' };
    if (city) where.locationCity = { contains: city, mode: 'insensitive' };
    if (country) where.locationCountry = { contains: country, mode: 'insensitive' };

    const news = await prisma.localNews.findMany({
      where,
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(news, { status: 200 });
  } catch (error) {
    console.error('Error fetching local news:', error);
    return NextResponse.json({ message: 'Failed to fetch local news' }, { status: 500 });
  }
}
