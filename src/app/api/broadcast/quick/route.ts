import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth0-user';
// authOptions removed - using Auth0
import { prisma } from '@/lib/prisma';
import { 
  SpotifyPodcastAPI, 
  ApplePodcastAPI, 
  GooglePodcastAPI,
  SpotifyMetadata,
  AppleMetadata,
  GoogleMetadata,
  getValidAccessToken
} from '@/lib/podcast-platforms';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request as any);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      episodeId,
      useRememberedPlatforms = true,
      customPlatforms = [],
    } = body;

    if (!episodeId) {
      return NextResponse.json(
        { error: 'Episode ID is required' },
        { status: 400 }
      );
    }

    // Get the episode data
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: { podcast: true },
    });

    if (!episode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    // Verify user owns the episode
    if (episode.podcast.userId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if episode has audio URL
    if (!episode.audioUrl) {
      return NextResponse.json(
        { error: 'Episode audio URL is missing' },
        { status: 400 }
      );
    }

    // Determine which platforms to broadcast to
    let platformsToBroadcast: string[] = [];

    if (useRememberedPlatforms) {
      // Get user's previously connected platforms
      const connections = await prisma.platformConnection.findMany({
        where: {
          userId: user.id,
          platform: {
            in: ['spotify', 'apple', 'google'],
          },
        },
      });

      platformsToBroadcast = connections.map(connection => connection.platform);
    }

    // Add any custom platforms specified
    if (customPlatforms.length > 0) {
      platformsToBroadcast = [...new Set([...platformsToBroadcast, ...customPlatforms])];
    }

    if (platformsToBroadcast.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No platforms selected for broadcasting',
        results: {},
      });
    }

    type Platform = 'spotify' | 'apple' | 'google';
    type BroadcastResult = {
      success: boolean;
      error?: string;
      data?: any;
    } | null;

    const results: Record<Platform, BroadcastResult> = {
      spotify: null,
      apple: null,
      google: null,
    };

    // Broadcast to each platform
    for (const platform of platformsToBroadcast as Platform[]) {
      // Get valid access token (with automatic refresh if needed)
      const accessToken = await getValidAccessToken(user.id, platform);

      if (!accessToken) {
        results[platform] = {
          success: false,
          error: 'Platform not connected or token expired',
        };
        continue;
      }

      try {
        const metadata = {
          episodeTitle: episode.title,
          episodeDescription: episode.description,
          episodeNumber: episode.episodeNumber,
          seasonNumber: episode.seasonNumber,
          explicit: episode.explicit,
          publishDate: episode.publishedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          keywords: episode.keywords,
        };

        switch (platform) {
          case 'spotify':
            const spotifyApi = new SpotifyPodcastAPI(accessToken);
            const spotifyMetadata: SpotifyMetadata = {
              episodeTitle: metadata.episodeTitle || '',
              episodeDescription: metadata.episodeDescription || '',
              episodeNumber: metadata.episodeNumber || undefined,
              seasonNumber: metadata.seasonNumber || undefined,
              explicit: metadata.explicit,
              publishDate: metadata.publishDate,
              keywords: metadata.keywords || [],
            };
            results.spotify = await spotifyApi.createEpisode('', spotifyMetadata, episode.audioUrl);
            break;

          case 'apple':
            const appleApi = new ApplePodcastAPI(accessToken);
            const appleMetadata: AppleMetadata = {
              episodeTitle: metadata.episodeTitle || '',
              episodeDescription: metadata.episodeDescription || '',
              episodeNumber: metadata.episodeNumber || undefined,
              seasonNumber: metadata.seasonNumber || undefined,
              explicit: metadata.explicit,
              publishDate: metadata.publishDate,
              keywords: metadata.keywords || [],
              subtitle: body.metadata?.apple?.subtitle,
              summary: body.metadata?.apple?.summary,
              itunesCategory: body.metadata?.apple?.itunesCategory,
            };
            results.apple = await appleApi.createEpisode('', appleMetadata, episode.audioUrl);
            break;

          case 'google':
            const googleApi = new GooglePodcastAPI(accessToken);
            const googleMetadata: GoogleMetadata = {
              email: body.metadata?.google?.email || user.email || '',
              episodeTitle: metadata.episodeTitle || '',
              episodeDescription: metadata.episodeDescription || '',
              episodeNumber: metadata.episodeNumber || undefined,
              seasonNumber: metadata.seasonNumber || undefined,
              explicit: metadata.explicit,
              publishDate: metadata.publishDate,
              keywords: metadata.keywords || [],
            };
            results.google = await googleApi.uploadToYouTube(googleMetadata, episode.audioUrl);
            break;
        }
      } catch (error) {
        console.error(`Error broadcasting to ${platform}:`, error);
        results[platform as Platform] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Quick broadcast completed',
      platformsUsed: platformsToBroadcast,
    });
  } catch (error) {
    console.error('Quick broadcast error:', error);
    return NextResponse.json(
      { error: 'Failed to perform quick broadcast' },
      { status: 500 }
    );
  }
} 