import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = params;

  try {
    // Get video details
    const videoResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
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

    const video = videoResponse.data.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;

    // Format duration from ISO 8601 to readable format
    const duration = contentDetails.duration
      .replace('PT', '')
      .replace('H', ':')
      .replace('M', ':')
      .replace('S', '');

    return NextResponse.json({
      id: id,
      title: snippet.title,
      description: snippet.description,
      thumbnail: snippet.thumbnails.high.url,
      author: snippet.channelTitle,
      channelUrl: `https://www.youtube.com/channel/${snippet.channelId}`,
      publishedAt: snippet.publishedAt,
      viewCount: statistics ? parseInt(statistics.viewCount) : 0,
      likeCount: statistics ? parseInt(statistics.likeCount) : 0,
      duration,
      source: 'youtube',
      videoUrl: `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
      sourceUrl: `https://www.youtube.com/watch?v=${id}`,
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}
