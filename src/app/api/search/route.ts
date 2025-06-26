export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { PodcastIndex, Podcast } from '@/lib/podcast-index';

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
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

interface SearchRequest {
  query: string;
  types: string[];
  maxResults?: number;
  trending?: boolean;
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

async function searchYouTube(query: string, maxResults: number = 10) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults,
        q: query,
        type: 'video',
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

async function searchBooks(query: string, maxResults: number = 10) {
  try {
    // Ensure maxResults doesn't exceed Google Books API limit of 40
    const safeMaxResults = Math.min(maxResults, 40);
    
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        maxResults: safeMaxResults,
        key: process.env.GOOGLE_BOOKS_API_KEY,
      },
    });

    return response.data.items.map((item: any) => ({
      type: 'book',
      id: item.id,
      title: truncateText(item.volumeInfo.title, 50),
      description: truncateText(item.volumeInfo.description, 100),
      thumbnail: ensureHttps(item.volumeInfo.imageLinks?.thumbnail),
      url: `/book/${item.id}`, // Link to our internal book page
      author: truncateText(item.volumeInfo.authors?.join(', ') || 'Unknown Author', 30),
      publishedDate: item.volumeInfo.publishedDate,
      categories: item.volumeInfo.categories,
      rating: item.volumeInfo.averageRating,
      ratingsCount: item.volumeInfo.ratingsCount,
      source: 'google_books',
      sourceUrl: item.volumeInfo.infoLink,
    }));
  } catch (error) {
    console.error('Books search error:', error);
    return [];
  }
}

async function searchPodcasts(query: string, maxResults: number = 10) {
  try {
    const podcastIndex = new PodcastIndex();
    const results = await podcastIndex.search(query);
    
    return results.slice(0, maxResults).map((podcast: Podcast) => ({
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
  } catch (error) {
    console.error('Podcast search error:', error);
    return [];
  }
}

async function searchMusic(query: string, maxResults: number = 10) {
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

export async function POST(request: Request) {
  try {
    const body: SearchRequest = await request.json();
    const { query, types, maxResults = 20, trending = false } = body;

    console.log('🔍 Search API called:', { query, types, maxResults, trending });

    // If trending is true and query is 'recommended', fetch trending content
    if (trending && query === 'recommended') {
      console.log('📈 Fetching trending content for types:', types);
      try {
        // Use relative URL instead of absolute URL with environment variable
        const trendingResponse = await fetch('/api/trending', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📈 Trending API response status:', trendingResponse.status);
        
        if (!trendingResponse.ok) {
          throw new Error(`Trending API returned ${trendingResponse.status}`);
        }
        
        const trendingData = await trendingResponse.json();
        console.log('📈 Trending data received:', {
          videos: trendingData.videos?.length || 0,
          books: trendingData.books?.length || 0,
          music: trendingData.music?.length || 0,
          podcasts: trendingData.podcasts?.length || 0,
        });
        
        let trendingResults: any[] = [];
        
        if (types.includes('all')) {
          trendingResults = [
            ...trendingData.videos || [],
            ...trendingData.music || [],
            ...trendingData.books || [],
            ...trendingData.podcasts || []
          ];
        } else {
          if (types.includes('video')) trendingResults.push(...(trendingData.videos || []));
          if (types.includes('music')) trendingResults.push(...(trendingData.music || []));
          if (types.includes('book')) trendingResults.push(...(trendingData.books || []));
          if (types.includes('podcast')) trendingResults.push(...(trendingData.podcasts || []));
        }
        
        console.log('📈 Returning trending results:', trendingResults.length);
        return NextResponse.json({
          results: trendingResults,
          total: trendingResults.length,
        });
      } catch (error) {
        console.error('❌ Error fetching trending content:', error);
        // Fall back to regular search if trending fails
        // For books, search for popular fiction as fallback
        if (types.includes('book')) {
          console.log('📚 Falling back to fiction search for books');
          const fallbackResults = await searchBooks('fiction', Math.min(maxResults, 40));
          return NextResponse.json({
            results: fallbackResults,
            total: fallbackResults.length,
          });
        }
      }
    }

    if (!query) {
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
      searchPromises.push(searchBooks(query, Math.min(maxResults, 40)));
      searchPromises.push(searchPodcasts(query, maxResults));
      searchPromises.push(searchMusic(query, maxResults));
    } else {
      // Otherwise, only search the specified types
      if (types.includes('video')) {
        searchPromises.push(searchYouTube(query, maxResults));
      }
      if (types.includes('book')) {
        searchPromises.push(searchBooks(query, Math.min(maxResults, 40)));
      }
      if (types.includes('podcast')) {
        searchPromises.push(searchPodcasts(query, maxResults));
      }
      if (types.includes('music')) {
        searchPromises.push(searchMusic(query, maxResults));
      }
    }

    const results = await Promise.allSettled(searchPromises);
    const searchResults = results
      .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
      .flatMap(result => result.value);

    // Sort results by relevance
    searchResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const queryLower = query.toLowerCase();
      
      const aExactMatch = aTitle === queryLower;
      const bExactMatch = bTitle === queryLower;
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      const aStartsWith = aTitle.startsWith(queryLower);
      const bStartsWith = bTitle.startsWith(queryLower);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return 0;
    });

    console.log('🔍 Search completed, returning results:', searchResults.length);
    return NextResponse.json({
      results: searchResults,
      total: searchResults.length,
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching' },
      { status: 500 }
    );
  }
} 