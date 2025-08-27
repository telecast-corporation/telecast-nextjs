export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth0-user';
// authOptions removed - using Auth0
import { prisma } from '@/lib/prisma';

interface InternalSearchResult {
  id: string;
  title: string;
  description: string;
  coverImage: string;
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
    const user = await getUserFromRequest(request as any);
    if (!user) {
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
          userId: user.id,
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
        coverImage: podcast.coverImage || '',
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
            userId: user.id,
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
              coverImage: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: maxResults,
      });

      results.push(...episodes.map(episode => ({
        id: episode.id,
        title: episode.title || 'Untitled Episode',
        description: episode.description || '',
        coverImage: episode.podcast?.coverImage || '',
        author: episode.podcast?.title || '',
        source: 'internal' as const,
        type: 'episode' as const,
        podcastId: episode.podcastId,
        podcastTitle: episode.podcast?.title || '',
        episodeNumber: episode.episodeNumber ?? undefined,
        seasonNumber: episode.seasonNumber ?? undefined,
        publishedAt: episode.publishedAt,
        duration: episode.duration ?? undefined,
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