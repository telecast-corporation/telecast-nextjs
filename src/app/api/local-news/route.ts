
import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth0-user';
import { prisma } from '@/lib/prisma';
import { uploadPodcastFile } from '@/lib/storage';
import { TrendingItem } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;

    if (!file || !title || !description || !city || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { url: videoUrl } = await uploadPodcastFile(fileBuffer, file.name, file.type);

    const newLocalNews = await prisma.localNews.create({
      data: {
        title,
        description,
        city,
        country,
        videoUrl,
        thumbnailUrl: '', // You can add thumbnail generation later
        userId: user.id,
        status: 'pending', // Default status
      },
    });

    const responseItem: TrendingItem = {
      id: newLocalNews.id,
      title: newLocalNews.title,
      description: newLocalNews.description,
      author: user.name || 'Anonymous',
      city: newLocalNews.city,
      country: newLocalNews.country,
      url: newLocalNews.videoUrl,
      previewUrl: newLocalNews.videoUrl,
      thumbnailUrl: newLocalNews.thumbnailUrl,
      type: 'news',
      source: 'internal',
      releaseDate: newLocalNews.createdAt.toISOString(),
    };

    return NextResponse.json(responseItem, { status: 201 });
  } catch (error) {
    console.error('Error uploading local news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const country = searchParams.get('country');

    const where: any = {
      status: 'approved',
    };

    if (city) {
      where.city = {
        equals: city,
        mode: 'insensitive',
      };
    }

    if (country) {
      where.country = {
        equals: country,
        mode: 'insensitive',
      };
    }

    const localNews = await prisma.localNews.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const trendingItems: TrendingItem[] = localNews.map(news => ({
      id: news.id,
      title: news.title,
      description: news.description,
      author: news.user?.name || 'Anonymous',
      city: news.city,
      country: news.country,
      url: news.videoUrl,
      previewUrl: news.videoUrl,
      thumbnailUrl: news.thumbnailUrl,
      type: 'news',
      source: 'internal',
      releaseDate: news.createdAt.toISOString(),
    }));

    return NextResponse.json(trendingItems);
  } catch (error) {
    console.error('Error fetching local news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
