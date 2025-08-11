import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth0-user';
import { getDraftUploadSignedUrl } from '@/lib/storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { which, contentType = 'audio/wav' } = await request.json();
    if (!which || !['original', 'edited'].includes(which)) {
      return NextResponse.json({ error: 'which must be original|edited' }, { status: 400 });
    }

    const draft = await prisma.draft.findFirst({ where: { id, userId: user.id } });
    if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

    const path = which === 'original'
      ? draft.originalPath || `podcasts/${draft.podcastId}/${draft.id}/original`
      : draft.editedPath || `podcasts/${draft.podcastId}/${draft.id}/edited`;

    // Persist path if missing
    if (which === 'original' && !draft.originalPath) {
      await prisma.draft.update({ where: { id }, data: { originalPath: path } });
    }
    if (which === 'edited' && !draft.editedPath) {
      await prisma.draft.update({ where: { id }, data: { editedPath: path } });
    }

    const uploadUrl = await getDraftUploadSignedUrl(path, contentType);
    return NextResponse.json({ uploadUrl, path });
  } catch (error) {
    console.error('Draft upload-url error:', error);
    return NextResponse.json({ error: 'Failed to get upload URL' }, { status: 500 });
  }
} 