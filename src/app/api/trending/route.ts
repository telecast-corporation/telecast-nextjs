import { NextResponse } from 'next/server';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const PODCASTINDEX_API_KEY = process.env.PODCASTINDEX_API_KEY;
const PODCASTINDEX_API_SECRET = process.env.PODCASTINDEX_API_SECRET;

export const dynamic = 'force-dynamic';

async function getTrendingVideos() {
  try {
    console.log('Fetching trending videos...');
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'snippet,statistics',
          chart: 'mostPopular',
          regionCode: 'US',
          maxResults: 10,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    console.log('Videos response:', response.data);
    return response.data.items.map((item: any) => ({
      id: item.id,
      type: 'video',
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      views: item.statistics.viewCount,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return [];
  }
}

async function getTrendingMusic() {
  try {
    console.log('Fetching trending music...');
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error('Missing Spotify credentials');
      return [];
    }

    // First, get an access token
    console.log('Getting Spotify access token...');
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    );

    if (!tokenResponse.data.access_token) {
      console.error('No access token received from Spotify');
      return [];
    }

    const accessToken = tokenResponse.data.access_token;
    console.log('Got Spotify access token');

    // Get new releases instead of playlist
    console.log('Fetching new releases from Spotify...');
    const response = await axios.get(
      'https://api.spotify.com/v1/browse/new-releases',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          limit: 10,
          country: 'US',
        },
      }
    );

    if (!response.data.albums?.items) {
      console.error('Invalid response from Spotify:', response.data);
      return [];
    }

    console.log('Music response:', {
      totalAlbums: response.data.albums.items.length,
      firstAlbum: response.data.albums.items[0]?.name,
    });

    return response.data.albums.items.map((album: any) => ({
      id: album.id,
      type: 'music',
      title: album.name,
      description: album.artists.map((artist: any) => artist.name).join(', '),
      thumbnail: album.images[0]?.url,
      url: album.external_urls.spotify,
      artist: album.artists[0].name,
      album: album.name,
      releaseDate: album.release_date,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Spotify API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('Error fetching trending music:', error);
    }
    return [];
  }
}

function ensureHttps(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
}

async function getTrendingBooks() {
  try {
    console.log('Fetching trending books...');
    const response = await axios.get(
      'https://www.googleapis.com/books/v1/volumes',
      {
        params: {
          q: 'fiction',
          maxResults: 10,
          key: GOOGLE_BOOKS_API_KEY,
        },
      }
    );

    console.log('Books response:', response.data);
    if (!response.data.items) {
      console.error('No books found in response');
      return [];
    }

    return response.data.items.map((item: any) => ({
      id: item.id,
      type: 'book',
      title: item.volumeInfo.title,
      description: item.volumeInfo.description,
      thumbnail: ensureHttps(item.volumeInfo.imageLinks?.thumbnail),
      url: item.volumeInfo.infoLink,
      author: item.volumeInfo.authors?.[0] || 'Unknown Author',
      publishedDate: item.volumeInfo.publishedDate,
      rating: item.volumeInfo.averageRating,
    }));
  } catch (error) {
    console.error('Error fetching trending books:', error);
    return [];
  }
}

async function getTrendingPodcasts() {
  try {
    console.log('Fetching trending podcasts...');
    if (!PODCASTINDEX_API_KEY || !PODCASTINDEX_API_SECRET) {
      console.error('Missing Podcast Index credentials');
      return [];
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const hash = require('crypto')
      .createHash('sha1')
      .update(PODCASTINDEX_API_KEY + PODCASTINDEX_API_SECRET + timestamp)
      .digest('hex');

    const response = await axios.get(
      'https://api.podcastindex.org/api/1.0/recent/feeds',
      {
        params: { max: 10 },
        headers: {
          'User-Agent': 'Telecast/1.0',
          'X-Auth-Key': PODCASTINDEX_API_KEY,
          'X-Auth-Date': timestamp.toString(),
          'Authorization': hash,
        },
      }
    );

    console.log('Podcasts response:', response.data);
    return response.data.feeds.map((feed: any) => ({
      id: feed.id,
      type: 'podcast',
      title: feed.title,
      description: feed.description,
      thumbnail: feed.artwork || feed.image,
      url: feed.url,
      author: feed.author,
      episodeCount: feed.episodeCount,
      categories: feed.categories ? Object.values(feed.categories) : [],
    }));
  } catch (error) {
    console.error('Error fetching trending podcasts:', error);
    return [];
  }
}

export async function GET() {
  try {
    console.log('Starting to fetch all trending content...');
    const [videos, music, books, podcasts] = await Promise.all([
      getTrendingVideos(),
      getTrendingMusic(),
      getTrendingBooks(),
      getTrendingPodcasts(),
    ]);

    console.log('All content fetched:', {
      videosCount: videos.length,
      musicCount: music.length,
      booksCount: books.length,
      podcastsCount: podcasts.length,
    });

    // Combine and sort all trending content by type
    const trendingContent = {
      videos,
      music,
      books,
      podcasts,
    };

    return NextResponse.json(trendingContent);
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending content' },
      { status: 500 }
    );
  }
} 