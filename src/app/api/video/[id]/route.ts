
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to format YouTube duration
const formatDuration = (duration: string) => {
  if (!duration) return '0:00';
  return duration
    .replace('PT', '')
    .replace('H', ':')
    .replace('M', ':')
    .replace('S', '');
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  try {
    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key is not configured.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // Fetch video details from YouTube API
    const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: id,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = response.data.items[0];
    const { snippet, statistics, contentDetails } = video;

    // Construct the video data object
    const videoData = {
      id: id,
      title: snippet?.title || 'No title',
      description: snippet?.description || 'No description available.',
      thumbnail: snippet?.thumbnails?.high?.url || '',
      channelTitle: snippet?.channelTitle || 'Unknown Channel',
      channelUrl: `https://www.youtube.com/channel/${snippet?.channelId}`,
      publishedAt: snippet?.publishedAt || new Date().toISOString(),
      viewCount: statistics?.viewCount ? parseInt(statistics.viewCount, 10) : 0,
      likeCount: statistics?.likeCount ? parseInt(statistics.likeCount, 10) : 0,
      duration: contentDetails?.duration ? formatDuration(contentDetails.duration) : '0:00',
      source: 'youtube',
      videoUrl: `https://www.youtube.com/embed/${id}`,
      sourceUrl: `https://www.youtube.com/watch?v=${id}`,
    };

    return NextResponse.json({ video: videoData });

  } catch (error) {
    console.error('Error fetching video from YouTube:', error);

    let errorMessage = 'An unexpected error occurred while fetching the video.';
    let statusCode = 500;

    if (axios.isAxiosError(error) && error.response) {
      const youtubeError = error.response.data?.error;
      if (youtubeError?.message) {
        errorMessage = `YouTube API Error: ${youtubeError.message}`;
      }
      statusCode = error.response.status || 500;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
