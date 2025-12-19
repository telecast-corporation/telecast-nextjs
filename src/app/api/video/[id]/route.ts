import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is not configured.');
    }

    const videoResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: id,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = videoResponse.data.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;

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
      channelTitle: snippet.channelTitle,
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
    let errorMessage = 'Failed to fetch video';

    if (axios.isAxiosError(error) && error.response) {
        const youtubeError = error.response.data.error;
        if (youtubeError && youtubeError.message) {
            errorMessage = youtubeError.message;
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    console.error('Error fetching video:', errorMessage);

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
