import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth0-user';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const draft = await prisma.draft.findFirst({ where: { id, userId: user.id } });
    if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

    return NextResponse.json({ id: draft.id, podcastId: draft.podcastId, status: draft.status, updatedAt: draft.updatedAt });
  } catch (e) {
    console.error('Get draft info error:', e);
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
  }
} 