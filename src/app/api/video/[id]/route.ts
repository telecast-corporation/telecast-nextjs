
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY is not set');
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,player&key=${apiKey}`
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
    }

    if (data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = data.items[0];
    const videoDetails = {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      videoUrl: video.player.embedHtml, // This will be an iframe
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
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
