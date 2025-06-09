export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface SearchResult {
  id: number | string;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  source: 'telecast' | 'spotify';
  category?: string;
  tags?: string[];
  type: 'podcast' | 'video' | 'music' | 'book';
  url?: string;
  preview_url?: string;
}

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('Spotify credentials not configured');
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      console.warn('Failed to get Spotify access token:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.warn('Error getting Spotify access token:', error);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type')?.toLowerCase() || 'all';
    const popular = searchParams.get('popular') === 'true';

    // If no query but popular is requested, return trending/popular content for the category
    if (!query && popular) {
      return getPopularContent(type);
    }

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    let allResults: SearchResult[] = [];

    // Search in our database for podcasts
    if (type === 'all' || type === 'podcast') {
      try {
        const dbResults = await prisma.podcast.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { tags: { hasSome: [query] } },
            ],
          },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          take: 10,
        });

        // Format database results
        const formattedDbResults = dbResults.map(podcast => ({
          id: parseInt(podcast.id),
          title: podcast.title,
          description: podcast.description,
          imageUrl: podcast.imageUrl,
          author: podcast.user.name || 'Anonymous',
          source: 'telecast' as const,
          category: podcast.category,
          tags: podcast.tags,
          type: 'podcast' as const,
          url: podcast.url || null
        }));

        allResults = [...allResults, ...formattedDbResults];
      } catch (error) {
        console.warn('Error fetching from database:', error);
        // Continue with other sources even if database fails
      }

      // Search in Spotify for podcasts
      try {
        const accessToken = await getSpotifyAccessToken();
        if (accessToken) {
          const spotifyResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(
              query
            )}&type=show&market=US&limit=10`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (spotifyResponse.ok) {
            const spotifyData = await spotifyResponse.json();
            const spotifyResults = spotifyData.shows.items.map((show: any) => ({
              id: show.id,
              title: show.name,
              description: show.description,
              imageUrl: show.images[0]?.url,
              author: show.publisher,
              source: 'spotify' as const,
              category: show.primary_category,
              tags: show.categories,
              type: 'podcast' as const,
              url: show.external_urls?.spotify || null
            }));
            allResults = [...allResults, ...spotifyResults];
          }
        }
      } catch (error) {
        console.warn('Error fetching from Spotify:', error);
      }
    }

    // Search for videos
    if (type === 'all' || type === 'video') {
      try {
        const videoResults = [
          {
            id: 'video1',
            title: 'Top Tech Trends 2024',
            description: 'Exploring the latest technology trends that will shape the future',
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
            author: 'Tech Insider',
            source: 'telecast' as const,
            category: 'Technology',
            tags: ['tech', 'trends', '2024'],
            type: 'video' as const,
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          },
          {
            id: 'video2',
            title: 'Coding Tutorial: React Basics',
            description: 'Learn the fundamentals of React development',
            imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
            author: 'Code Academy',
            source: 'telecast' as const,
            category: 'Education',
            tags: ['coding', 'react', 'tutorial'],
            type: 'video' as const,
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          }
        ].filter(video => 
          video.title.toLowerCase().includes(query.toLowerCase()) ||
          video.description.toLowerCase().includes(query.toLowerCase()) ||
          video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        allResults = [...allResults, ...videoResults];
      } catch (error) {
        console.warn('Error processing video results:', error);
      }
    }

    // Search for music
    if (type === 'all' || type === 'music') {
      try {
        const accessToken = await getSpotifyAccessToken();
        if (accessToken) {
          const spotifyResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (spotifyResponse.ok) {
            const spotifyData = await spotifyResponse.json();
            const results = spotifyData.tracks.items.map((track: any) => ({
              id: track.id,
              title: track.name,
              description: `${track.artists.map((artist: any) => artist.name).join(', ')} - ${track.album.name}`,
              imageUrl: track.album.images[0]?.url,
              author: track.artists.map((artist: any) => artist.name).join(', '),
              source: 'spotify' as const,
              category: track.album.album_type,
              tags: track.artists.map((artist: any) => artist.name),
              type: 'music' as const,
              preview_url: track.preview_url || null,
              url: track.external_urls?.spotify || null
            }));
            allResults = [...allResults, ...results];
          }
        }
      } catch (error) {
        console.warn('Error fetching from Spotify:', error);
      }
    }

    // If no results found, return empty array instead of error
    return NextResponse.json({ results: allResults });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [] });
  }
}

async function getPopularContent(type: string): Promise<NextResponse> {
  try {
    let results: SearchResult[] = [];

    switch (type) {
      case 'podcasts':
        // Get popular podcasts from database
        const popularPodcasts = await prisma.podcast.findMany({
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc', // You could change this to order by plays, likes, etc.
          },
          take: 20,
        });

        results = popularPodcasts.map(podcast => ({
          id: parseInt(podcast.id),
          title: podcast.title,
          description: podcast.description,
          imageUrl: podcast.imageUrl,
          author: podcast.user.name || 'Anonymous',
          source: 'telecast' as const,
          category: podcast.category,
          tags: podcast.tags,
          type: 'podcast' as const,
        }));
        break;

      case 'videos':
        // Mock video content (you can replace with actual video API)
        results = [
          {
            id: 1,
            title: 'Top Tech Trends 2024',
            description: 'Exploring the latest technology trends that will shape the future',
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
            author: 'Tech Insider',
            source: 'telecast' as const,
            category: 'Technology',
            tags: ['tech', 'trends', '2024'],
            type: 'video' as const,
          },
          {
            id: 2,
            title: 'Coding Tutorial: React Basics',
            description: 'Learn the fundamentals of React development',
            imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
            author: 'Code Academy',
            source: 'telecast' as const,
            category: 'Education',
            tags: ['coding', 'react', 'tutorial'],
            type: 'video' as const,
          },
        ];
        break;

      case 'music':
        try {
          const accessToken = await getSpotifyAccessToken();
          // Get top tracks from Spotify
          const spotifyResponse = await fetch(
            'https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=20', // Global Top 50 playlist
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (spotifyResponse.ok) {
            const spotifyData = await spotifyResponse.json();
            results = spotifyData.items.map((item: any) => {
              const track = item.track;
              return {
                id: track.id,
                title: track.name,
                description: `${track.artists.map((artist: any) => artist.name).join(', ')} - ${track.album.name}`,
                imageUrl: track.album.images[0]?.url,
                author: track.artists.map((artist: any) => artist.name).join(', '),
                source: 'spotify' as const,
                category: track.album.album_type,
                tags: track.artists.map((artist: any) => artist.name),
                type: 'music' as const,
              };
            });
          } else {
            console.warn('Spotify API request failed:', await spotifyResponse.text());
            // Fallback to mock data if API fails
            results = [
              {
                id: 1,
                title: 'Chill Vibes Playlist',
                description: 'Relaxing music for work and study',
                imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
                author: 'Various Artists',
                source: 'telecast' as const,
                category: 'Playlist',
                tags: ['chill', 'ambient', 'study'],
                type: 'music' as const,
              },
              {
                id: 2,
                title: 'Top Hits 2024',
                description: 'The biggest songs of the year',
                imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
                author: 'Hit Radio',
                source: 'telecast' as const,
                category: 'Pop',
                tags: ['hits', 'popular', '2024'],
                type: 'music' as const,
              },
            ];
          }
        } catch (error) {
          console.warn('Error fetching from Spotify:', error);
          // Fallback to mock data if API fails
          results = [
            {
              id: 1,
              title: 'Chill Vibes Playlist',
              description: 'Relaxing music for work and study',
              imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
              author: 'Various Artists',
              source: 'telecast' as const,
              category: 'Playlist',
              tags: ['chill', 'ambient', 'study'],
              type: 'music' as const,
            },
            {
              id: 2,
              title: 'Top Hits 2024',
              description: 'The biggest songs of the year',
              imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
              author: 'Hit Radio',
              source: 'telecast' as const,
              category: 'Pop',
              tags: ['hits', 'popular', '2024'],
              type: 'music' as const,
            },
          ];
        }
        break;

      case 'books':
        // Mock book content (you can integrate with book APIs)
        results = [
          {
            id: 1,
            title: 'The Future of Work',
            description: 'Understanding how technology is changing the workplace',
            imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
            author: 'Business Expert',
            source: 'telecast' as const,
            category: 'Business',
            tags: ['future', 'work', 'technology'],
            type: 'book' as const,
          },
          {
            id: 2,
            title: 'Mindfulness for Beginners',
            description: 'A practical guide to meditation and mindfulness',
            imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
            author: 'Wellness Coach',
            source: 'telecast' as const,
            category: 'Self-Help',
            tags: ['mindfulness', 'meditation', 'wellness'],
            type: 'book' as const,
          },
        ];
        break;

      default:
        // Return all types
        const allPodcastsResponse = await getPopularContent('podcasts');
        const allPodcasts = await allPodcastsResponse.json() as SearchResult[];
        return NextResponse.json(allPodcasts);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching popular content:', error);
    return NextResponse.json(
      { error: 'Error fetching popular content' },
      { status: 500 }
    );
  }
} 