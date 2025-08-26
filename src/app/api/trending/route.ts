import { NextResponse } from 'next/server';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const PODCASTINDEX_API_KEY = process.env.PODCASTINDEX_API_KEY;
const PODCASTINDEX_API_SECRET = process.env.PODCASTINDEX_API_SECRET;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getTrendingVideos() {
  try {
    console.log('Fetching trending videos...');
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'snippet,statistics',
          chart: 'mostPopular',
          regionCode: 'CA',
          maxResults: 200,
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

        // Search for tracks from multiple popular artists to get more results
    const popularArtists = ['Taylor Swift', 'Drake', 'The Weeknd', 'Ed Sheeran', 'Ariana Grande', 'Post Malone'];
    const searchPromises = popularArtists.slice(0, 6).map(artist => // Use 6 artists to get ~300 tracks (50 each)
      axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: `artist:${artist}`,
          type: 'track',
          limit: 50, // Spotify's max limit per request
          market: 'CA',
        },
      })
    );

    const responses = await Promise.allSettled(searchPromises);
    const allTracks: any[] = [];

    responses.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.data.tracks?.items) {
        const tracks = result.value.data.tracks.items;
        allTracks.push(...tracks);
        console.log(`Got ${tracks.length} tracks from ${popularArtists[index]}`);
      } else {
        console.error(`Failed to get tracks from ${popularArtists[index]}`);
      }
    });

    console.log('Music response:', {
      totalTracks: allTracks.length,
      artistsSearched: popularArtists.slice(0, 6),
    });

    // Remove duplicates based on track ID and shuffle for variety
    const uniqueTracks = Array.from(
      new Map(allTracks.map(track => [track.id, track])).values()
    );
    
    // Shuffle the tracks for better variety
    const shuffledTracks = uniqueTracks.sort(() => Math.random() - 0.5);

    return shuffledTracks.slice(0, 300).map((track: any) => ({
      id: track.id,
      type: 'music',
      title: track.name,
      description: track.artists.map((artist: any) => artist.name).join(', '),
      thumbnail: track.album.images[0]?.url,
      url: track.external_urls?.spotify,
      artist: track.artists[0].name,
      album: track.album.name,
      releaseDate: track.album.release_date,
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
          maxResults: 40,
          country: 'CA',
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
        params: { max: 200 },
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

async function getTrendingNews() {
  try {
    console.log('Fetching trending Canadian news...');

    // Try multiple sources to get more news
    const newsSources = [
      'https://globalnews.ca/feed/',
      'https://www.cbc.ca/webfeed/rss/rss-topstoriestopstories',
      'https://www.cbc.ca/webfeed/rss/rss-business',
      'https://www.cbc.ca/webfeed/rss/rss-politics',
      'https://www.cbc.ca/webfeed/rss/rss-canada',
      'https://www.cbc.ca/webfeed/rss/rss-world',
      'https://www.cbc.ca/webfeed/rss/rss-technology',
      'https://www.cbc.ca/webfeed/rss/rss-sports',
      'https://www.cbc.ca/webfeed/rss/rss-arts',
      'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009',
      'https://www.ctvnews.ca/rss/ctvnews-ca-canada-public-rss-1.822008',
      'https://www.ctvnews.ca/rss/ctvnews-ca-world-public-rss-1.822010',
      'https://www.ctvnews.ca/rss/ctvnews-ca-business-public-rss-1.822011',
      'https://www.ctvnews.ca/rss/ctvnews-ca-politics-public-rss-1.822012'
    ];
    
    let allArticles = [];
    
    for (const source of newsSources) {
      try {
        console.log(`📰 Trying trending source: ${source}`);
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
        while ((match = itemRegex.exec(xmlText)) !== null) {
          const itemContent = match[1];
          
          const title = itemContent.match(titleRegex)?.[1] || 'No title';
          const description = itemContent.match(descriptionRegex)?.[1] || 'No description';
          const link = itemContent.match(linkRegex)?.[1] || '';
          const pubDate = itemContent.match(pubDateRegex)?.[1] || '';
          const creator = itemContent.match(creatorRegex)?.[1] || 'Unknown Author';
          const thumbnail = itemContent.match(mediaThumbnailRegex)?.[1] || 'https://via.placeholder.com/300x200?text=Canadian+News';
          
          allArticles.push({
            id: `news-${allArticles.length}-${Date.now()}`,
            type: 'news',
            title: title,
            description: description,
            thumbnail: thumbnail,
            url: link,
            author: creator,
            publishedAt: pubDate,
            source: source.includes('globalnews') ? 'globalnews' : 
                   source.includes('ctv') ? 'ctv' : 'cbc',
            sourceUrl: link,
          });
        }
        
        console.log(`📰 Found ${allArticles.length} articles from ${source}`);
        
      } catch (error: any) {
        console.log(`📰 Error with source ${source}:`, error.message);
        continue;
      }
    }
    
    console.log('Canadian trending news response:', { articlesCount: allArticles.length });
    return allArticles;
  } catch (error) {
    console.error('Error fetching trending Canadian news:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    console.log('Starting to fetch all trending content...');
    const [videos, music, books, podcasts, news] = await Promise.all([
      getTrendingVideos(),
      getTrendingMusic(),
      getTrendingBooks(),
      getTrendingPodcasts(),
      getTrendingNews(),
    ]);

    console.log('All content fetched:', {
      videosCount: videos.length,
      musicCount: music.length,
      booksCount: books.length,
      podcastsCount: podcasts.length,
      newsCount: news.length,
    });

    // Combine and sort all trending content by type
    const trendingContent = {
      videos,
      music,
      books,
      podcasts,
      news,
    };

    return new NextResponse(JSON.stringify(trendingContent), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch trending content' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 