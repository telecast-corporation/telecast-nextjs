export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import axios from 'axios';

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
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

async function searchBooks(query: string, maxResults: number = 10) {
  try {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        maxResults,
        key: process.env.GOOGLE_BOOKS_API_KEY,
      },
    });

    return response.data.items.map((item: any) => ({
      type: 'book',
      id: item.id,
      title: item.volumeInfo.title,
      description: item.volumeInfo.description,
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
      url: item.volumeInfo.infoLink,
      authors: item.volumeInfo.authors,
      publishedDate: item.volumeInfo.publishedDate,
      categories: item.volumeInfo.categories,
      rating: item.volumeInfo.averageRating,
      ratingsCount: item.volumeInfo.ratingsCount,
    }));
  } catch (error) {
    console.error('Books search error:', error);
    return [];
  }
}

async function searchPodcasts(query: string, maxResults: number = 10) {
  // TODO: Implement podcast search
  return [];
}

export async function POST(request: Request) {
  try {
    const body: SearchRequest = await request.json();
    const { query, types, maxResults = 20 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const searchPromises = [];

    if (types.includes('all') || types.includes('video')) {
      searchPromises.push(searchYouTube(query, maxResults));
    }

    if (types.includes('all') || types.includes('book')) {
      searchPromises.push(searchBooks(query, maxResults));
    }

    if (types.includes('all') || types.includes('podcast')) {
      searchPromises.push(searchPodcasts(query, maxResults));
    }

    const results = await Promise.allSettled(searchPromises);
    const searchResults = results
      .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
      .flatMap(result => result.value);

    // Sort results by relevance (you might want to implement a more sophisticated sorting algorithm)
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

    return NextResponse.json({
      results: searchResults,
      total: searchResults.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching' },
      { status: 500 }
    );
  }
} 