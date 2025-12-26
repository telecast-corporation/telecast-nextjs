import { SpotifyClient } from '@/lib/spotify';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  try {
    const spotifyClient = new SpotifyClient();
    const audiobooks = await spotifyClient.searchAudiobooks(title);

    if (audiobooks.length > 0 && audiobooks[0].preview_url) {
      return NextResponse.json({ previewUrl: audiobooks[0].preview_url });
    } else {
      return NextResponse.json({ previewUrl: null });
    }
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return NextResponse.json({ error: 'Failed to search Spotify' }, { status: 500 });
  }
}
