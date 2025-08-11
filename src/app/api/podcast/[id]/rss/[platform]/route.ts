import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRfc2822(date: Date | null | undefined): string {
  if (!date) return new Date().toUTCString();
  return new Date(date).toUTCString();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; platform: string }> }
) {
  try {
    const { id, platform } = await params;

    const normalizedPlatform = (platform || '').toLowerCase();
    const supported = ['apple', 'spotify', 'podcastindex'];
    if (!supported.includes(normalizedPlatform)) {
      return new NextResponse('Unsupported platform', { status: 400 });
    }

    const podcast = await prisma.podcast.findUnique({
      where: { id },
      include: {
        episodes: {
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        },
        user: true,
      },
    });

    if (!podcast || !podcast.published) {
      return new NextResponse('Podcast not found or not published', { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://telecast.ca';

    const itunesNs = 'xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"';
    const atomNs = 'xmlns:atom="http://www.w3.org/2005/Atom"';

    const channelImage = podcast.coverImage || `${siteUrl}/telecast-logo.png`;
    const channelLink = podcast.website || siteUrl;

    // Some platform-specific tweaks could be added in future
    const category = podcast.category || 'Technology';
    const explicit = podcast.explicit ? 'yes' : 'no';

    const atomSelfHref = `${siteUrl}/api/podcast/${encodeURIComponent(podcast.id)}/rss/${normalizedPlatform}`;

    const itemsXml = podcast.episodes
      .filter((e) => !!e.audioUrl)
      .map((episode) => {
        const guid = episode.id;
        const title = escapeXml(episode.title);
        const description = escapeXml(episode.description || '');
        const pubDate = formatRfc2822(episode.publishedAt || episode.createdAt);
        const enclosureUrl = episode.audioUrl as string;
        const enclosureType = 'audio/mpeg';
        const duration = episode.duration ? `<itunes:duration>${episode.duration}</itunes:duration>` : '';
        const episodeNumber = episode.episodeNumber != null ? `<itunes:episode>${episode.episodeNumber}</itunes:episode>` : '';
        const seasonNumber = episode.seasonNumber != null ? `<itunes:season>${episode.seasonNumber}</itunes:season>` : '';
        const keywords = (episode.keywords || []).length > 0 ? `<itunes:keywords>${escapeXml(episode.keywords.join(','))}</itunes:keywords>` : '';

        return `
        <item>
          <title>${title}</title>
          <description>${description}</description>
          <guid isPermaLink="false">${guid}</guid>
          <pubDate>${pubDate}</pubDate>
          <enclosure url="${escapeXml(enclosureUrl)}" type="${enclosureType}" />
          <itunes:explicit>${episode.explicit ? 'yes' : 'no'}</itunes:explicit>
          ${duration}
          ${episodeNumber}
          ${seasonNumber}
          ${keywords}
        </item>`;
      })
      .join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" ${itunesNs} ${atomNs}>
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(podcast.description || '')}</description>
    <language>${escapeXml(podcast.language || 'en')}</language>
    <atom:link href="${escapeXml(atomSelfHref)}" rel="self" type="application/rss+xml"/>
    <itunes:author>${escapeXml(podcast.author || podcast.user?.name || '')}</itunes:author>
    <itunes:explicit>${explicit}</itunes:explicit>
    <itunes:category text="${escapeXml(category)}" />
    <itunes:image href="${escapeXml(channelImage)}" />
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('RSS generation error:', error);
    return new NextResponse('Failed to generate RSS', { status: 500 });
  }
}