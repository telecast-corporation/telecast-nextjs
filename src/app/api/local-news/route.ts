
import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

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

    // const newLocalNews = await prisma.localNews.create({
    //   data: {
    //     title,
    //     description,
    //     category,
    //     videoUrl,
    //     locationCity,
    //     locationCountry,
    //     status: 'pending', // Default status
    //   },
    // });

    const newLocalNews = {
        title,
        description,
        category,
        videoUrl,
        locationCity,
        locationCountry,
        status: 'pending',
    };

    return NextResponse.json(newLocalNews, { status: 201 });
  } catch (error) {
    console.error('Error creating local news:', error);
    // return NextResponse.json({ error: 'Failed to create local news', details: error.message }, { status: 500 });
        return NextResponse.json({ error: 'Failed to create local news', details: (error as Error).message }, { status: 500 });

  }
}
