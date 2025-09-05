import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFileReadSignedUrl } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const podcast = await prisma.podcast.findUnique({
      where: { id },
      include: {
        episodes: {
          orderBy: { publishedAt: 'desc' },
          where: { 
            isPublished: true
          },
        },
      },
    });

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    console.log('RSS Generation - Podcast:', podcast.title);
    console.log('RSS Generation - Episodes found:', podcast.episodes.length);
    console.log('RSS Generation - Episodes:', podcast.episodes.map(ep => ({
      id: ep.id,
      title: ep.title,
      isPublished: ep.isPublished,
      publishedAt: ep.publishedAt
    })));

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://telecast.ca';
    const atomSelfHref = `${siteUrl}/api/podcast/internal/${encodeURIComponent(podcast.id)}/rss`;

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

    // Generate universal RSS feed that works across all platforms
    const rssContent = generateUniversalRSS(podcast, atomSelfHref, episodesWithSignedUrls);

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

function generateUniversalRSS(podcast: any, selfHref: string, episodesWithSignedUrls: any[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:googleplay="http://www.google.com/schemas/play-podcasts/1.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:rawvoice="http://www.rawvoice.com/rawvoiceRssModule/" xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <googleplay:author>${escapeXml(podcast.author)}</googleplay:author>
    <rawvoice:rating>TV-G</rawvoice:rating>
    <rawvoice:location>Global</rawvoice:location>
    <rawvoice:frequency>Weekly</rawvoice:frequency>
    <author>${escapeXml(podcast.author)}</author>
    <itunes:author>${escapeXml(podcast.author)}</itunes:author>
    <itunes:category text="${escapeXml(podcast.category)}" />
    ${podcast.coverImage ? `
    <image>
      <url>${podcast.coverImage}</url>
      <title>${escapeXml(podcast.title)}</title>
      <link>${process.env.NEXT_PUBLIC_BASE_URL}/podcast/${podcast.id}</link>
    </image>
    <googleplay:image href="${podcast.coverImage}" />
    <itunes:image href="${podcast.coverImage}" />` : ''}
    <itunes:owner>
      <itunes:name>${escapeXml(podcast.author)}</itunes:name>
    </itunes:owner>
    ${podcast.tags && podcast.tags.length > 0 ? `<itunes:keywords>${podcast.tags.join(',')}</itunes:keywords>` : ''}
    ${podcast.copyright ? `<copyright>${escapeXml(podcast.copyright)}</copyright>` : ''}
    <description>${escapeXml(podcast.description || '')}</description>
    <language>${podcast.language || 'en-us'}</language>
    <itunes:explicit>${podcast.explicit ? 'yes' : 'no'}</itunes:explicit>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <link>${selfHref}</link>
    <atom:link href="${selfHref}" rel="self" type="application/rss+xml"/>
    ${episodesWithSignedUrls.map((episode: any) => `
    <item>
      <author>${escapeXml(podcast.author)}</author>
      <itunes:author>${escapeXml(podcast.author)}</itunes:author>
      <title>${escapeXml(episode.title)}</title>
      <pubDate>${(episode.publishedAt || episode.createdAt).toUTCString()}</pubDate>
      <enclosure url="${episode.signedAudioUrl}" type="audio/mpeg" length="${episode.fileSize || 0}" />
      ${episode.duration ? `<itunes:duration>${Math.floor(episode.duration / 60)}:${String(episode.duration % 60).padStart(2, '0')}</itunes:duration>` : ''}
      <guid isPermaLink="false">${episode.id}</guid>
      <itunes:explicit>${episode.explicit ? 'yes' : 'no'}</itunes:explicit>
      <description>
${escapeXml(episode.description || '')}
      </description>
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