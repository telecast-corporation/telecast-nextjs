
import { NextRequest, NextResponse } from 'next/server';
import { getAudibleBookDetails } from '@/lib/audible-search';
import { SpotifyClient } from '@/lib/spotify';

// Helper function to convert milliseconds to a more readable format
function msToTime(duration: number): string {
  if (!duration) return 'Unknown duration';
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  if (hours > 0) {
    return `${hours}hr ${minutes}min`;
  }
  return `${minutes}min`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  const { id: audibleId } = await params;

  if (!audibleId) {
    return NextResponse.json(
      { error: 'Audiobook ID is required' },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch initial details from Audible to get title/author for searching
    const audibleBook = await getAudibleBookDetails(audibleId);

    if (!audibleBook) {
      return NextResponse.json(
        { error: 'Audiobook not found on Audible' },
        { status: 404 }
      );
    }

    // 2. Try to enrich with Spotify data
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

    if (SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET) {
      const spotify = new SpotifyClient();
      const searchQuery = `${audibleBook.title} ${audibleBook.author}`;
      const spotifyResults = await spotify.searchAudiobooks(searchQuery);

      if (spotifyResults && spotifyResults.length > 0) {
        const bestMatch = spotifyResults.find(spotifyBook =>
          spotifyBook.authors.some(author => audibleBook.author.includes(author.name))
        );
        const targetBook = bestMatch || spotifyResults[0];

        // Return combined data, prioritizing Spotify
        return NextResponse.json({
          source: 'spotify+audible',
          id: targetBook.id, // Spotify ID
          type: 'audiobook',
          title: targetBook.name,
          author: targetBook.authors.map(a => a.name).join(', '),
          description: targetBook.html_description,
          thumbnail: targetBook.images?.[0]?.url || audibleBook.thumbnail,
          url: audibleBook.url, // Keep the original audible path for fallback playback
          duration: msToTime(targetBook.duration_ms),
          narrator: targetBook.narrators.map(n => n.name).join(', ') || audibleBook.narrator,
          rating: audibleBook.rating,
          sourceUrl: targetBook.external_urls.spotify, // The external spotify URL
          spotify_preview_url: targetBook.preview_url,
        });
      }
    }

    // 3. Fallback to Audible-only data if Spotify enrichment fails
    return NextResponse.json({
      ...audibleBook,
      spotify_preview_url: null,
    });

  } catch (error: any) {
    console.error('Error in audiobook detail endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audiobook details' },
      { status: 500 }
    );
  }
}
