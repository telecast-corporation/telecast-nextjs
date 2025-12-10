
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  try {
    const where = status ? { status } : {};
    const news = await prisma.localNews.findMany({ where });
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const locationCity = formData.get('locationCity') as string;
  const locationCountry = formData.get('locationCountry') as string;
  const userId = formData.get('userId') as string;

  if (!file || !title || !description || !locationCity || !locationCountry || !userId) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  // In a real application, you would upload the file to a cloud storage service
  // and get a URL. For this example, we'll just return a placeholder.
  const videoUrl = `/uploads/${file.name}`;

  return NextResponse.json({ videoUrl });
}
