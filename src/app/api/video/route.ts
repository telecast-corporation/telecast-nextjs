import { NextResponse } from 'next/server';
import axios from 'axios';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'video';

    // Enhanced environment logging
    console.log('=== VIDEO SEARCH DEBUG INFO ===');
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasApiKey: !!YOUTUBE_API_KEY,
      apiKeyLength: YOUTUBE_API_KEY?.length,
    });
    console.log('Request URL:', request.url);
    console.log('Search params:', { query, type });

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (!YOUTUBE_API_KEY) {
      console.error('❌ YouTube API key is missing');
      return NextResponse.json({ error: 'YouTube API key is not configured' }, { status: 500 });
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 300,
        q: query,
        type: type,
        videoCategoryId: '10', // Music category
        regionCode: 'CA',
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });

    // Log response details
    console.log('✅ YouTube API response:', {
      status: response.status,
      statusText: response.statusText,
      itemsCount: response.data.items?.length || 0,
    });

    if (response.data.error) {
      console.error('❌ YouTube API returned an error:', response.data.error);
      return NextResponse.json(
        { error: 'YouTube API error', details: response.data.error },
        { status: 500 }
      );
    }

    if (!response.data.items || response.data.items.length === 0) {
      return NextResponse.json({ error: 'No videos found' }, { status: 404 });
    }

    const video = response.data.items[0];
    return NextResponse.json({
      videoId: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
    });
  } catch (error: any) {
    // Enhanced error logging
    console.error('❌ YouTube search error:', {
      message: error.message,
      code: error.code,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      },
      config: {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      }
    });

    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'YouTube API quota exceeded or invalid API key' },
        { status: 429 }
      );
    }

    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Request timeout - YouTube API is not responding' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to search YouTube videos' },
      { status: 500 }
    );
  }
}