import { NextResponse } from 'next/server';
import { PodcastIndex } from '@/lib/podcast-index';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const podcastIndex = new PodcastIndex();
    const podcastId = parseInt(params.id);
    
    if (isNaN(podcastId)) {
      return NextResponse.json(
        { error: 'Invalid podcast ID' },
        { status: 400 }
      );
    }

    const podcast = await podcastIndex.getPodcastById(podcastId);
    
    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch podcast' },
      { status: 500 }
    );
  }
} 