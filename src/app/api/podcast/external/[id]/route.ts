import { NextRequest, NextResponse } from 'next/server';
import { PodcastIndex } from '@/lib/podcast-index';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return NextResponse.json({ error: 'Invalid podcast id' }, { status: 400 });
    }

    const podcastIndex = new PodcastIndex();
    const podcast = await podcastIndex.getPodcastById(numericId);

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Error fetching external podcast:', error);
    return NextResponse.json(
      { error: 'Error fetching external podcast' },
      { status: 500 }
    );
  }
}