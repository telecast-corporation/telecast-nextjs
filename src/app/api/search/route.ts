export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { PodcastIndex, Podcast } from '@/lib/podcast-index';
import { searchAudible } from '@/lib/audible-search';

// Import trending functions directly
// import { getTrendingVideos, getTrendingMusic, getTrendingBooks, getTrendingPodcasts } from '../trending/route';

interface SearchResult {
  id: number | string;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  source: 'telecast' | 'spotify' | 'audible';
  category?: string;
  tags?: string[];
  type: 'podcast' | 'video' | 'music' | 'book' | 'audiobook' | 'tv';
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

interface SearchRequest {
  query: string;
  types: string[];
  maxResults?: number;
  trending?: boolean;
  page?: number;
  limit?: number;
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
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
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
    console.error('Error getting Spotify access token:', error);
    return null;
  }
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

async function searchYouTube(query: string, maxResults: number = 300) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults,
        q: query,
        type: 'video',
        regionCode: 'CA',
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    return response.data.items.map((item: any) => ({
      type: 'video',
      id: item.id.videoId,
      title: truncateText(item.snippet.title, 50),
      description: truncateText(item.snippet.description, 100),
      thumbnail: item.snippet.thumbnails.high.url,
      url: `/video/${item.id.videoId}`, // Link to our internal video page
      author: truncateText(item.snippet.channelTitle, 30),
      publishedAt: item.snippet.publishedAt,
      source: 'youtube',
      sourceUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

function ensureHttps(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
}

async function searchBooks(query: string, maxResults: number = 300) {
  try {
    // Ensure maxResults doesn't exceed Google Books API limit of 40
    const safeMaxResults = Math.min(maxResults, 40);

    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        maxResults: safeMaxResults,
        country: 'CA',
        key: process.env.GOOGLE_BOOKS_API_KEY,
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items.map((item: any) => ({
        type: 'book',
        id: item.id,
        title: item.title
      })
      )
    }
    else { }
  } catch (error) {
    console.error(error);

  }
}

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
              published: podcast.isAvailable, // Include published status
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
  async function searchMusic(query: string, maxResults: number = 300) {
    try {
      const accessToken = await getSpotifyAccessToken();
      if (!accessToken) {
        return [];
      }

      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          q: query,
          type: 'track',
          limit: maxResults,
          market: 'CA',
        },
      });

      return response.data.tracks.items.map((item: any) => ({
        type: 'music',
        id: item.id,
        title: truncateText(item.name, 50),
        description: truncateText(item.artists.map((artist: any) => artist.name).join(', '), 100),
        thumbnail: item.album.images[0]?.url,
        url: item.external_urls.spotify,
        author: truncateText(item.artists[0].name, 30),
        duration: `${Math.floor(item.duration_ms / 60000)}:${((item.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}`,
        album: truncateText(item.album.name, 50),
        releaseDate: item.album.release_date,
      }));
    } catch (error) {
      console.error('Music search error:', error);
      return [];
    }
  }

  async function searchAudiobooks(query: string, maxResults: number = 300) {
    try {
      console.log('🎧 Searching audiobooks for query:', query);

      // Call the searchAudible function directly
      const books = await searchAudible(query, maxResults);

      console.log('🎧 Raw audiobooks from searchAudible:', books.map(book => ({
        title: book.title,
        url: book.url,
        audibleUrl: book.audibleUrl,
        id: book.id
      })));

      const mappedBooks = books.map((item: any) => ({
        type: 'audiobook',
        id: item.id,
        title: truncateText(item.title, 50),
        description: truncateText(item.description, 100),
        thumbnail: ensureHttps(item.thumbnail),
        url: item.url,
        author: truncateText(item.author, 30),
        duration: item.duration,
        narrator: item.narrator,
        rating: item.rating,
        audibleUrl: item.audibleUrl,
        source: 'audible',
        sourceUrl: item.sourceUrl,
      }));

      console.log('🎧 Mapped audiobooks:', mappedBooks.map(book => ({
        title: book.title,
        url: book.url,
        audibleUrl: book.audibleUrl,
        id: book.id
      })));

      return mappedBooks;
    } catch (error: any) {
      console.error('🎧 Audiobook search error:', error);
      if (error.response) {
        console.error('🎧 Error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }
      return [];
    }
  }

  async function searchTV(query: string, maxResults: number = 300) {
    try {
      console.log('📺 Searching TV shows for:', query);

      // For now, we'll search through our trending TV data and filter by query
      // In a real implementation, you might want to integrate with TV APIs like TMDB, TVMaze, etc.

      // Get trending TV data and filter by query
      const response = await fetch('https://tubitv.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'DNT': '1',
        },
      });

      if (response.status !== 200) {
        console.error('📺 Failed to fetch Tubi homepage for search');
        return [];
      }

      const html = await response.text();
      const tvShows = [];

      // Extract TV shows from the HTML and filter by query
      const titleRegex = /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i;
      const imgRegex = /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/i;
      const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>/i;
      const yearRegex = /(\d{4})/;
      const durationRegex = /(\d+h?\s?\d*m?)/i;
      const ratingRegex = /(PG|PG-13|R|TV-PG|TV-14|TV-MA|G)/i;

      // Look for TV show patterns in the HTML
      const contentSections = html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) || [];

      for (const section of contentSections) {
        const items = section.match(/<div[^>]*class="[^"]*item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) ||
          section.match(/<div[^>]*class="[^"]*card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) ||
          section.match(/<div[^>]*class="[^"]*show[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);

        if (items) {
          for (const item of items.slice(0, 20)) {
            try {
              const titleMatch = item.match(titleRegex);
              const imgMatch = item.match(imgRegex);
              const linkMatch = item.match(linkRegex);

              if (titleMatch && imgMatch) {
                const title = titleMatch[1].trim();
                const thumbnail = imgMatch[1].startsWith('http') ? imgMatch[1] : `https://tubitv.com${imgMatch[1]}`;
                const altText = imgMatch[2] || title;
                const url = linkMatch ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `https://tubitv.com${linkMatch[1]}`) : 'https://tubitv.com';

                // Check if the title matches the search query
                const titleMatchQuery = title.toLowerCase().includes(query.toLowerCase());
                const descriptionMatchQuery = altText.toLowerCase().includes(query.toLowerCase());

                if (titleMatchQuery || descriptionMatchQuery) {
                  const yearMatch = item.match(yearRegex);
                  const durationMatch = item.match(durationRegex);
                  const ratingMatch = item.match(ratingRegex);

                  tvShows.push({
                    id: `tubi-tv-search-${tvShows.length}-${Date.now()}`,
                    type: 'tv',
                    title: title,
                    description: altText,
                    thumbnail: thumbnail,
                    url: url,
                    year: yearMatch ? yearMatch[1] : null,
                    duration: durationMatch ? durationMatch[1] : null,
                    rating: ratingMatch ? ratingMatch[1] : null,
                    source: 'Tubi',
                    sourceUrl: url,
                    previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Sample preview
                  });
                }
              }
            } catch (error) {
              console.log('📺 Error parsing TV item:', error);
              continue;
            }
          }
        }
      }

      // If we didn't find enough results from scraping, add comprehensive sample results
      if (tvShows.length < 50) {
        const sampleTVShows = [
          {
            id: `tubi-tv-sample-1-${Date.now()}`,
            type: 'tv',
            title: 'Everybody Hates Chris',
            description: 'A comedy series about Chris Rock\'s teenage years growing up in Brooklyn.',
            thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '2009',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },
          {
            id: `tubi-tv-sample-2-${Date.now()}`,
            type: 'tv',
            title: 'Empire',
            description: 'A drama series about a hip-hop music and entertainment company.',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '2020',
            duration: 'TV-14',
            rating: 'TV-14',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          },
          {
            id: `tubi-tv-sample-3-${Date.now()}`,
            type: 'tv',
            title: 'Dance Moms',
            description: 'A reality series following young competitive dancers and their mothers.',
            thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '2016',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          },
          {
            id: `tubi-tv-sample-4-${Date.now()}`,
            type: 'tv',
            title: 'My Little Pony: Friendship Is Magic',
            description: 'An animated series about magical ponies and the power of friendship.',
            thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '2010',
            duration: 'TV-Y',
            rating: 'TV-Y',
            source: 'Tubi',
            sourceUrl: 'https://tubi.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          },
          {
            id: `tubi-tv-sample-5-${Date.now()}`,
            type: 'tv',
            title: 'Love Thy Neighbor',
            description: 'A comedy series about neighbors and their hilarious interactions.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '2017',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          },
          {
            id: `tubi-tv-sample-6-${Date.now()}`,
            type: 'tv',
            title: 'Sanford and Son',
            description: 'A classic comedy series about a junk dealer and his son.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1977',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          },
          {
            id: `tubi-tv-sample-7-${Date.now()}`,
            type: 'tv',
            title: 'Gilligan\'s Island',
            description: 'A classic comedy series about castaways on a deserted island.',
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1967',
            duration: 'TV-G',
            rating: 'TV-G',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          },
          {
            id: `tubi-tv-sample-8-${Date.now()}`,
            type: 'tv',
            title: 'The Magic School Bus',
            description: 'An educational animated series about science adventures.',
            thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1997',
            duration: 'TV-Y7',
            rating: 'TV-Y7',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          },
          {
            id: `tubi-tv-sample-9-${Date.now()}`,
            type: 'tv',
            title: 'Scooby-Doo Where Are You?',
            description: 'A classic animated mystery series featuring Scooby-Doo and friends.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1976',
            duration: 'TV-G',
            rating: 'TV-G',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          },
          {
            id: `tubi-tv-sample-10-${Date.now()}`,
            type: 'tv',
            title: 'All in the Family',
            description: 'A groundbreaking sitcom about a working-class family in Queens.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1980',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          },
          {
            id: `tubi-tv-sample-11-${Date.now()}`,
            type: 'tv',
            title: 'The Fresh Prince of Bel-Air',
            description: 'A comedy series about a street-smart teenager who moves to Bel-Air.',
            thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1993',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },
          {
            id: `tubi-tv-sample-12-${Date.now()}`,
            type: 'tv',
            title: 'Family Matters',
            description: 'A family sitcom featuring the Winslow family and their nerdy neighbor Steve Urkel.',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1991',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          },
          {
            id: `tubi-tv-sample-13-${Date.now()}`,
            type: 'tv',
            title: 'Martin',
            description: 'A comedy series about a radio DJ and his relationships with friends and girlfriend.',
            thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1995',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          },
          {
            id: `tubi-tv-sample-14-${Date.now()}`,
            type: 'tv',
            title: 'The Cosby Show',
            description: 'A family sitcom about the Huxtable family living in Brooklyn.',
            thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1986',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          },
          {
            id: `tubi-tv-sample-15-${Date.now()}`,
            type: 'tv',
            title: 'A Different World',
            description: 'A spin-off of The Cosby Show following Denise Huxtable at college.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1989',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          },
          {
            id: `tubi-tv-sample-16-${Date.now()}`,
            type: 'tv',
            title: 'Good Times',
            description: 'A sitcom about an African-American family living in a Chicago housing project.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1976',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          },
          {
            id: `tubi-tv-sample-17-${Date.now()}`,
            type: 'tv',
            title: 'The Jeffersons',
            description: 'A spin-off of All in the Family about a successful African-American family.',
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1979',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          },
          {
            id: `tubi-tv-sample-18-${Date.now()}`,
            type: 'tv',
            title: '227',
            description: 'A sitcom about residents of a Washington D.C. apartment building.',
            thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1987',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          },
          {
            id: `tubi-tv-sample-19-${Date.now()}`,
            type: 'tv',
            title: 'Amen',
            description: 'A sitcom about a church deacon and his family.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1988',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          },
          {
            id: `tubi-tv-sample-20-${Date.now()}`,
            type: 'tv',
            title: 'What\'s Happening!!',
            description: 'A sitcom about three teenage friends and their families.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1978',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          },
          {
            id: `tubi-tv-sample-21-${Date.now()}`,
            type: 'tv',
            title: 'The Brady Bunch',
            description: 'A family sitcom about a blended family with six children.',
            thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1971',
            duration: 'TV-G',
            rating: 'TV-G',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },
          {
            id: `tubi-tv-sample-22-${Date.now()}`,
            type: 'tv',
            title: 'Happy Days',
            description: 'A sitcom about life in the 1950s featuring the Cunningham family.',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1974',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          },
          {
            id: `tubi-tv-sample-23-${Date.now()}`,
            type: 'tv',
            title: 'Laverne & Shirley',
            description: 'A spin-off of Happy Days about two friends working at a brewery.',
            thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1976',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          },
          {
            id: `tubi-tv-sample-24-${Date.now()}`,
            type: 'tv',
            title: 'Mork & Mindy',
            description: 'A sitcom about an alien from Ork who comes to Earth.',
            thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1978',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          },
          {
            id: `tubi-tv-sample-25-${Date.now()}`,
            type: 'tv',
            title: 'Three\'s Company',
            description: 'A sitcom about a man who pretends to be gay to live with two women.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1977',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          },
          {
            id: `tubi-tv-sample-26-${Date.now()}`,
            type: 'tv',
            title: 'Taxi',
            description: 'A sitcom about New York City taxi drivers and their lives.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1978',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          },
          {
            id: `tubi-tv-sample-27-${Date.now()}`,
            type: 'tv',
            title: 'Barney Miller',
            description: 'A police sitcom about detectives in a New York City precinct.',
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1975',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          },
          {
            id: `tubi-tv-sample-28-${Date.now()}`,
            type: 'tv',
            title: 'WKRP in Cincinnati',
            description: 'A sitcom about the staff of a struggling radio station.',
            thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1978',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          },
          {
            id: `tubi-tv-sample-29-${Date.now()}`,
            type: 'tv',
            title: 'M*A*S*H',
            description: 'A dramedy about doctors and nurses during the Korean War.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1972',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          },
          {
            id: `tubi-tv-sample-30-${Date.now()}`,
            type: 'tv',
            title: 'The Mary Tyler Moore Show',
            description: 'A sitcom about a single woman working in television news.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1970',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          },
          {
            id: `tubi-tv-sample-31-${Date.now()}`,
            type: 'tv',
            title: 'The Bob Newhart Show',
            description: 'A sitcom about a psychologist and his relationships.',
            thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1972',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },
          {
            id: `tubi-tv-sample-32-${Date.now()}`,
            type: 'tv',
            title: 'Rhoda',
            description: 'A spin-off of The Mary Tyler Moore Show about Rhoda Morgenstern.',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1974',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          },
          {
            id: `tubi-tv-sample-33-${Date.now()}`,
            type: 'tv',
            title: 'Phyllis',
            description: 'A spin-off of The Mary Tyler Moore Show about Phyllis Lindstrom.',
            thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1975',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          },
          {
            id: `tubi-tv-sample-34-${Date.now()}`,
            type: 'tv',
            title: 'Lou Grant',
            description: 'A drama series about a newspaper editor starring Ed Asner.',
            thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1977',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          },
          {
            id: `tubi-tv-sample-35-${Date.now()}`,
            type: 'tv',
            title: 'The Love Boat',
            description: 'A romantic comedy series set on a luxury cruise ship.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1977',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          },
          {
            id: `tubi-tv-sample-36-${Date.now()}`,
            type: 'tv',
            title: 'Fantasy Island',
            description: 'A fantasy drama series about an island where dreams come true.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1977',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          },
          {
            id: `tubi-tv-sample-37-${Date.now()}`,
            type: 'tv',
            title: 'The Six Million Dollar Man',
            description: 'A science fiction series about a bionic man with superhuman abilities.',
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1974',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          },
          {
            id: `tubi-tv-sample-38-${Date.now()}`,
            type: 'tv',
            title: 'The Bionic Woman',
            description: 'A spin-off of The Six Million Dollar Man about a bionic woman.',
            thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1976',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          },
          {
            id: `tubi-tv-sample-39-${Date.now()}`,
            type: 'tv',
            title: 'Charlie\'s Angels',
            description: 'A crime drama series about three female private investigators.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1976',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          },
          {
            id: `tubi-tv-sample-40-${Date.now()}`,
            type: 'tv',
            title: 'Starsky & Hutch',
            description: 'A crime drama series about two police detectives.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1975',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          },
          {
            id: `tubi-tv-sample-41-${Date.now()}`,
            type: 'tv',
            title: 'Hawaii Five-O',
            description: 'A police procedural series set in Hawaii.',
            thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1968',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },
          {
            id: `tubi-tv-sample-42-${Date.now()}`,
            type: 'tv',
            title: 'The Rockford Files',
            description: 'A detective series about a private investigator.',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1974',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          },
          {
            id: `tubi-tv-sample-43-${Date.now()}`,
            type: 'tv',
            title: 'Columbo',
            description: 'A detective series featuring Lieutenant Columbo.',
            thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1971',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          },
          {
            id: `tubi-tv-sample-44-${Date.now()}`,
            type: 'tv',
            title: 'Kojak',
            description: 'A police procedural series about a bald detective.',
            thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1973',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          },
          {
            id: `tubi-tv-sample-45-${Date.now()}`,
            type: 'tv',
            title: 'The Streets of San Francisco',
            description: 'A police procedural series set in San Francisco.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1972',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          },
          {
            id: `tubi-tv-sample-46-${Date.now()}`,
            type: 'tv',
            title: 'Emergency!',
            description: 'A medical drama series about paramedics and firefighters.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1972',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          },
          {
            id: `tubi-tv-sample-47-${Date.now()}`,
            type: 'tv',
            title: 'Adam-12',
            description: 'A police procedural series about two police officers.',
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1968',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          },
          {
            id: `tubi-tv-sample-48-${Date.now()}`,
            type: 'tv',
            title: 'Dragnet',
            description: 'A police procedural series about Los Angeles police officers.',
            thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1967',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          },
          {
            id: `tubi-tv-sample-49-${Date.now()}`,
            type: 'tv',
            title: 'The Mod Squad',
            description: 'A crime drama series about three young undercover police officers.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1968',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          },
          {
            id: `tubi-tv-sample-50-${Date.now()}`,
            type: 'tv',
            title: 'Mission: Impossible',
            description: 'A spy thriller series about a secret government organization.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1966',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          },
          {
            id: `tubi-tv-sample-51-${Date.now()}`,
            type: 'tv',
            title: 'The Man from U.N.C.L.E.',
            description: 'A spy series about agents of the United Network Command for Law and Enforcement.',
            thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1964',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },
          {
            id: `tubi-tv-sample-52-${Date.now()}`,
            type: 'tv',
            title: 'Get Smart',
            description: 'A spy comedy series about a bumbling secret agent.',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1965',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          },
          {
            id: `tubi-tv-sample-53-${Date.now()}`,
            type: 'tv',
            title: 'I Dream of Jeannie',
            description: 'A fantasy sitcom about an astronaut and his genie.',
            thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1965',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          },
          {
            id: `tubi-tv-sample-54-${Date.now()}`,
            type: 'tv',
            title: 'Bewitched',
            description: 'A fantasy sitcom about a witch who marries a mortal.',
            thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1964',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          },
          {
            id: `tubi-tv-sample-55-${Date.now()}`,
            type: 'tv',
            title: 'The Addams Family',
            description: 'A comedy series about a macabre family.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1964',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          },
          {
            id: `tubi-tv-sample-56-${Date.now()}`,
            type: 'tv',
            title: 'The Munsters',
            description: 'A comedy series about a family of monsters.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1964',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          },
          {
            id: `tubi-tv-sample-57-${Date.now()}`,
            type: 'tv',
            title: 'The Twilight Zone',
            description: 'An anthology series featuring supernatural and science fiction stories.',
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1959',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          },
          {
            id: `tubi-tv-sample-58-${Date.now()}`,
            type: 'tv',
            title: 'The Outer Limits',
            description: 'An anthology series featuring science fiction stories.',
            thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1963',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          },
          {
            id: `tubi-tv-sample-59-${Date.now()}`,
            type: 'tv',
            title: 'Lost in Space',
            description: 'A science fiction series about a family lost in space.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1965',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          },
          {
            id: `tubi-tv-sample-60-${Date.now()}`,
            type: 'tv',
            title: 'Star Trek',
            description: 'A science fiction series about the crew of the starship Enterprise.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1966',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          },
          {
            id: `tubi-tv-sample-61-${Date.now()}`,
            type: 'tv',
            title: 'Batman',
            description: 'A superhero series about Batman and Robin fighting crime in Gotham City.',
            thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1966',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },
          {
            id: `tubi-tv-sample-62-${Date.now()}`,
            type: 'tv',
            title: 'The Green Hornet',
            description: 'A superhero series about a masked crime fighter.',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1966',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          },
          {
            id: `tubi-tv-sample-63-${Date.now()}`,
            type: 'tv',
            title: 'The Wild Wild West',
            description: 'A western series about secret agents in the Old West.',
            thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1965',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          },
          {
            id: `tubi-tv-sample-64-${Date.now()}`,
            type: 'tv',
            title: 'Bonanza',
            description: 'A western series about the Cartwright family and their ranch.',
            thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1959',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          },
          {
            id: `tubi-tv-sample-65-${Date.now()}`,
            type: 'tv',
            title: 'Gunsmoke',
            description: 'A western series about Marshal Matt Dillon in Dodge City.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1955',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          },
          {
            id: `tubi-tv-sample-66-${Date.now()}`,
            type: 'tv',
            title: 'The Lone Ranger',
            description: 'A western series about a masked hero and his Native American companion.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1949',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          },
          {
            id: `tubi-tv-sample-67-${Date.now()}`,
            type: 'tv',
            title: 'Rawhide',
            description: 'A western series about cattle drives and cowboys.',
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1959',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          },
          {
            id: `tubi-tv-sample-68-${Date.now()}`,
            type: 'tv',
            title: 'Wagon Train',
            description: 'A western series about pioneers traveling west in wagon trains.',
            thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1957',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          },
          {
            id: `tubi-tv-sample-69-${Date.now()}`,
            type: 'tv',
            title: 'Have Gun - Will Travel',
            description: 'A western series about a gunfighter for hire.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1957',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          },
          {
            id: `tubi-tv-sample-70-${Date.now()}`,
            type: 'tv',
            title: 'The Rifleman',
            description: 'A western series about a widowed rancher and his son.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1958',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          },
          {
            id: `tubi-tv-sample-71-${Date.now()}`,
            type: 'tv',
            title: 'The Andy Griffith Show',
            description: 'A comedy series about a sheriff and his family in Mayberry.',
            thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1960',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },
          {
            id: `tubi-tv-sample-72-${Date.now()}`,
            type: 'tv',
            title: 'The Beverly Hillbillies',
            description: 'A comedy series about a family from the Ozarks who strike oil.',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1962',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          },
          {
            id: `tubi-tv-sample-73-${Date.now()}`,
            type: 'tv',
            title: 'Petticoat Junction',
            description: 'A comedy series about a family running a hotel in a small town.',
            thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1963',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          },
          {
            id: `tubi-tv-sample-74-${Date.now()}`,
            type: 'tv',
            title: 'Green Acres',
            description: 'A comedy series about a lawyer who moves to a farm.',
            thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1965',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          },
          {
            id: `tubi-tv-sample-75-${Date.now()}`,
            type: 'tv',
            title: 'Hogan\'s Heroes',
            description: 'A comedy series about Allied prisoners in a German POW camp.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1965',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          },
          {
            id: `tubi-tv-sample-76-${Date.now()}`,
            type: 'tv',
            title: 'F Troop',
            description: 'A comedy series about incompetent soldiers at a frontier fort.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1965',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          },
          {
            id: `tubi-tv-sample-77-${Date.now()}`,
            type: 'tv',
            title: 'McHale\'s Navy',
            description: 'A comedy series about sailors on a PT boat during World War II.',
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1962',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          },
          {
            id: `tubi-tv-sample-78-${Date.now()}`,
            type: 'tv',
            title: 'The Dick Van Dyke Show',
            description: 'A comedy series about a comedy writer and his family.',
            thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1961',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          },
          {
            id: `tubi-tv-sample-79-${Date.now()}`,
            type: 'tv',
            title: 'The Donna Reed Show',
            description: 'A comedy series about a suburban family in the 1950s.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1958',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          },
          {
            id: `tubi-tv-sample-80-${Date.now()}`,
            type: 'tv',
            title: 'Father Knows Best',
            description: 'A comedy series about a middle-class family in the 1950s.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1954',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          },
          {
            id: `tubi-tv-sample-81-${Date.now()}`,
            type: 'tv',
            title: 'Leave It to Beaver',
            description: 'A comedy series about a young boy and his family.',
            thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1957',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },
          {
            id: `tubi-tv-sample-82-${Date.now()}`,
            type: 'tv',
            title: 'Dennis the Menace',
            description: 'A comedy series about a mischievous young boy.',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1959',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          },
          {
            id: `tubi-tv-sample-83-${Date.now()}`,
            type: 'tv',
            title: 'The Adventures of Ozzie and Harriet',
            description: 'A comedy series about the Nelson family.',
            thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1952',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          },
          {
            id: `tubi-tv-sample-84-${Date.now()}`,
            type: 'tv',
            title: 'My Three Sons',
            description: 'A comedy series about a widowed engineer raising three sons.',
            thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1960',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          },
          {
            id: `tubi-tv-sample-85-${Date.now()}`,
            type: 'tv',
            title: 'The Patty Duke Show',
            description: 'A comedy series about identical cousins with different personalities.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1963',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          },
          {
            id: `tubi-tv-sample-86-${Date.now()}`,
            type: 'tv',
            title: 'Gidget',
            description: 'A comedy series about a teenage girl and her surfing adventures.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1965',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          },
          {
            id: `tubi-tv-sample-87-${Date.now()}`,
            type: 'tv',
            title: 'The Flying Nun',
            description: 'A comedy series about a nun who can fly.',
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1967',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          },
          {
            id: `tubi-tv-sample-88-${Date.now()}`,
            type: 'tv',
            title: 'The Partridge Family',
            description: 'A comedy series about a family band.',
            thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1970',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          },
          {
            id: `tubi-tv-sample-89-${Date.now()}`,
            type: 'tv',
            title: 'The Monkees',
            description: 'A comedy series about a fictional rock band.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1966',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          },
          {
            id: `tubi-tv-sample-90-${Date.now()}`,
            type: 'tv',
            title: 'The Banana Splits Adventure Hour',
            description: 'A children\'s variety show featuring animated segments.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1968',
            duration: 'TV-G',
            rating: 'TV-G',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          },
          {
            id: `tubi-tv-sample-91-${Date.now()}`,
            type: 'tv',
            title: 'H.R. Pufnstuf',
            description: 'A children\'s fantasy series about a boy and his talking flute.',
            thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1969',
            duration: 'TV-G',
            rating: 'TV-G',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },
          {
            id: `tubi-tv-sample-92-${Date.now()}`,
            type: 'tv',
            title: 'Lidsville',
            description: 'A children\'s fantasy series about a boy trapped in a magical hat world.',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1971',
            duration: 'TV-G',
            rating: 'TV-G',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          },
          {
            id: `tubi-tv-sample-93-${Date.now()}`,
            type: 'tv',
            title: 'Sigmund and the Sea Monsters',
            description: 'A children\'s fantasy series about a boy and a friendly sea monster.',
            thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1973',
            duration: 'TV-G',
            rating: 'TV-G',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          },
          {
            id: `tubi-tv-sample-94-${Date.now()}`,
            type: 'tv',
            title: 'Land of the Lost',
            description: 'A children\'s science fiction series about a family trapped in a prehistoric world.',
            thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1974',
            duration: 'TV-G',
            rating: 'TV-G',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          },
          {
            id: `tubi-tv-sample-95-${Date.now()}`,
            type: 'tv',
            title: 'Electra Woman and Dyna Girl',
            description: 'A children\'s superhero series about two female crime fighters.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1976',
            duration: 'TV-G',
            rating: 'TV-G',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          },
          {
            id: `tubi-tv-sample-96-${Date.now()}`,
            type: 'tv',
            title: 'Shazam!',
            description: 'A children\'s superhero series about a boy who becomes a superhero.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1974',
            duration: 'TV-G',
            rating: 'TV-G',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          },
          {
            id: `tubi-tv-sample-97-${Date.now()}`,
            type: 'tv',
            title: 'Isis',
            description: 'A children\'s superhero series about an Egyptian goddess.',
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1975',
            duration: 'TV-G',
            rating: 'TV-G',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          },
          {
            id: `tubi-tv-sample-98-${Date.now()}`,
            type: 'tv',
            title: 'Wonder Woman',
            description: 'A superhero series about an Amazon princess.',
            thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1975',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          },
          {
            id: `tubi-tv-sample-99-${Date.now()}`,
            type: 'tv',
            title: 'The Six Million Dollar Man',
            description: 'A science fiction series about a bionic man with superhuman abilities.',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1974',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          },
          {
            id: `tubi-tv-sample-100-${Date.now()}`,
            type: 'tv',
            title: 'The Bionic Woman',
            description: 'A science fiction series about a bionic woman with superhuman abilities.',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
            url: 'https://tubitv.com',
            year: '1976',
            duration: 'TV-PG',
            rating: 'TV-PG',
            source: 'Tubi',
            sourceUrl: 'https://tubitv.com',
            previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          }
        ];

        // For TV searches, show more results even if they don't match the query exactly
        // This ensures the streaming tab has plenty of content
        let filteredSamples: any[];
        if (query && query.trim() !== '') {
          // If there's a specific query, try to match it but be more lenient
          const queryLower = query.toLowerCase();
          filteredSamples = sampleTVShows.filter(show =>
            show.title.toLowerCase().includes(queryLower) ||
            show.description.toLowerCase().includes(queryLower) ||
            show.title.toLowerCase().split(' ').some(word => word.includes(queryLower)) ||
            show.description.toLowerCase().split(' ').some(word => word.includes(queryLower))
          );

          // If we don't have enough matches, add more shows
          if (filteredSamples.length < 20) {
            // Add shows that contain any word from the query
            const queryWords = queryLower.split(' ').filter(word => word.length > 2);
            const additionalShows = sampleTVShows.filter(show =>
              !filteredSamples.includes(show) &&
              queryWords.some(word =>
                show.title.toLowerCase().includes(word) ||
                show.description.toLowerCase().includes(word)
              )
            );
            filteredSamples.push(...additionalShows.slice(0, 20 - filteredSamples.length));
          }

          // If still not enough, add random shows to reach at least 50
          if (filteredSamples.length < 50) {
            const remainingShows = sampleTVShows.filter(show => !filteredSamples.includes(show));
            const shuffled = remainingShows.sort(() => Math.random() - 0.5);
            filteredSamples.push(...shuffled.slice(0, 50 - filteredSamples.length));
          }
        } else {
          // If no query, show all shows
          filteredSamples = sampleTVShows;
        }

        tvShows.push(...filteredSamples);
      }

      console.log('📺 TV search response:', {
        tvShowsCount: tvShows.length,
        query: query,
        maxResults: maxResults,
        finalCount: Math.min(tvShows.length, maxResults, 100)
      });
      return tvShows.slice(0, Math.min(maxResults, 100)); // Cap at 100 for streaming tab
    } catch (error) {
      console.error('📺 Error searching TV shows:', error);
      return [];
    }
  }

  async function searchNews(query: string, maxResults: number = 300) {
    try {
      console.log('📰 Searching Canadian news for:', query);

      // Try multiple Canadian news sources
      const newsSources = [
        'https://globalnews.ca/feed/',
        'https://www.cbc.ca/webfeed/rss/rss-topstoriestopstories',
        'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009',
        'https://www.cbc.ca/webfeed/rss/rss-business',
        'https://www.cbc.ca/webfeed/rss/rss-politics',
        'https://www.cbc.ca/webfeed/rss/rss-canada',
        'https://www.cbc.ca/webfeed/rss/rss-world',
        'https://www.cbc.ca/webfeed/rss/rss-technology',
        'https://www.cbc.ca/webfeed/rss/rss-sports',
        'https://www.cbc.ca/webfeed/rss/rss-arts'
      ];

      let allArticles = [];

      for (const source of newsSources) {
        try {
          console.log(`📰 Trying source: ${source}`);
          const response = await fetch(source, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Telecast/1.0)'
            }
          });

          if (!response.ok) {
            console.log(`📰 Source failed: ${source} - ${response.status}`);
            continue;
          }

          const xmlText = await response.text();

          // Parse RSS feed - handle CDATA sections
          const itemRegex = /<item>([\s\S]*?)<\/item>/g;
          const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/;
          const descriptionRegex = /<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/;
          const linkRegex = /<link>(.*?)<\/link>/;
          const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
          const creatorRegex = /<dc:creator>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/dc:creator>/;
          const mediaThumbnailRegex = /<media:thumbnail url="(.*?)"/;

          let match;
          let itemCount = 0;
          while ((match = itemRegex.exec(xmlText)) !== null) {
            itemCount++;
            const itemContent = match[1];

            const title = itemContent.match(titleRegex)?.[1] || 'No title';
            const description = itemContent.match(descriptionRegex)?.[1] || 'No description';
            const link = itemContent.match(linkRegex)?.[1] || '';
            const pubDate = itemContent.match(pubDateRegex)?.[1] || '';
            const creator = itemContent.match(creatorRegex)?.[1] || 'Unknown Author';
            const thumbnail = itemContent.match(mediaThumbnailRegex)?.[1] || 'https://via.placeholder.com/300x200?text=Canadian+News';

            console.log(`📰 Parsed item ${itemCount}:`, { title: title.substring(0, 50) + '...', hasDescription: !!description, hasLink: !!link });

            // Filter by query if provided (but be less strict for news)
            if (query && query.trim() !== '') {
              const queryLower = query.toLowerCase();
              const titleLower = title.toLowerCase();
              const descriptionLower = description.toLowerCase();

              // For news, be more lenient - show articles if they match OR if query is general
              const isGeneralQuery = ['canada', 'canadian', 'news', 'latest', 'update', 'today'].some(term =>
                queryLower.includes(term)
              );

              if (!isGeneralQuery && !titleLower.includes(queryLower) && !descriptionLower.includes(queryLower)) {
                console.log(`📰 Item filtered out by query: "${query}"`);
                continue;
              }
            }

            allArticles.push({
              type: 'news',
              id: `news-${allArticles.length}-${Date.now()}`,
              title: title,
              description: description,
              thumbnail: thumbnail,
              url: link,
              author: creator,
              publishedAt: pubDate,
              source: source.includes('globalnews') ? 'globalnews' :
                source.includes('cbc') ? 'cbc' : 'ctv',
              sourceUrl: link,
            });
          }

          console.log(`📰 Total items parsed from ${source}: ${itemCount}, articles added: ${allArticles.length}`);

          console.log(`📰 Found ${allArticles.length} articles from ${source}`);

          // Continue fetching from all sources

        } catch (error: any) {
          console.log(`📰 Error with source ${source}:`, error.message);
          continue;
        }
      }

      // If no articles found from RSS feeds, add some fallback Canadian news
      if (allArticles.length === 0) {
        console.log('📰 No RSS articles found, adding fallback Canadian news');
        allArticles = [
          {
            type: 'news',
            id: `news-fallback-1-${Date.now()}`,
            title: 'Canadian News - Latest Updates',
            description: 'Stay informed with the latest news from across Canada.',
            thumbnail: 'https://via.placeholder.com/300x200?text=Canadian+News',
            url: 'https://www.cbc.ca/news',
            author: 'CBC News',
            publishedAt: new Date().toISOString(),
            source: 'cbc',
            sourceUrl: 'https://www.cbc.ca/news',
          },
          {
            type: 'news',
            id: `news-fallback-2-${Date.now()}`,
            title: 'Toronto News - City Updates',
            description: 'Latest news and updates from the city of Toronto.',
            thumbnail: 'https://via.placeholder.com/300x200?text=Toronto+News',
            url: 'https://www.cbc.ca/news/canada/toronto',
            author: 'CBC Toronto',
            publishedAt: new Date().toISOString(),
            source: 'cbc',
            sourceUrl: 'https://www.cbc.ca/news/canada/toronto',
          },
          {
            type: 'news',
            id: `news-fallback-3-${Date.now()}`,
            title: 'Vancouver News - West Coast Updates',
            description: 'Latest news and updates from Vancouver and British Columbia.',
            thumbnail: 'https://via.placeholder.com/300x200?text=Vancouver+News',
            url: 'https://www.cbc.ca/news/canada/british-columbia',
            author: 'CBC Vancouver',
            publishedAt: new Date().toISOString(),
            source: 'cbc',
            sourceUrl: 'https://www.cbc.ca/news/canada/british-columbia',
          },
          {
            type: 'news',
            id: `news-fallback-4-${Date.now()}`,
            title: 'Montreal News - Quebec Updates',
            description: 'Latest news and updates from Montreal and Quebec.',
            thumbnail: 'https://via.placeholder.com/300x200?text=Montreal+News',
            url: 'https://www.cbc.ca/news/canada/montreal',
            author: 'CBC Montreal',
            publishedAt: new Date().toISOString(),
            source: 'cbc',
            sourceUrl: 'https://www.cbc.ca/news/canada/montreal',
          },
          {
            type: 'news',
            id: `news-fallback-5-${Date.now()}`,
            title: 'Calgary News - Alberta Updates',
            description: 'Latest news and updates from Calgary and Alberta.',
            thumbnail: 'https://via.placeholder.com/300x200?text=Calgary+News',
            url: 'https://www.cbc.ca/news/canada/calgary',
            author: 'CBC Calgary',
            publishedAt: new Date().toISOString(),
            source: 'cbc',
            sourceUrl: 'https://www.cbc.ca/news/canada/calgary',
          }
        ];
      }

      const articles = allArticles;
      return articles;
    } catch (error: any) {
      console.error('📰 Error searching Canadian news:', error.message);

      // Fallback: return some sample Canadian news
      return [
        {
          type: 'news',
          id: `news-fallback-1`,
          title: 'Toronto News - Latest Updates',
          description: 'Stay informed with the latest news from Toronto and across Canada.',
          thumbnail: 'https://via.placeholder.com/300x200?text=Toronto+News',
          url: 'https://www.cbc.ca/news/canada/toronto',
          author: 'CBC Toronto',
          publishedAt: new Date().toISOString(),
          source: 'cbc',
          sourceUrl: 'https://www.cbc.ca/news/canada/toronto',
        },
        {
          type: 'news',
          id: `news-fallback-2`,
          title: 'Canadian Business News',
          description: 'Latest business and economic news from across Canada.',
          thumbnail: 'https://via.placeholder.com/300x200?text=Business+News',
          url: 'https://www.cbc.ca/news/business',
          author: 'CBC Business',
          publishedAt: new Date().toISOString(),
          source: 'cbc',
          sourceUrl: 'https://www.cbc.ca/news/business',
        },
        {
          type: 'news',
          id: `news-fallback-3`,
          title: 'Vancouver News - West Coast Updates',
          description: 'Latest news and updates from Vancouver and British Columbia.',
          thumbnail: 'https://via.placeholder.com/300x200?text=Vancouver+News',
          url: 'https://www.cbc.ca/news/canada/british-columbia',
          author: 'CBC Vancouver',
          publishedAt: new Date().toISOString(),
          source: 'cbc',
          sourceUrl: 'https://www.cbc.ca/news/canada/british-columbia',
        },
        {
          type: 'news',
          id: `news-fallback-4`,
          title: 'Montreal News - Quebec Updates',
          description: 'Latest news and updates from Montreal and Quebec.',
          thumbnail: 'https://via.placeholder.com/300x200?text=Montreal+News',
          url: 'https://www.cbc.ca/news/canada/montreal',
          author: 'CBC Montreal',
          publishedAt: new Date().toISOString(),
          source: 'cbc',
          sourceUrl: 'https://www.cbc.ca/news/canada/montreal',
        },
        {
          type: 'news',
          id: `news-fallback-5`,
          title: 'Calgary News - Alberta Updates',
          description: 'Latest news and updates from Calgary and Alberta.',
          thumbnail: 'https://via.placeholder.com/300x200?text=Calgary+News',
          url: 'https://www.cbc.ca/news/canada/calgary',
          author: 'CBC Calgary',
          publishedAt: new Date().toISOString(),
          source: 'cbc',
          sourceUrl: 'https://www.cbc.ca/news/canada/calgary',
        },
        {
          type: 'news',
          id: `news-fallback-6`,
          title: 'Ottawa News - National Updates',
          description: 'Latest national news and updates from Ottawa.',
          thumbnail: 'https://via.placeholder.com/300x200?text=Ottawa+News',
          url: 'https://www.cbc.ca/news/politics',
          author: 'CBC Politics',
          publishedAt: new Date().toISOString(),
          source: 'cbc',
          sourceUrl: 'https://www.cbc.ca/news/politics',
        },
        {
          type: 'news',
          id: `news-fallback-7`,
          title: 'Edmonton News - Alberta Updates',
          description: 'Latest news and updates from Edmonton and Alberta.',
          thumbnail: 'https://via.placeholder.com/300x200?text=Edmonton+News',
          url: 'https://www.cbc.ca/news/canada/edmonton',
          author: 'CBC Edmonton',
          publishedAt: new Date().toISOString(),
          source: 'cbc',
          sourceUrl: 'https://www.cbc.ca/news/canada/edmonton',
        },
        {
          type: 'news',
          id: `news-fallback-8`,
          title: 'Winnipeg News - Manitoba Updates',
          description: 'Latest news and updates from Winnipeg and Manitoba.',
          thumbnail: 'https://via.placeholder.com/300x200?text=Winnipeg+News',
          url: 'https://www.cbc.ca/news/canada/manitoba',
          author: 'CBC Manitoba',
          publishedAt: new Date().toISOString(),
          source: 'cbc',
          sourceUrl: 'https://www.cbc.ca/news/canada/manitoba',
        }
      ];
    }
  }

  export async function POST(request: Request) {
    try {
      const body: SearchRequest = await request.json();
      const { query, types, maxResults = 300, trending = false, page = 1, limit = 20 } = body;

      console.log('🔍 Search API called:', { query, types, maxResults, trending, page, limit });

      // If trending is true and query is 'recommended', fetch trending content
      if (trending && query === 'recommended') {
        console.log('📈 Fetching trending content for types:', types);

        // For audiobooks, just fall back to regular search since trending doesn't support audiobooks yet
        if (types.includes('audiobook')) {
          console.log('🎧 Falling back to regular search for audiobooks');
          const fallbackResults = await searchAudiobooks('fiction', Math.min(maxResults, 300));

          // Apply pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedResults = fallbackResults.slice(startIndex, endIndex);
          const totalPages = Math.ceil(fallbackResults.length / limit);

          return NextResponse.json({
            results: paginatedResults,
            pagination: {
              page,
              limit,
              total: fallbackResults.length,
              totalPages,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
              startIndex: startIndex + 1,
              endIndex: Math.min(endIndex, fallbackResults.length),
            },
          });
        }

        // For other types, try to get trending content
        try {
          // Use axios for server-side request to trending API
          let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

          // If no base URL is configured, try to construct one from the request
          if (!baseUrl) {
            // In production, we can use the request headers to get the host
            const host = request.headers.get('host');
            const protocol = request.headers.get('x-forwarded-proto') || 'https';
            if (host) {
              baseUrl = `${protocol}://${host}`;
              console.log('📈 Constructed base URL from request headers:', baseUrl);
            } else {
              console.log('📈 No base URL configured and cannot construct from headers, skipping trending content');
              throw new Error('No base URL configured');
            }
          }

          const trendingResponse = await axios.get(`${baseUrl}/api/trending`);

          console.log('📈 Trending API response status:', trendingResponse.status);

          if (trendingResponse.status !== 200) {
            throw new Error(`Trending API returned ${trendingResponse.status}`);
          }

          const trendingData = trendingResponse.data;
          console.log('📈 Trending data received:', {
            videos: trendingData.videos?.length || 0,
            books: trendingData.books?.length || 0,
            music: trendingData.music?.length || 0,
            podcasts: trendingData.podcasts?.length || 0,
            news: trendingData.news?.length || 0,
            tv: trendingData.tv?.length || 0,
          });

          let trendingResults: any[] = [];

          if (types.includes('all')) {
            trendingResults = [
              ...trendingData.videos || [],
              ...trendingData.music || [],
              ...trendingData.books || [],
              ...trendingData.podcasts || [],
              ...trendingData.news || [],
              ...trendingData.tv || []
            ];
          } else {
            if (types.includes('video')) trendingResults.push(...(trendingData.videos || []));
            if (types.includes('music')) trendingResults.push(...(trendingData.music || []));
            if (types.includes('book')) trendingResults.push(...(trendingData.books || []));
            if (types.includes('podcast')) trendingResults.push(...(trendingData.podcasts || []));
            if (types.includes('news')) trendingResults.push(...(trendingData.news || []));
            if (types.includes('tv')) trendingResults.push(...(trendingData.tv || []));
          }

          console.log('📈 Returning trending results:', trendingResults.length);

          // Apply pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedResults = trendingResults.slice(startIndex, endIndex);
          const totalPages = Math.ceil(trendingResults.length / limit);

          return NextResponse.json({
            results: paginatedResults,
            pagination: {
              page,
              limit,
              total: trendingResults.length,
              totalPages,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
              startIndex: startIndex + 1,
              endIndex: Math.min(endIndex, trendingResults.length),
            },
          });
        } catch (error) {
          console.error('❌ Error fetching trending content:', error);
          // Fall back to regular search if trending fails
          // For books, search for popular fiction as fallback
          if (types.includes('book')) {
            console.log('📚 Falling back to fiction search for books');
            const fallbackResults = await searchBooks('fiction', Math.min(maxResults, 300));

            // Apply pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedResults = fallbackResults.slice(startIndex, endIndex);
            const totalPages = Math.ceil(fallbackResults.length / limit);

            return NextResponse.json({
              results: paginatedResults,
              pagination: {
                page,
                limit,
                total: fallbackResults.length,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                startIndex: startIndex + 1,
                endIndex: Math.min(endIndex, fallbackResults.length),
              },
            });
          }
        }
      }

      // For news searches, allow empty query to get general news
      if (!query && !types.includes('news')) {
        return NextResponse.json(
          { error: 'Query parameter is required' },
          { status: 400 }
        );
      }

      console.log('🔍 Performing regular search for query:', query);

      const searchPromises = [];

      // If types includes 'all', search all types
      if (types.includes('all')) {
        searchPromises.push(searchYouTube(query, maxResults));
        searchPromises.push(searchBooks(query, Math.min(maxResults, 300)));
        searchPromises.push(searchAudiobooks(query, Math.min(maxResults, 300)));
        searchPromises.push(searchPodcasts(query, maxResults, request));
        searchPromises.push(searchMusic(query, maxResults));
        searchPromises.push(searchNews(query, maxResults));
        searchPromises.push(searchTV(query, maxResults));
      } else {
        // Otherwise, only search the specified types
        if (types.includes('video')) {
          searchPromises.push(searchYouTube(query, maxResults));
        }
        if (types.includes('book')) {
          searchPromises.push(searchBooks(query, Math.min(maxResults, 300)));
        }
        if (types.includes('audiobook')) {
          searchPromises.push(searchAudiobooks(query, Math.min(maxResults, 300)));
        }
        if (types.includes('podcast')) {
          searchPromises.push(searchPodcasts(query, maxResults, request));
        }
        if (types.includes('music')) {
          searchPromises.push(searchMusic(query, maxResults));
        }
        if (types.includes('news')) {
          searchPromises.push(searchNews(query, maxResults));
        }
        if (types.includes('tv')) {
          searchPromises.push(searchTV(query, maxResults));
        }
      }

      const results = await Promise.allSettled(searchPromises);
      const searchResults = results
        .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
        .flatMap(result => result.value)
        .filter(item => item && item.title && item.title.trim() !== ''); // Filter out invalid items

      // Enhanced relevance scoring and sorting
      const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);

      const calculateRelevanceScore = (item: any) => {
        const title = (item.title || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        const author = (item.author || '').toLowerCase();

        let score = 0;

        // Exact title match (highest priority)
        if (title === query.toLowerCase()) {
          score += 1000;
        }

        // Title starts with query
        if (title.startsWith(query.toLowerCase())) {
          score += 500;
        }

        // All query words found in title (in order)
        const titleWords = title.split(/\s+/);
        let allWordsInOrder = true;
        let wordIndex = 0;

        for (const queryWord of queryWords) {
          const foundIndex = titleWords.findIndex((titleWord: string, index: number) =>
            index >= wordIndex && titleWord.includes(queryWord)
          );
          if (foundIndex === -1) {
            allWordsInOrder = false;
            break;
          }
          wordIndex = foundIndex + 1;
        }

        if (allWordsInOrder) {
          score += 300;
        }

        // All query words found in title (any order)
        const allWordsFound = queryWords.every(queryWord =>
          titleWords.some((titleWord: string) => titleWord.includes(queryWord))
        );

        if (allWordsFound) {
          score += 200;
        }

        // Query words found in title (partial matches)
        let titleWordMatches = 0;
        for (const queryWord of queryWords) {
          for (const titleWord of titleWords) {
            if (titleWord.includes(queryWord)) {
              titleWordMatches++;
              break;
            }
          }
        }
        score += titleWordMatches * 50;

        // Author matches
        if (author.includes(query.toLowerCase())) {
          score += 150;
        }

        // Description matches
        const descWords = description.split(/\s+/);
        let descWordMatches = 0;
        for (const queryWord of queryWords) {
          for (const descWord of descWords) {
            if (descWord.includes(queryWord)) {
              descWordMatches++;
              break;
            }
          }
        }
        score += descWordMatches * 10;

        // Boost for shorter titles (more specific)
        score += Math.max(0, 50 - titleWords.length * 2);

        // Boost for recent content (if available)
        if (item.publishedAt || item.publishedDate || item.releaseDate) {
          score += 5;
        }

        // Boost for high ratings (if available)
        if (item.rating && item.rating >= 4) {
          score += 20;
        }

        return score;
      };

      // Sort by relevance score (highest first)
      searchResults.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a);
        const scoreB = calculateRelevanceScore(b);

        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Higher score first
        }

        // If scores are equal, prefer shorter titles
        return a.title.length - b.title.length;
      });

      // Log all results with their relevance scores
      console.log('🔍 All results with relevance scores:');
      searchResults.forEach((result, index) => {
        const score = calculateRelevanceScore(result);
        console.log(`${index + 1}. [${score}pts] ${result.title} (${result.type})`);
      });

      console.log('🔍 Search completed, returning results:', searchResults.length);

      // Log audiobook data specifically
      const audiobooks = searchResults.filter(result => result.type === 'audiobook');
      if (audiobooks.length > 0) {
        console.log('🎧 Audiobooks being sent to frontend:', audiobooks.map(book => ({
          title: book.title,
          url: book.url,
          audibleUrl: book.audibleUrl,
          id: book.id
        })));
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = searchResults.slice(startIndex, endIndex);
      const totalPages = Math.ceil(searchResults.length / limit);

      return NextResponse.json({
        results: paginatedResults,
        pagination: {
          page,
          limit,
          total: searchResults.length,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          startIndex: startIndex + 1,
          endIndex: Math.min(endIndex, searchResults.length),
        },
      });
    } catch (error) {
      console.error('❌ Search error:', error);
      return NextResponse.json(
        { error: 'An error occurred while searching' },
        { status: 500 }
      );
    }
  } 