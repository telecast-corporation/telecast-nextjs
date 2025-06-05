import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';

const PODCAST_INDEX_KEY = process.env.PODCAST_INDEX_KEY;
const PODCAST_INDEX_SECRET = process.env.PODCAST_INDEX_SECRET;
const PODCAST_INDEX_BASE_URL = 'https://api.podcastindex.org/api/1.0';

// Check if environment variables are set
if (!PODCAST_INDEX_KEY || !PODCAST_INDEX_SECRET) {
  console.error('Missing PodcastIndex API credentials');
  console.log('PODCAST_INDEX_KEY:', PODCAST_INDEX_KEY ? 'Set' : 'Not set');
  console.log('PODCAST_INDEX_SECRET:', PODCAST_INDEX_SECRET ? 'Set' : 'Not set');
}

function generateAuthHeaders() {
  if (!PODCAST_INDEX_KEY || !PODCAST_INDEX_SECRET) {
    throw new Error('Missing PodcastIndex API credentials');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const hash = crypto
    .createHash('sha1')
    .update(PODCAST_INDEX_KEY + PODCAST_INDEX_SECRET + timestamp)
    .digest('hex');

  const headers = {
    'X-Auth-Key': PODCAST_INDEX_KEY,
    'X-Auth-Date': timestamp.toString(),
    'Authorization': hash,
    'User-Agent': 'Telecast/1.0',
  };

  console.log('Generated auth headers:', {
    timestamp,
    hash: hash.substring(0, 10) + '...',
    key: PODCAST_INDEX_KEY.substring(0, 5) + '...',
  });

  return headers;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!PODCAST_INDEX_KEY || !PODCAST_INDEX_SECRET) {
    return NextResponse.json(
      { error: 'Podcast Index API credentials not configured' },
      { status: 500 }
    );
  }

  try {
    console.log('Fetching podcast with ID:', params.id);

    // Fetch podcast details
    const podcastUrl = `${PODCAST_INDEX_BASE_URL}/podcasts/byfeedid?id=${params.id}`;
    console.log('Fetching podcast from:', podcastUrl);

    const podcastResponse = await axios.get(podcastUrl, {
      headers: generateAuthHeaders(),
    });

    console.log('Podcast API response status:', podcastResponse.status);
    console.log('Podcast API response data:', {
      hasFeed: !!podcastResponse.data.feed,
      feedId: podcastResponse.data.feed?.id,
      feedTitle: podcastResponse.data.feed?.title,
    });

    if (!podcastResponse.data.feed) {
      console.error('No feed data in response:', podcastResponse.data);
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    const feed = podcastResponse.data.feed;

    // Fetch episodes
    const episodesUrl = `${PODCAST_INDEX_BASE_URL}/episodes/byfeedid?id=${params.id}&max=50`;
    console.log('Fetching episodes from:', episodesUrl);

    const episodesResponse = await axios.get(episodesUrl, {
      headers: generateAuthHeaders(),
    });

    console.log('Episodes API response status:', episodesResponse.status);
    console.log('Number of episodes:', episodesResponse.data.items?.length || 0);

    const episodes = episodesResponse.data.items.map((episode: any) => ({
      id: episode.id.toString(),
      title: episode.title,
      description: episode.description,
      duration: formatDuration(episode.duration),
      audioUrl: episode.enclosureUrl,
      publishedAt: new Date(episode.datePublished * 1000).toISOString(),
    }));

    const podcast = {
      id: feed.id.toString(),
      title: feed.title,
      description: feed.description,
      author: feed.author,
      imageUrl: feed.image || feed.artwork,
      website: feed.link,
      language: feed.language,
      categories: feed.categories,
      ownerName: feed.ownerName,
      ownerEmail: feed.ownerEmail,
      explicit: feed.explicit,
      type: feed.type,
      lastUpdateTime: new Date(feed.lastUpdateTime * 1000).toISOString(),
      lastCrawlTime: new Date(feed.lastCrawlTime * 1000).toISOString(),
      lastParseTime: new Date(feed.lastParseTime * 1000).toISOString(),
      lastGoodHttpStatusTime: new Date(feed.lastGoodHttpStatusTime * 1000).toISOString(),
      lastHttpStatus: feed.lastHttpStatus,
      crawlErrors: feed.crawlErrors,
      parseErrors: feed.parseErrors,
      episodes: episodes,
    };

    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch podcast',
          details: error.response?.data?.description || error.message
        },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch podcast' },
      { status: 500 }
    );
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 