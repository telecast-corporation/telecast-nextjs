import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY is not set');
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,player,statistics,contentDetails&key=${apiKey}`
    );

    const data = await response.json();

    if (!response.ok || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;
    const player = video.player;

    // Format duration from ISO 8601 to readable format
    const duration = contentDetails.duration
      .replace('PT', '')
      .replace('H', ':')
      .replace('M', ':')
      .replace('S', '');

    const videoDetails = {
      id: id,
      title: snippet.title,
      description: snippet.description,
      thumbnail: snippet.thumbnails.high.url,
      author: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
      viewCount: statistics ? parseInt(statistics.viewCount) : 0,
      likeCount: statistics ? parseInt(statistics.likeCount) : 0,
      duration,
      videoUrl: player.embedHtml, // This is the iframe embed code
      source: 'youtube',
      sourceUrl: `https://www.youtube.com/watch?v=${id}`,
    };

    return NextResponse.json(videoDetails);
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Error fetching video' },
      { status: 500 }
    );
  }
}
