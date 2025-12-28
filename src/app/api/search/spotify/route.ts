import { NextRequest, NextResponse } from 'next/server';
import { SpotifyClient } from '@/lib/spotify';

export async function GET(req: NextRequest) {
  const searchTerm = req.nextUrl.searchParams.get('term');
  const itemType = req.nextUrl.searchParams.get('type') as 'show' | 'audiobook' | null;

  if (!searchTerm) {
    return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
  }

  try {
    const spotifyClient = new SpotifyClient();
    const results = await spotifyClient.searchShows(searchTerm, 20, itemType || 'show');
    return NextResponse.json(results);
  } catch (error) {
    const searchKind = itemType === 'audiobook' ? 'audiobooks' : 'podcasts';
    console.error(`Error searching Spotify ${searchKind}:`, error);
    return NextResponse.json(
      { error: `Error searching Spotify ${searchKind}` },
      { status: 500 }
    );
  }
}
