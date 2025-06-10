import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const PODCASTINDEX_API_KEY = process.env.PODCASTINDEX_API_KEY;
    const PODCASTINDEX_API_SECRET = process.env.PODCASTINDEX_API_SECRET;

    if (!PODCASTINDEX_API_KEY || !PODCASTINDEX_API_SECRET) {
      throw new Error('Missing Podcast Index API credentials');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const hash = require('crypto')
      .createHash('sha1')
      .update(PODCASTINDEX_API_KEY + PODCASTINDEX_API_SECRET + timestamp)
      .digest('hex');

    const response = await axios.get('https://api.podcastindex.org/api/1.0/recent/feeds', {
      params: { max: 20, lang: 'en' },
      headers: {
        'User-Agent': 'Telecast/1.0',
        'X-Auth-Key': PODCASTINDEX_API_KEY,
        'X-Auth-Date': timestamp.toString(),
        'Authorization': hash,
      },
    });

    const recommendations = response.data.feeds.map((feed: any) => ({
      id: feed.id,
      title: feed.title,
      author: feed.author || 'Unknown Author',
      description: feed.description || 'No description available',
      image: feed.artwork || feed.image || 'https://via.placeholder.com/150',
      url: feed.url,
      categories: feed.categories ? Object.values(feed.categories).map(String) : [],
      language: feed.language,
      explicit: feed.explicit,
      episodeCount: feed.episodeCount,
      lastUpdateTime: feed.lastUpdateTime,
    }));

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching podcast recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch podcast recommendations' },
      { status: 500 }
    );
  }
} 