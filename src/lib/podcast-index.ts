import axios from 'axios';
import crypto from 'crypto';

const PODCASTINDEX_API_KEY = process.env.PODCASTINDEX_API_KEY!;
const PODCASTINDEX_API_SECRET = process.env.PODCASTINDEX_API_SECRET!;
const PODCASTINDEX_API_URL = 'https://api.podcastindex.org/api/1.0';

if (!PODCASTINDEX_API_KEY || !PODCASTINDEX_API_SECRET) {
  throw new Error('PodcastIndex API credentials are required. Please set PODCASTINDEX_API_KEY and PODCASTINDEX_API_SECRET environment variables.');
}

export interface Episode {
  id: number;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  publishDate: string;
  imageUrl?: string;
}

export interface Podcast {
  id: number;
  title: string;
  author: string;
  description: string;
  image: string;
  url: string;
  categories?: string[];
  language?: string;
  explicit?: boolean;
  episodeCount?: number;
  lastUpdateTime?: number;
  episodes?: Episode[];
}

export class PodcastIndex {
  private generateAuthHeaders() {
    const timestamp = Math.floor(Date.now() / 1000);
    const hash = crypto
      .createHash('sha1')
      .update(PODCASTINDEX_API_KEY + PODCASTINDEX_API_SECRET + timestamp)
      .digest('hex');

    return {
      'User-Agent': 'Telecast/1.0',
      'X-Auth-Key': PODCASTINDEX_API_KEY,
      'X-Auth-Date': timestamp.toString(),
      'Authorization': hash,
    };
  }

  async search(query: string): Promise<Podcast[]> {
    try {
      const response = await axios.get(
        `${PODCASTINDEX_API_URL}/search/byterm`,
        {
          params: { q: query },
          headers: this.generateAuthHeaders(),
        }
      );

      if (!response.data.feeds || response.data.feeds.length === 0) {
        return [];
      }

      return response.data.feeds.map((feed: any) => ({
        id: feed.id,
        title: feed.title,
        author: feed.author || 'Unknown Author',
        description: feed.description || 'No description available',
        image: feed.image || 'https://via.placeholder.com/150',
        url: feed.url,
        categories: feed.categories ? Object.values(feed.categories) : [],
        language: feed.language,
        explicit: feed.explicit,
        episodeCount: feed.episodeCount,
        lastUpdateTime: feed.lastUpdateTime,
      }));
    } catch (error) {
      console.error('Error searching podcasts:', error);
      if (axios.isAxiosError(error)) {
        console.error('PodcastIndex API error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  }

  async getPodcastById(id: number): Promise<Podcast | null> {
    try {
      // First, get the podcast feed details
      const feedResponse = await axios.get(
        `${PODCASTINDEX_API_URL}/podcasts/byfeedid`,
        {
          params: { id },
          headers: this.generateAuthHeaders(),
        }
      );

      if (!feedResponse.data.feed) {
        return null;
      }

      const feed = feedResponse.data.feed;

      // Then, get the episodes for this podcast
      const episodesResponse = await axios.get(
        `${PODCASTINDEX_API_URL}/episodes/byfeedid`,
        {
          params: { id },
          headers: this.generateAuthHeaders(),
        }
      );

      const episodes = episodesResponse.data.items?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || 'No description available',
        audioUrl: item.enclosureUrl,
        duration: item.duration,
        publishDate: item.datePublished,
        imageUrl: item.image || feed.image,
      })) || [];

      return {
        id: feed.id,
        title: feed.title,
        author: feed.author || 'Unknown Author',
        description: feed.description || 'No description available',
        image: feed.image || 'https://via.placeholder.com/150',
        url: feed.url,
        categories: feed.categories ? Object.values(feed.categories) : [],
        language: feed.language,
        explicit: feed.explicit,
        episodeCount: feed.episodeCount,
        lastUpdateTime: feed.lastUpdateTime,
        episodes,
      };
    } catch (error) {
      console.error('Error fetching podcast:', error);
      if (axios.isAxiosError(error)) {
        console.error('PodcastIndex API error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  }
} 