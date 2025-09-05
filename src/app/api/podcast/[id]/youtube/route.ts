import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0-session';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuth0User(req as any);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get podcast with episodes
    const podcast = await prisma.podcast.findUnique({
      where: { 
        id,
        userId: dbUser.id // Ensure user owns this podcast
      },
      include: { 
        episodes: {
          where: { isPublished: true },
          orderBy: { publishedAt: 'desc' }
        }
      }
    });

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    if (podcast.episodes.length === 0) {
      return NextResponse.json({ 
        error: 'No published episodes found. Please publish at least one episode before distributing to YouTube.' 
      }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.telecast.ca';
    const rssUrl = `${baseUrl}/api/podcast/${id}/rss`;

    // Return RSS feed URL and instructions for YouTube
    return NextResponse.json({
      success: true,
      rssUrl,
      instructions: {
        title: 'How to distribute your podcast to YouTube',
        steps: [
          '1. Copy the RSS feed URL below',
          '2. Go to YouTube Studio (studio.youtube.com)',
          '3. Navigate to "Content" → "Podcasts"',
          '4. Click "Add podcast" and paste your RSS feed URL',
          '5. YouTube will automatically create videos using your podcast cover art',
          '6. Your episodes will appear on YouTube and YouTube Music'
        ],
        rssFeedUrl: rssUrl,
        podcastTitle: podcast.title,
        episodeCount: podcast.episodes.length
      }
    });

  } catch (error) {
    console.error('Error setting up YouTube distribution:', error);
    return NextResponse.json(
      { error: 'Failed to setup YouTube distribution' },
      { status: 500 }
    );
  }
}
