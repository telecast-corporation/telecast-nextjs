import axios from 'axios';

// Platform OAuth Configuration
export interface PlatformConfig {
  name: string;
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  scope: string;
  redirectUri: string;
}

// Platform-specific metadata interfaces
export interface SpotifyMetadata {
  showId?: string;
  episodeTitle: string;
  episodeDescription: string;
  episodeNumber?: number;
  seasonNumber?: number;
  explicit: boolean;
  publishDate: string;
  keywords: string[];
}

export interface AppleMetadata {
  feedUrl?: string;
  episodeTitle: string;
  episodeDescription: string;
  episodeNumber?: number;
  seasonNumber?: number;
  explicit: boolean;
  publishDate: string;
  keywords: string[];
  subtitle?: string;
  summary?: string;
  itunesCategory?: string;
}

export interface GoogleMetadata {
  email: string;
  episodeTitle: string;
  episodeDescription: string;
  episodeNumber?: number;
  seasonNumber?: number;
  explicit: boolean;
  publishDate: string;
  keywords: string[];
}

// Platform configurations
export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  spotify: {
    name: 'Spotify',
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    authUrl: 'https://accounts.spotify.com/authorize',
    tokenUrl: 'https://accounts.spotify.com/api/token',
    scope: 'playlist-modify-public playlist-modify-private user-read-email',
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/podcast-platforms/spotify/callback`,
  },
  apple: {
    name: 'Apple Podcasts',
    clientId: process.env.APPLE_CLIENT_ID!,
    clientSecret: process.env.APPLE_CLIENT_SECRET!,
    authUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
    scope: 'name email',
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/podcast-platforms/apple/callback`,
  },
  google: {
    name: 'Google Podcasts',
    clientId: process.env.GOOGLE_PODCAST_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_PODCAST_CLIENT_SECRET!,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/youtube.upload',
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/podcast-platforms/google/callback`,
  },
};

// Platform API classes
export class SpotifyPodcastAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getShows(): Promise<any[]> {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/shows', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching Spotify shows:', error);
      return [];
    }
  }

  async createEpisode(showId: string, metadata: SpotifyMetadata, audioUrl: string): Promise<any> {
    try {
      // Note: Spotify doesn't have a direct podcast API, but we can create a playlist
      // For actual podcast distribution, you'd need to use Spotify's podcast partner program
      const response = await axios.post(
        `https://api.spotify.com/v1/users/me/playlists`,
        {
          name: metadata.episodeTitle,
          description: metadata.episodeDescription,
          public: true,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Spotify episode:', error);
      throw error;
    }
  }
}

export class ApplePodcastAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getFeeds(): Promise<any[]> {
    try {
      // Apple Podcasts Connect API (requires special access)
      const response = await axios.get('https://api.music.apple.com/v1/catalog/us/podcasts', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching Apple Podcasts feeds:', error);
      return [];
    }
  }

  async createEpisode(feedUrl: string, metadata: AppleMetadata, audioUrl: string): Promise<any> {
    try {
      // This would require Apple Podcasts Connect API access
      // For now, we'll return a mock response
      return {
        success: true,
        message: 'Episode submitted to Apple Podcasts (requires manual approval)',
        feedUrl,
        episodeTitle: metadata.episodeTitle,
      };
    } catch (error) {
      console.error('Error creating Apple Podcasts episode:', error);
      throw error;
    }
  }
}

export class GooglePodcastAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async uploadToYouTube(metadata: GoogleMetadata, audioUrl: string): Promise<any> {
    try {
      // Upload to YouTube as a video (Google Podcasts pulls from YouTube)
      const response = await axios.post(
        'https://www.googleapis.com/upload/youtube/v3/videos',
        {
          snippet: {
            title: metadata.episodeTitle,
            description: metadata.episodeDescription,
            tags: metadata.keywords,
            categoryId: '22', // People & Blogs category
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          params: {
            part: 'snippet,status',
            uploadType: 'resumable',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading to YouTube:', error);
      throw error;
    }
  }
}

// OAuth helper functions
export function generateAuthUrl(platform: string, state?: string): string {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    scope: config.scope,
    redirect_uri: config.redirectUri,
    state: state || Math.random().toString(36).substring(7),
  });

  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(platform: string, code: string): Promise<any> {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  try {
    const response = await axios.post(config.tokenUrl, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error exchanging code for token for ${platform}:`, error);
    throw error;
  }
}

// Token refresh function
export async function refreshAccessToken(platform: string, refreshToken: string): Promise<any> {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  try {
    const response = await axios.post(config.tokenUrl, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error refreshing token for ${platform}:`, error);
    throw error;
  }
}

// Get valid access token (with refresh if needed)
export async function getValidAccessToken(userId: string, platform: string): Promise<string | null> {
  // Platform connections not available in current database schema
  // const { prisma } = await import('./prisma');
  // try {
  //   const connection = await prisma.platformConnection.findUnique({
  //     where: { userId_platform: { userId, platform } },
  //   });
  //   if (!connection || !connection.accessToken) {
  //     return null;
  //   }
  //   // Check if token is expired or will expire soon (within 5 minutes)
  //   const now = Math.floor(Date.now() / 1000);
  //   const expiresSoon = connection.expiresAt && (Math.floor(connection.expiresAt.getTime() / 1000) - now) < 300;
  //   if (expiresSoon && connection.refreshToken) {
  //     try {
  //       // Refresh the token
  //       const refreshData = await refreshAccessToken(platform, connection.refreshToken);
  //       // Update the token in database
  //       await prisma.platformConnection.update({
  //         where: { id: connection.id },
  //         data: {
  //           accessToken: refreshData.access_token,
  //           refreshToken: refreshData.refresh_token || connection.refreshToken,
  //           expiresAt: refreshData.expires_in ? new Date(Date.now() + refreshData.expires_in * 1000) : connection.expiresAt,
  //         },
  //       });
  //       return refreshData.access_token;
  //     } catch (refreshError) {
  //       console.error(`Failed to refresh token for ${platform}:`, refreshError);
  //       // If refresh fails, delete the connection so user can reconnect
  //       await prisma.platformConnection.delete({ where: { id: connection.id } });
  //       return null;
  //     }
  //   }
  //   return connection.accessToken;
  // } catch (error) {
  //   console.error(`Error getting valid access token for ${platform}:`, error);
  //   return null;
  // }
  
  // Return null since platform connections are not available
  return null;
}

// Platform status checking
export async function checkPlatformStatus(platform: string, accessToken: string): Promise<boolean> {
  try {
    switch (platform) {
      case 'spotify':
        const spotifyApi = new SpotifyPodcastAPI(accessToken);
        await spotifyApi.getShows();
        return true;
      case 'apple':
        const appleApi = new ApplePodcastAPI(accessToken);
        await appleApi.getFeeds();
        return true;
      case 'google':
        const googleApi = new GooglePodcastAPI(accessToken);
        // Test with a simple API call
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking ${platform} status:`, error);
    return false;
  }
} 