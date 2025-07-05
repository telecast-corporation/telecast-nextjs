export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface InternalSearchResult {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  source: 'internal';
  type: 'podcast' | 'episode';
  podcastId?: string;
  podcastTitle?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  duration?: number;
  publishDate?: string;
  views?: number;
  likes?: number;
  category?: string;
  tags?: string[];
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const maxResults = parseInt(searchParams.get('maxResults') || '20');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const results: InternalSearchResult[] = [];

    // Search podcasts
    if (type === 'all' || type === 'podcast') {
      const podcasts = await prisma.podcast.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: maxResults,
      });

      results.push(...podcasts.map(podcast => ({
        id: podcast.id,
        title: podcast.title,
        description: podcast.description || '',
        imageUrl: podcast.imageUrl,
        author: podcast.author,
        source: 'internal' as const,
        type: 'podcast' as const,
        category: podcast.category,
        tags: podcast.tags,
      })));
    }

    // Search episodes
    if (type === 'all' || type === 'episode') {
      const episodes = await prisma.episode.findMany({
        where: {
          podcast: {
            userId: session.user.id,
          },
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { keywords: { hasSome: [query] } },
          ],
        },
        include: {
          podcast: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { publishDate: 'desc' },
        take: maxResults,
      });

      results.push(...episodes.map(episode => ({
        id: episode.id,
        title: episode.title,
        description: episode.description,
        imageUrl: episode.podcast.imageUrl,
        author: episode.podcast.title, // Use podcast title as author for episodes
        source: 'internal' as const,
        type: 'episode' as const,
        podcastId: episode.podcastId,
        podcastTitle: episode.podcast.title,
        episodeNumber: episode.episodeNumber || undefined,
        seasonNumber: episode.seasonNumber || undefined,
        duration: episode.duration,
        publishDate: episode.publishDate.toISOString(),
        views: episode.views,
        likes: episode.likes,
      })));
    }

    // Sort results by relevance (podcasts first, then episodes)
    const sortedResults = results.sort((a, b) => {
      if (a.type === 'podcast' && b.type === 'episode') return -1;
      if (a.type === 'episode' && b.type === 'podcast') return 1;
      return 0;
    });

    return NextResponse.json({
      results: sortedResults,
      total: sortedResults.length,
      query,
      type,
    });
  } catch (error) {
    console.error('Internal search error:', error);
    return NextResponse.json(
      { error: 'Error performing internal search' },
      { status: 500 }
    );
  }
} 