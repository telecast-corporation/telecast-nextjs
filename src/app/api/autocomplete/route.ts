import { NextResponse } from 'next/server';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PODCASTINDEX_API_KEY = process.env.PODCASTINDEX_API_KEY;
const PODCASTINDEX_API_SECRET = process.env.PODCASTINDEX_API_SECRET;

interface AutocompleteResult {
  id: string;
  title: string;
  type: 'video' | 'book' | 'podcast' | 'music';
  author?: string;
  thumbnail?: string;
  url?: string;
}

// Cache for Spotify token
let spotifyToken: { token: string; expires: number } | null = null;

async function getSpotifyAccessToken(): Promise<string | null> {
  if (spotifyToken && Date.now() < spotifyToken.expires) {
    return spotifyToken.token;
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    spotifyToken = {
      token: response.data.access_token,
      expires: Date.now() + (response.data.expires_in * 1000) - 60000, // 1 minute buffer
    };

    return spotifyToken.token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    return null;
  }
}

async function getYouTubeAutocomplete(query: string): Promise<AutocompleteResult[]> {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 2,
        q: query,
        type: 'video',
        key: YOUTUBE_API_KEY,
      },
    });

    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      type: 'video' as const,
      author: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.default?.url,
      url: `/video/${item.id.videoId}`,
    }));
  } catch (error) {
    console.error('YouTube autocomplete error:', error);
    return [];
  }
}

function ensureHttps(url) {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
}

async function getBooksAutocomplete(query: string): Promise<AutocompleteResult[]> {
  try {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        maxResults: 2,
        key: GOOGLE_BOOKS_API_KEY,
      },
    });

    return response.data.items?.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      type: 'book' as const,
      author: item.volumeInfo.authors?.[0],
      thumbnail: ensureHttps(item.volumeInfo.imageLinks?.smallThumbnail),
      url: `/book/${item.id}`,
    })) || [];
  } catch (error) {
    console.error('Books autocomplete error:', error);
    return [];
  }
}

async function getMusicAutocomplete(query: string): Promise<AutocompleteResult[]> {
  try {
    const accessToken = await getSpotifyAccessToken();
    if (!accessToken) return [];

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        q: query,
        type: 'track',
        limit: 2,
      },
    });

    return response.data.tracks.items.map((item: any) => ({
      id: item.id,
      title: item.name,
      type: 'music' as const,
      author: item.artists[0].name,
      thumbnail: item.album.images[2]?.url, // smallest image
      url: item.external_urls.spotify,
    }));
  } catch (error) {
    console.error('Music autocomplete error:', error);
    return [];
  }
}

async function getPodcastsAutocomplete(query: string): Promise<AutocompleteResult[]> {
  try {
    if (!PODCASTINDEX_API_KEY || !PODCASTINDEX_API_SECRET) {
      console.error('Missing Podcast Index credentials');
      return [];
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const hash = require('crypto')
      .createHash('sha1')
      .update(PODCASTINDEX_API_KEY + PODCASTINDEX_API_SECRET + timestamp)
      .digest('hex');

    const response = await axios.get('https://api.podcastindex.org/api/1.0/search/byterm', {
      params: { 
        q: query,
        max: 2,
        clean: true
      },
      headers: {
        'User-Agent': 'Telecast/1.0',
        'X-Auth-Key': PODCASTINDEX_API_KEY,
        'X-Auth-Date': timestamp.toString(),
        'Authorization': hash,
      },
    });

    return response.data.feeds?.map((feed: any) => ({
      id: feed.id.toString(),
      title: feed.title,
      type: 'podcast' as const,
      author: feed.author,
      thumbnail: feed.artwork || feed.image,
      url: `/podcast/${feed.id}`,
    })) || [];
  } catch (error) {
    console.error('Podcast autocomplete error:', error);
    return [];
  }
}

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const promises: Promise<AutocompleteResult[]>[] = [];

    if (type === 'all') {
      promises.push(getPodcastsAutocomplete(query));
      promises.push(getYouTubeAutocomplete(query));
      promises.push(getMusicAutocomplete(query));
      promises.push(getBooksAutocomplete(query));
    } else {
      switch (type) {
        case 'video':
          promises.push(getYouTubeAutocomplete(query));
          break;
        case 'book':
          promises.push(getBooksAutocomplete(query));
          break;
        case 'music':
          promises.push(getMusicAutocomplete(query));
          break;
        case 'podcast':
          promises.push(getPodcastsAutocomplete(query));
          break;
      }
    }

    const results = await Promise.allSettled(promises);
    const suggestions = results
      .filter((result): result is PromiseFulfilledResult<AutocompleteResult[]> => 
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value)
      .slice(0, 8); // Limit to 8 suggestions total

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json({ suggestions: [] });
  }
} 