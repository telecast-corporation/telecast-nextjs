import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { podcastIndex } from '@/lib/podcast-index';
import { getUserFromRequest } from '@/lib/auth0-user';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Ensure caller is authenticated and owns the podcast
    const user = await getUserFromRequest(request as any);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const podcast = await prisma.podcast.findUnique({ where: { id } });
    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    if (podcast.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If not published but episodes exist, auto-publish to expose the feed
    if (!podcast.published) {
      const episodeCount = await prisma.episode.count({ where: { podcastId: id } });
      if (episodeCount > 0) {
        await prisma.podcast.update({ where: { id }, data: { published: true } });
      } else {
        return NextResponse.json({ error: 'Podcast not published and has no episodes' }, { status: 400 });
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://telecast.ca';

    const feedUrl = `${baseUrl}/api/podcast/${encodeURIComponent(id)}/rss/podcastindex`;

    const result = await podcastIndex.submitFeedByUrl(feedUrl);

    return NextResponse.json({ success: true, result, feedUrl });
  } catch (error) {
    console.error('Podcast Index submission error:', error);
    return NextResponse.json({ error: 'Failed to submit to Podcast Index' }, { status: 500 });
  }
} 