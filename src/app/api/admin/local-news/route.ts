import { NextResponse, NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/auth0-user';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getOrCreateUser(req as NextRequest);

  // @ts-ignore
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const news = await prisma.localNews.findMany({
      where: { status: 'pending' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching pending news:", error);
    return NextResponse.json(
      { error: "Error fetching pending news" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const user = await getOrCreateUser(req as NextRequest);

  // @ts-ignore
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const updatedNews = await prisma.localNews.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedNews);
  } catch (error) {
    console.error("Error updating news status:", error);
    return NextResponse.json(
      { error: "Error updating news status" },
      { status: 500 }
    );
  }
}
