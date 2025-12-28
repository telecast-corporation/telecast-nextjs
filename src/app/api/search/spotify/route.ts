import { NextRequest, NextResponse } from 'next/server';
import { SpotifyClient } from '@/lib/spotify';

export async function GET(req: NextRequest) {
  const searchTerm = req.nextUrl.searchParams.get('term');

  if (!searchTerm) {
    return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
  }

  try {
    const spotifyClient = new SpotifyClient();
    const results = await spotifyClient.searchShows(searchTerm);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching Spotify podcasts:', error);
    return NextResponse.json(
      { error: 'Error searching Spotify podcasts' },
      { status: 500 }
    );
  }
}
