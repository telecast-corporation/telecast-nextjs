
import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth0-user';
import { prisma } from '@/lib/prisma';
import { uploadLocalNewsFile } from '@/lib/storage'; // We will create this function

export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser(req as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const locationCity = formData.get('locationCity') as string;
    const locationCountry = formData.get('locationCountry') as string;
    const file = formData.get('file') as File;

    if (!title || !description || !locationCity || !locationCountry || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simplified category for now, can be expanded later
    const category = "Local News";

    const videoBuffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadLocalNewsFile(
      videoBuffer,
      file.name,
      file.type
    );
    const videoUrl = result.url;

    const newLocalNews = await prisma.localNews.create({
      data: {
        title,
        description,
        category,
        videoUrl,
        locationCity,
        locationCountry,
        userId: user.id,
      },
    });

    return NextResponse.json(newLocalNews, { status: 201 });
  } catch (error) {
    console.error('Error creating local news:', error);
    return NextResponse.json(
      { error: 'Error creating local news' },
      { status: 500 }
    );
  }
}
