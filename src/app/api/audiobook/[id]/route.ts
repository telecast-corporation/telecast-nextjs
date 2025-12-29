import { NextRequest, NextResponse } from 'next/server';
import { SpotifyClient } from '@/lib/spotify';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: audiobookId } = params;

  if (!audiobookId) {
    return NextResponse.json(
      { error: 'Audiobook ID is required' },
      { status: 400 }
    );
  }

  try {
    const spotifyClient = new SpotifyClient();
    const audiobook = await spotifyClient.getAudiobookById(audiobookId);

    if (!audiobook) {
      return NextResponse.json(
        { error: 'Audiobook not found' },
        { status: 404 }
      );
    }

    const formattedResponse = {
      id: audiobook.id,
      title: audiobook.name,
      author: audiobook.authors.map(a => a.name).join(', '),
      description: audiobook.description,
      thumbnail: audiobook.images[0]?.url,
      url: audiobook.preview_url || '', // Use preview_url for audio playback
      duration: '', // Spotify API doesn't provide this for audiobooks
      narrator: audiobook.narrators.map(n => n.name).join(', '),
      rating: 0, // Spotify API doesn't provide this
      source: 'spotify',
      sourceUrl: audiobook.external_urls.spotify,
    };

    return NextResponse.json(formattedResponse);

  } catch (error: any) {
    console.error('Error fetching audiobook details from Spotify:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audiobook details' },
      { status: 500 }
    );
  }
}
