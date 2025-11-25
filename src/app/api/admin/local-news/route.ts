import { NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth0-user';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await getOrCreateUser(req as any);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const news = await prisma.localNews.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching local news for admin:', error);
    return NextResponse.json(
      { error: 'Error fetching local news' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getOrCreateUser(req as any);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing id or status' },
        { status: 400 }
      );
    }

    const updatedNews = await prisma.localNews.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedNews);
  } catch (error) {
    console.error('Error updating local news status:', error);
    return NextResponse.json(
      { error: 'Error updating status' },
      { status: 500 }
    );
  }
}
