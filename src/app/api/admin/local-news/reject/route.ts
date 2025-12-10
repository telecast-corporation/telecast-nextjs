
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Missing news item ID' }, { status: 400 });
  }

  try {
    await prisma.localNews.update({
      where: { id: String(id) },
      data: { status: 'rejected' },
    });

    return NextResponse.redirect(new URL('/admin/local-news/rejected', req.url));
  } catch (error) {
    console.error('Error rejecting news item:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
