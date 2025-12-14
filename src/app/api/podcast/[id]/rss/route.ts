import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get podcast with episodes
    const podcast = await prisma.podcast.findUnique({
      where: { id },
      include: { 
        episodes: {
          where: { isPublished: true },
          orderBy: { publishedAt: 'desc' }
        },
        user: true
      }
    });

    if (!podcast) {
      return new NextResponse('Podcast not found', { status: 404 });
    }

    // Generate RSS feed
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.telecast.ca';
    const rssUrl = `${baseUrl}/api/podcast/${id}/rss`;
    
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${podcast.title}]]></title>
    <description><![CDATA[${podcast.description || ''}]]></description>
    <link>${baseUrl}/podcast/${id}</link>
    <language>${podcast.language}</language>
    <copyright>${podcast.copyright || `© ${new Date().getFullYear()} ${podcast.author}`}</copyright>
    <managingEditor>${podcast.user.email || 'admin@telecast.ca'} (${podcast.author})</managingEditor>
    <webMaster>admin@telecast.ca (Telecast)</webMaster>
    <pubDate>${podcast.createdAt.toUTCString()}</pubDate>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Telecast Podcast Platform</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    
    <image>
      <url>${podcast.coverImage || `${baseUrl}/telecast-logo.svg`}</url>
      <title><![CDATA[${podcast.title}]]></title>
      <link>${baseUrl}/podcast/${id}</link>
      <width>144</width>
      <height>144</height>
    </image>
    
    <itunes:owner>
      <itunes:name>${podcast.author}</itunes:name>
      <itunes:email>${podcast.user.email || 'admin@telecast.ca'}</itunes:email>
    </itunes:owner>
    
    <itunes:author>${podcast.author}</itunes:author>
    <itunes:summary><![CDATA[${podcast.description || ''}]]></itunes:summary>
    <itunes:category text="${podcast.category}"></itunes:category>
    <itunes:explicit>${podcast.explicit ? 'yes' : 'no'}</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    
    ${podcast.website ? `<itunes:new-feed-url>${podcast.website}</itunes:new-feed-url>` : ''}
    
    ${podcast.episodes.map(episode => `
    <item>
      <title><![CDATA[${episode.title || 'Untitled Episode'}]]></title>
      <description><![CDATA[${episode.description || ''}]]></description>
      <link>${baseUrl}/podcast/${id}/episode/${episode.id}</link>
      <guid isPermaLink="false">${episode.id}</guid>
      <pubDate>${episode.publishedAt ? episode.publishedAt.toUTCString() : episode.createdAt.toUTCString()}</pubDate>
      <enclosure url="${episode.audioUrl}" type="audio/mpeg" length="${episode.fileSize || 0}" />
      
      <itunes:title><![CDATA[${episode.title || 'Untitled Episode'}]]></title>
      <itunes:summary><![CDATA[${episode.description || ''}]]></itunes:summary>
      <itunes:explicit>${episode.explicit ? 'yes' : 'no'}</itunes:explicit>
      <itunes:duration>${episode.duration || 0}</itunes:duration>
      ${episode.episodeNumber ? `<itunes:episode>${episode.episodeNumber}</itunes:episode>` : ''}
      ${episode.seasonNumber ? `<itunes:season>${episode.seasonNumber}</itunes:season>` : ''}
      ${episode.keywords.length > 0 ? `<itunes:keywords>${episode.keywords.join(',')}</itunes:keywords>` : ''}
    </item>
    `).join('')}
    
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
