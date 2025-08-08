import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth0-user';
import { getDraftReadSignedUrl } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const requested = (url.searchParams.get('which') || 'edited') as 'original' | 'edited';

    const { id } = await params;
    const draft = await prisma.draft.findFirst({ where: { id, userId: user.id } });
    if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

    // Prefer requested path, but gracefully fall back to original if edited is not available
    let which: 'original' | 'edited' = requested;
    let path: string | null | undefined = requested === 'edited' ? draft.editedPath : draft.originalPath;
    if (!path && requested === 'edited') {
      which = 'original';
      path = draft.originalPath;
    }

    if (!path) return NextResponse.json({ error: 'Path not available' }, { status: 404 });

    const readUrl = await getDraftReadSignedUrl(path);
    return NextResponse.json({ readUrl, path, which });
  } catch (error) {
    console.error('Draft read-url error:', error);
    return NextResponse.json({ error: 'Failed to get read URL' }, { status: 500 });
  }
} 