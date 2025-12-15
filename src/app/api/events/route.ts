
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { notifyUploadToMail } from '../../../lib/notify';

const prisma = new PrismaClient();


// Dummy data for now
const news = [
  { id: '1', title: 'First News', description: 'This is the content of the first news.', videoUrl: '/videos/news1.mp4' },
  { id: '2', title: 'Second News', description: 'This is the content of the second news.', videoUrl: '/videos/news2.mp4' },
  { id: '3', title: 'Third News', description: 'This is the content of the third news.', videoUrl: '/videos/news3.mp4' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const article = news.find((item) => item.id === id);
    if (article) {
      return NextResponse.json({ news: article });
    } else {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
  } else {
    return NextResponse.json({ news });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received data:', body);
    const {
      title,
      description,
      category,
      videoUrl,
      locationCity,
      locationCountry,
    } = body;

    if (!title || !description || !videoUrl || !locationCity || !locationCountry || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await notifyUploadToMail(body);

    return NextResponse.json({ message: "Notification sent without saving to database." }, { status: 200 });
  } catch (error) {
    console.error('Error creating local news:', error);
    return NextResponse.json({ error: 'Failed to create local news', details: (error as Error).message }, { status: 500 });
  }
}
