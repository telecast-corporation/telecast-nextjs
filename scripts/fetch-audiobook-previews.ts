
import { searchAudible } from '../src/lib/audible-search';
import { SpotifyClient } from '../src/lib/spotify';

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


async function fetchAndEnrichAudiobooks() {
  console.log('Starting script: Fetching popular audiobooks from Audible and enriching with Spotify data...');

  // Ensure Spotify credentials are set
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error('Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in the environment.');
    process.exit(1);
  }

  const spotify = new SpotifyClient();

  try {
    // 1. Fetch popular audiobooks from Audible
    console.log('Fetching popular audiobooks from Audible...');
    const audibleBooks = await searchAudible('popular');
    if (audibleBooks.length === 0) {
      console.log('No popular audiobooks found on Audible.');
      return;
    }
    console.log(`Found ${audibleBooks.length} popular audiobooks on Audible.`);

    const enrichedBooks = [];
    console.log('Enriching with Spotify details and preview URLs...');

    // 2. For each Audible book, search on Spotify
    for (const audibleBook of audibleBooks) {
      console.log(`Searching Spotify for: "${audibleBook.title}" by ${audibleBook.author}`);
      
      const searchQuery = `${audibleBook.title} ${audibleBook.author}`;
      const spotifyResults = await spotify.searchAudiobooks(searchQuery);

      let finalBookData;

      if (spotifyResults && spotifyResults.length > 0) {
        // Find the best match (e.g., by checking author)
        const bestMatch = spotifyResults.find(spotifyBook => 
          spotifyBook.authors.some(author => audibleBook.author.includes(author.name))
        );
        
        const targetBook = bestMatch || spotifyResults[0]; // Fallback to the first result

        console.log(`  -> Found Spotify match: "${targetBook.name}". Using it as the primary source.`);

        // 3.A. Use Spotify data as the primary source when available
        finalBookData = {
          source: 'spotify+audible',
          id: targetBook.id, // Spotify ID
          type: 'audiobook',
          title: targetBook.name,
          author: targetBook.authors.map(a => a.name).join(', '),
          description: targetBook.description,
          thumbnail: targetBook.images?.[0]?.url || audibleBook.thumbnail,
          url: targetBook.external_urls.spotify,
          duration: msToTime(targetBook.duration_ms),
          narrator: targetBook.narrators.map(n => n.name).join(', ') || audibleBook.narrator,
          rating: audibleBook.rating, // Keep Audible's rating, as Spotify doesn't provide it
          audible_url: audibleBook.url, // Keep a reference to the Audible URL
          spotify_preview_url: targetBook.preview_url,
        };
        
      } else {
        console.log('  -> No match found on Spotify. Using Audible data only.');
        // 3.B. Fallback to Audible data if no Spotify match is found
        finalBookData = {
          ...audibleBook,
          spotify_preview_url: null,
        };
      }

      enrichedBooks.push(finalBookData);
    }

    // 4. Print the final result
    console.log('\n--- Enriched Audiobook Data ---');
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

fetchAndEnrichAudiobooks();
