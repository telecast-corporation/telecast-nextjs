import axios from 'axios';

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com/api/token';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export interface SpotifyPodcast {
  id: string;
  name: string;
  publisher: string;
  description: string;
  images: { url: string }[];
  external_urls: { spotify: string };
  explicit: boolean;
  episodes: { items: SpotifyEpisode[] };
}

export interface SpotifyEpisode {
    id: string;
    name: string;
    description: string;
    audio_preview_url: string;
    duration_ms: number;
    release_date: string;
    images: { url: string }[];
    external_urls: { spotify: string };
}

export interface SpotifyAudiobook {
  id: string;
  name: string;
  authors: { name: string }[];
  narrators: { name: string }[];
  publisher: string;
  description: string;
  html_description: string;
  total_chapters: number;
  duration_ms: number;
  images: { url: string }[];
  external_urls: { spotify: string };
  explicit: boolean;
  preview_url: string;
}

export class SpotifyClient {
  private accessToken: string | null = null;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      throw new Error('Missing Spotify API credentials');
    }

    const response = await axios.post(
      SPOTIFY_ACCOUNTS_URL,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    );

    this.accessToken = response.data.access_token;
    return this.accessToken!;
  }

  private async getAuthHeaders() {
    const token = await this.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async searchShows(query: string, limit: number = 20, itemType: 'show' | 'audiobook' = 'show'): Promise<any[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
        params: {
          q: query,
          type: itemType,
          market: 'US',
          limit: limit,
        },
        headers,
      });

      const data = response.data;

      if (itemType === 'show' && data.shows && data.shows.items) {
        return data.shows.items;
      } else if (itemType === 'audiobook' && data.audiobooks && data.audiobooks.items) {
        return data.audiobooks.items;
      }

      return [];
    } catch (error) {
      console.error(`Error searching Spotify ${itemType}s:`, error);
      this.accessToken = null; // Reset token on error
      throw error;
    }
  }
  
  async getPodcastById(id: string): Promise<SpotifyPodcast | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${SPOTIFY_API_URL}/shows/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching Spotify podcast with id ${id}:`, error);
      this.accessToken = null; // Reset token on error
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getAudiobookById(id: string): Promise<SpotifyAudiobook | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${SPOTIFY_API_URL}/audiobooks/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching Spotify audiobook with id ${id}:`, error);
      this.accessToken = null;
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
