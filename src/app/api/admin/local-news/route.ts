
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/lib/auth0-user';

const prisma = new PrismaClient();

// GET all pending local news
export async function GET(req: NextRequest) {
  const user = await getOrCreateUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // NOTE: Add admin role check here in a real application
  // For now, we'll just check if the user is logged in.

  try {
    const pendingNews = await prisma.localNews.findMany({
      where: {
        status: 'pending',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(pendingNews);
  } catch (error) {
    console.error('Error fetching pending news:', error);
    return NextResponse.json({ error: 'Failed to fetch pending news' }, { status: 500 });
  }
}

// PUT to update the status of a local news item
export async function PUT(req: NextRequest) {
  const user = await getOrCreateUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // NOTE: Add admin role check here

  try {
    const { id, status } = await req.json();

    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const updatedNews = await prisma.localNews.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedNews);
  } catch (error) {
    console.error('Error updating news status:', error);
    return NextResponse.json({ error: 'Failed to update news status' }, { status: 500 });
  }
}
