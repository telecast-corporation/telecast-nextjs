import { searchAudiobooks } from '../src/lib/audiobook-search';

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


async function fetchSpotifyAudiobooks() {
  console.log('Starting script: Fetching popular audiobooks from Spotify...');

  // Ensure Spotify credentials are set
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error('Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in the environment.');
    process.exit(1);
  }

  try {
    // 1. Fetch popular audiobooks from Spotify
    console.log('Fetching popular audiobooks from Spotify...');
    const spotifyAudiobooks: any[] = await searchAudiobooks('popular', 50);

    if (spotifyAudiobooks.length === 0) {
      console.log('No popular audiobooks found on Spotify.');
      return;
    }
    console.log(`Found ${spotifyAudiobooks.length} popular audiobooks on Spotify.`);

    const enrichedBooks = spotifyAudiobooks.map((book: any) => ({
        source: 'spotify',
        id: book.id, // Spotify ID
        type: 'audiobook',
        title: book.name,
        author: book.authors.map((a: any) => a.name).join(', '),
        description: book.description,
        thumbnail: book.images?.[0]?.url,
        url: book.external_urls.spotify,
        duration: msToTime(book.duration_ms),
        narrator: book.narrators.map((n: any) => n.name).join(', '),
        rating: null, // Spotify API doesn't provide ratings for audiobooks
        spotify_preview_url: book.preview_url,
    }));

    // 4. Print the final result
    console.log('\n--- Enriched Spotify Audiobook Data ---');
    console.log(JSON.stringify(enrichedBooks, null, 2));
    console.log('--- Script Finished ---');

  } catch (error) {
    console.error('\n--- An error occurred during the script execution ---');
    if (error instanceof Error) {
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
    } else {
        console.error('Unknown Error:', error);
    }
    process.exit(1);
  }
}

fetchSpotifyAudiobooks();
