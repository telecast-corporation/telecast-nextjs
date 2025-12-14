import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth0User } from '@/lib/auth0-session';
import { PodcastIndex } from '@/lib/podcast-index';
import { truncateText } from '@/lib/utils';
import type { Podcast } from '@/types';

async function searchPodcasts(query: string, maxResults: number = 300, request?: Request) {
  try {
    const podcastIndex = new PodcastIndex();
    const externalResults = await podcastIndex.search(query);
    
    // Get user from request context to search internal podcasts
    let internalResults: any[] = [];
    try {
      if (request) {
        const user = await getAuth0User(request as any);
        if (user) {
          // Get user from database
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          if (dbUser) {
            // Search internal podcasts
            const internalPodcasts = await prisma.podcast.findMany({
              where: {
                userId: dbUser.id,
                AND: [
                  {
                    OR: [
                      { isAvailable: true }, // Include published podcasts
                      { isAvailable: false } // Also include unpublished podcasts for the owner
                    ]
                  },
                  {
                    OR: [
                      { title: { contains: query, mode: 'insensitive' } },
                      { description: { contains: query, mode: 'insensitive' } },
                      { tags: { hasSome: [query] } },
                      { category: { contains: query, mode: 'insensitive' } },
                    ]
                  }
                ]
              },
              orderBy: { createdAt: 'desc' },
              take: Math.floor(maxResults / 2), // Reserve half the results for internal podcasts
            });

            internalResults = internalPodcasts.map(podcast => ({
              type: 'podcast',
              id: `internal-${podcast.id}`, // Prefix to distinguish from external IDs
              title: truncateText(podcast.title, 50),
              description: truncateText(podcast.description || '', 100),
              thumbnail: podcast.coverImage || 'https://via.placeholder.com/150',
              url: `/podcast/${podcast.id}`, // Link to our internal podcast page
              author: truncateText(podcast.author || 'Unknown Author', 30),
              duration: podcast.isAvailable ? 'User uploaded' : 'Draft (unpublished)',
              categories: podcast.tags || [],
              language: podcast.language || 'en',
              explicit: podcast.explicit || false,
              source: 'internal',
              sourceUrl: `/podcast/${podcast.id}`,
              isAvailable: podcast.isAvailable, // Include published status
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error searching internal podcasts:', error);
      // Continue with external results only if internal search fails
    }
    
    // Combine external and internal results
    const externalMapped = externalResults.slice(0, maxResults - internalResults.length).map((podcast: Podcast) => ({
      type: 'podcast',
      id: podcast.id,
      title: truncateText(podcast.title, 50),
      description: truncateText(podcast.description, 100),
      thumbnail: podcast.image,
      url: `/podcast/${podcast.id}`, // Link to our internal podcast page
      author: truncateText(podcast.author, 30),
      duration: `${podcast.episodeCount || 0} episodes`,
      categories: podcast.categories,
      language: podcast.language,
      explicit: podcast.explicit,
      source: 'podcastindex',
      sourceUrl: podcast.url,
    }));

    // Combine results with internal podcasts first (to prioritize user content)
    const combinedResults = [...internalResults, ...externalMapped];
    
    return combinedResults.slice(0, maxResults);
  } catch (error) {
    console.error('Podcast search error:', error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const limit = searchParams.get('limit');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const maxResults = limit ? parseInt(limit, 10) : 300;
  
  try {
    const results = await searchPodcasts(query, maxResults, request);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
