import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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
    if (episode.podcast.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Determine which platforms to broadcast to
    let platformsToBroadcast: string[] = [];

    if (useRememberedPlatforms) {
      // Get user's previously connected platforms
      const accounts = await prisma.account.findMany({
        where: {
          userId: session.user.id,
          provider: {
            in: ['spotify', 'apple', 'google_podcast'],
          },
        },
      });

      platformsToBroadcast = accounts.map(account => {
        switch (account.provider) {
          case 'spotify':
            return 'spotify';
          case 'apple':
            return 'apple';
          case 'google_podcast':
            return 'google';
          default:
            return '';
        }
      }).filter(Boolean);
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
      const accessToken = await getValidAccessToken(session.user.id, platform);

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
          publishDate: episode.publishDate.toISOString().split('T')[0],
          keywords: episode.keywords,
        };

        switch (platform) {
          case 'spotify':
            const spotifyApi = new SpotifyPodcastAPI(accessToken);
            const spotifyMetadata: SpotifyMetadata = {
              episodeTitle: metadata.episodeTitle,
              episodeDescription: metadata.episodeDescription,
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
              episodeTitle: metadata.episodeTitle,
              episodeDescription: metadata.episodeDescription,
              episodeNumber: metadata.episodeNumber || undefined,
              seasonNumber: metadata.seasonNumber || undefined,
              explicit: metadata.explicit,
              publishDate: metadata.publishDate,
              keywords: metadata.keywords || [],
            };
            results.apple = await appleApi.createEpisode('', appleMetadata, episode.audioUrl);
            break;

          case 'google':
            const googleApi = new GooglePodcastAPI(accessToken);
            const googleMetadata: GoogleMetadata = {
              email: session.user.email || '',
              episodeTitle: metadata.episodeTitle,
              episodeDescription: metadata.episodeDescription,
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