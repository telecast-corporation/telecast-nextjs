import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFileReadSignedUrl } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; platform: string }> }
) {
  try {
    const { id, platform } = await params;
    const normalizedPlatform = platform.toLowerCase();

    const podcast = await prisma.podcast.findUnique({
      where: { id },
      include: {
        episodes: {
          orderBy: { publishedAt: 'desc' },
          where: { publishedAt: { not: null } },
        },
      },
    });

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://telecast.ca';
    const atomSelfHref = `${siteUrl}/api/podcast/internal/${encodeURIComponent(podcast.id)}/rss/${normalizedPlatform}`;

    // Generate fresh signed URLs for all episodes (valid for 24 hours for RSS feeds)
    const episodesWithSignedUrls = await Promise.all(
      podcast.episodes.map(async (episode: any) => {
        const signedUrl = await getFileReadSignedUrl(episode.audioUrl, 24 * 60 * 60 * 1000);
        return {
          ...episode,
          signedAudioUrl: signedUrl
        };
      })
    );

    // Generate RSS feed based on platform
    let rssContent = '';
    
    if (normalizedPlatform === 'spotify') {
      rssContent = generateSpotifyRSS(podcast, atomSelfHref, episodesWithSignedUrls);
    } else if (normalizedPlatform === 'apple') {
      rssContent = generateAppleRSS(podcast, atomSelfHref, episodesWithSignedUrls);
    } else if (normalizedPlatform === 'google') {
      rssContent = generateGoogleRSS(podcast, atomSelfHref, episodesWithSignedUrls);
    } else {
      rssContent = generateGenericRSS(podcast, atomSelfHref, episodesWithSignedUrls);
    }

    return new NextResponse(rssContent, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('RSS generation error:', error);
    return NextResponse.json({ error: 'Failed to generate RSS feed' }, { status: 500 });
  }
}

function generateSpotifyRSS(podcast: any, selfHref: string, episodesWithSignedUrls: any[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <description>${escapeXml(podcast.description || '')}</description>
    <link>${process.env.NEXT_PUBLIC_BASE_URL}/podcast/${podcast.id}</link>
    <atom:link href="${selfHref}" rel="self" type="application/rss+xml"/>
    <language>${podcast.language || 'en'}</language>
    <itunes:author>${escapeXml(podcast.author)}</itunes:author>
    <itunes:category text="${podcast.category}"/>
    <itunes:explicit>${podcast.explicit ? 'yes' : 'no'}</itunes:explicit>
    ${podcast.coverImage ? `<itunes:image href="${podcast.coverImage}"/>` : ''}
    ${episodesWithSignedUrls.map((episode: any) => `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <description>${escapeXml(episode.description || '')}</description>
      <link>${process.env.NEXT_PUBLIC_BASE_URL}/podcast/${podcast.id}/episode/${episode.id}</link>
      <guid>${episode.id}</guid>
      <pubDate>${episode.publishedAt.toUTCString()}</pubDate>
      <enclosure url="${episode.signedAudioUrl}" type="audio/mpeg" length="0"/>
      <itunes:duration>${episode.duration || 0}</itunes:duration>
      <itunes:explicit>${episode.explicit ? 'yes' : 'no'}</itunes:explicit>
    </item>`).join('')}
  </channel>
</rss>`;
}

function generateAppleRSS(podcast: any, selfHref: string, episodesWithSignedUrls: any[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <description>${escapeXml(podcast.description || '')}</description>
    <link>${process.env.NEXT_PUBLIC_BASE_URL}/podcast/${podcast.id}</link>
    <language>${podcast.language || 'en'}</language>
    <itunes:author>${escapeXml(podcast.author)}</itunes:author>
    <itunes:category text="${podcast.category}"/>
    <itunes:explicit>${podcast.explicit ? 'yes' : 'no'}</itunes:explicit>
    ${podcast.coverImage ? `<itunes:image href="${podcast.coverImage}"/>` : ''}
    ${episodesWithSignedUrls.map((episode: any) => `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <description>${escapeXml(episode.description || '')}</description>
      <link>${process.env.NEXT_PUBLIC_BASE_URL}/podcast/${podcast.id}/episode/${episode.id}</link>
      <guid>${episode.id}</guid>
      <pubDate>${episode.publishedAt.toUTCString()}</pubDate>
      <enclosure url="${episode.signedAudioUrl}" type="audio/mpeg" length="0"/>
      <itunes:duration>${episode.duration || 0}</itunes:duration>
      <itunes:explicit>${episode.explicit ? 'yes' : 'no'}</itunes:explicit>
    </item>`).join('')}
  </channel>
</rss>`;
}

function generateGoogleRSS(podcast: any, selfHref: string, episodesWithSignedUrls: any[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <description>${escapeXml(podcast.description || '')}</description>
    <link>${process.env.NEXT_PUBLIC_BASE_URL}/podcast/${podcast.id}</link>
    <language>${podcast.language || 'en'}</language>
    <author>${escapeXml(podcast.author)}</author>
    <category>${podcast.category}</category>
    ${episodesWithSignedUrls.map((episode: any) => `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <description>${escapeXml(episode.description || '')}</description>
      <link>${process.env.NEXT_PUBLIC_BASE_URL}/podcast/${podcast.id}/episode/${episode.id}</link>
      <guid>${episode.id}</guid>
      <pubDate>${episode.publishedAt.toUTCString()}</pubDate>
      <enclosure url="${episode.signedAudioUrl}" type="audio/mpeg" length="0"/>
    </item>`).join('')}
  </channel>
</rss>`;
}

function generateGenericRSS(podcast: any, selfHref: string, episodesWithSignedUrls: any[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <description>${escapeXml(podcast.description || '')}</description>
    <link>${process.env.NEXT_PUBLIC_BASE_URL}/podcast/${podcast.id}</link>
    <language>${podcast.language || 'en'}</language>
    <author>${escapeXml(podcast.author)}</author>
    <category>${podcast.category}</category>
    ${episodesWithSignedUrls.map((episode: any) => `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <description>${escapeXml(episode.description || '')}</description>
      <link>${process.env.NEXT_PUBLIC_BASE_URL}/podcast/${podcast.id}/episode/${episode.id}</link>
      <guid>${episode.id}</guid>
      <pubDate>${episode.publishedAt.toUTCString()}</pubDate>
      <enclosure url="${episode.signedAudioUrl}" type="audio/mpeg" length="0"/>
    </item>`).join('')}
  </channel>
</rss>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
} 