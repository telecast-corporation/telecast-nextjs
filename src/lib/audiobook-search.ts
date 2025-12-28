
import { SpotifyClient, SpotifyAudiobook } from './spotify';

const spotifyClient = new SpotifyClient();

async function searchAudiobooks(query: string, maxResults: number = 20): Promise<SpotifyAudiobook[]> {
  return spotifyClient.searchAudiobooks(query, maxResults);
}

export { searchAudiobooks, SpotifyAudiobook };
