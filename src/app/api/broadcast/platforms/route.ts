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
      platforms,
      metadata,
    } = body;

    if (!episodeId || !platforms || !metadata) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Broadcast to each selected platform
    for (const platform of platforms as Platform[]) {
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
        switch (platform) {
          case 'spotify':
            const spotifyApi = new SpotifyPodcastAPI(accessToken);
            const spotifyMetadata: SpotifyMetadata = {
              episodeTitle: metadata.episodeTitle,
              episodeDescription: metadata.episodeDescription,
              episodeNumber: metadata.episodeNumber ? parseInt(metadata.episodeNumber) : undefined,
              seasonNumber: metadata.seasonNumber ? parseInt(metadata.seasonNumber) : undefined,
              explicit: metadata.explicit,
              publishDate: metadata.publishDate,
              keywords: metadata.keywords ? metadata.keywords.split(',').map((k: string) => k.trim()) : [],
            };
            results.spotify = await spotifyApi.createEpisode('', spotifyMetadata, episode.audioUrl);
            break;

          case 'apple':
            const appleApi = new ApplePodcastAPI(accessToken);
            const appleMetadata: AppleMetadata = {
              episodeTitle: metadata.episodeTitle,
              episodeDescription: metadata.episodeDescription,
              episodeNumber: metadata.episodeNumber ? parseInt(metadata.episodeNumber) : undefined,
              seasonNumber: metadata.seasonNumber ? parseInt(metadata.seasonNumber) : undefined,
              explicit: metadata.explicit,
              publishDate: metadata.publishDate,
              keywords: metadata.keywords ? metadata.keywords.split(',').map((k: string) => k.trim()) : [],
              subtitle: metadata.apple?.subtitle,
              summary: metadata.apple?.summary,
              itunesCategory: metadata.apple?.itunesCategory,
            };
            results.apple = await appleApi.createEpisode('', appleMetadata, episode.audioUrl);
            break;

          case 'google':
            const googleApi = new GooglePodcastAPI(accessToken);
            const googleMetadata: GoogleMetadata = {
              email: metadata.google?.email || session.user.email || '',
              episodeTitle: metadata.episodeTitle,
              episodeDescription: metadata.episodeDescription,
              episodeNumber: metadata.episodeNumber ? parseInt(metadata.episodeNumber) : undefined,
              seasonNumber: metadata.seasonNumber ? parseInt(metadata.seasonNumber) : undefined,
              explicit: metadata.explicit,
              publishDate: metadata.publishDate,
              keywords: metadata.keywords ? metadata.keywords.split(',').map((k: string) => k.trim()) : [],
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

    // Update episode with broadcast results
    await prisma.episode.update({
      where: { id: episodeId },
      data: {
        // You might want to store broadcast results in a separate table
        // For now, we'll just mark it as published
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      results,
      message: 'Broadcast completed',
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast episode' },
      { status: 500 }
    );
  }
} 