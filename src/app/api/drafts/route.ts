import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth0-user';
import { prisma } from '@/lib/prisma';
import { getDraftUploadSignedUrl } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { podcastId, contentType = 'audio/wav' } = await request.json();
    if (!podcastId) return NextResponse.json({ error: 'podcastId required' }, { status: 400 });

    // Ensure podcast ownership
    const podcast = await prisma.podcast.findFirst({ where: { id: podcastId, userId: user.id } });
    if (!podcast) return NextResponse.json({ error: 'Podcast not found or access denied' }, { status: 404 });

    const draft = await prisma.draft.create({ data: { podcastId, userId: user.id } });
    const originalPath = `podcasts/${podcastId}/${draft.id}/original`;

    // Store original path placeholder
    await prisma.draft.update({ where: { id: draft.id }, data: { originalPath } });

    const uploadUrl = await getDraftUploadSignedUrl(originalPath, contentType);

    return NextResponse.json({ draftId: draft.id, uploadUrl, originalPath });
  } catch (error) {
    console.error('Draft create error:', error);
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const drafts = await prisma.draft.findMany({
      where: { userId: user.id },
      include: { podcast: { select: { id: true, title: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error('Draft list error:', error);
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
} 