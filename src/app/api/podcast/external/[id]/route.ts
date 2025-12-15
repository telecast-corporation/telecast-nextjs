import { NextRequest, NextResponse } from 'next/server';
import { Spotify } from '@/lib/spotify';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Invalid podcast id' }, { status: 400 });
    }

    const spotify = new Spotify();
    const podcast = await spotify.getPodcastById(id);

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
