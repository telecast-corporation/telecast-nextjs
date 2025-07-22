import { NextResponse } from 'next/server';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key is not configured');
      return NextResponse.json(
        { error: 'YouTube API is not configured' },
        { status: 500 }
      );
    }

    // First get the video details to get the channel ID
    const videoResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'snippet',
        id: id,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const channelId = videoResponse.data.items[0].snippet.channelId;

    // Get related videos from the same channel
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        type: 'video',
        maxResults: 10,
        key: YOUTUBE_API_KEY,
        channelId: channelId,
        order: 'date',
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return NextResponse.json([]);
    }

    // Filter out the current video and get video statistics
    const relatedVideos = response.data.items
      .filter((item: any) => item.id.videoId !== id)
      .slice(0, 10);

    if (relatedVideos.length === 0) {
      return NextResponse.json([]);
    }

    const videoIds = relatedVideos.map((item: any) => item.id.videoId);
    const statsResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'statistics',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY,
      },
    });

    // Combine search results with statistics
    const videosWithStats = relatedVideos.map((item: any, index: number) => {
      const stats = statsResponse.data.items[index]?.statistics;
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        author: item.snippet.channelTitle,
        viewCount: parseInt(stats?.viewCount || '0'),
        publishedAt: item.snippet.publishedAt,
      };
    });

    return NextResponse.json(videosWithStats);
  } catch (error) {
    console.error('Error fetching related videos:', error);
    if (axios.isAxiosError(error)) {
      const { status, data } = error.response || {};
      console.error('YouTube API error:', { status, data });
    }
    return NextResponse.json(
      { error: 'Failed to fetch related videos' },
      { status: 500 }
    );
  }
} 