import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth0-user';
import { getFileReadSignedUrl } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const podcast = await prisma.podcast.findUnique({ where: { id } });
    if (!podcast || podcast.userId !== user.id) {
      return NextResponse.json({ error: 'Podcast not found or access denied' }, { status: 404 });
    }

    // Find latest episode for preview
    const episode = await prisma.episode.findFirst({
      where: { podcastId: id },
      orderBy: { createdAt: 'desc' },
    });
    if (!episode?.audioUrl) {
      return NextResponse.json({ error: 'No episode available for preview' }, { status: 404 });
    }

    // audioUrl currently stores the path; generate a short-lived signed read URL
    const previewUrl = await getFileReadSignedUrl(episode.audioUrl, 15 * 60 * 1000);
    return NextResponse.json({ previewUrl, episodeId: episode.id, title: episode.title });
  } catch (e) {
    console.error('Preview error:', e);
    return NextResponse.json({ error: 'Failed to get preview URL' }, { status: 500 });
  }
} 