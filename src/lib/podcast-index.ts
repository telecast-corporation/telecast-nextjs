import axios from 'axios';
import crypto from 'crypto';

// Use the original environment variable names without NEXT_PUBLIC_ prefix
const PODCASTINDEX_API_KEY = process.env.PODCASTINDEX_API_KEY;
const PODCASTINDEX_API_SECRET = process.env.PODCASTINDEX_API_SECRET;
const PODCASTINDEX_API_URL = 'https://api.podcastindex.org/api/1.0';

// Log environment variables (without exposing secrets)
console.log('PodcastIndex API Key available:', !!PODCASTINDEX_API_KEY);
console.log('PodcastIndex API Secret available:', !!PODCASTINDEX_API_SECRET);

if (!PODCASTINDEX_API_KEY || !PODCASTINDEX_API_SECRET) {
  console.error('Missing PodcastIndex API credentials:', {
    hasKey: !!PODCASTINDEX_API_KEY,
    hasSecret: !!PODCASTINDEX_API_SECRET,
    envKeys: Object.keys(process.env).filter(key => key.includes('PODCASTINDEX'))
  });
  throw new Error('PODCASTINDEX_API_KEY and PODCASTINDEX_API_SECRET must be defined');
}

// After the check, we can safely assert these are non-null
const API_KEY = PODCASTINDEX_API_KEY!;
const API_SECRET = PODCASTINDEX_API_SECRET!;

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
      .update(API_KEY + API_SECRET + timestamp)
      .digest('hex');

    return {
      'User-Agent': 'Telecast/1.0',
      'X-Auth-Key': API_KEY,
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
        categories: feed.categories ? Object.values(feed.categories).map(String) : [],
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
      console.log('Fetching podcast feed details for ID:', id);
      // First, get the podcast feed details
      const feedResponse = await axios.get(
        `${PODCASTINDEX_API_URL}/podcasts/byfeedid`,
        {
          params: { id },
          headers: this.generateAuthHeaders(),
        }
      );

      console.log('Feed response:', feedResponse.data);

      if (!feedResponse.data.feed) {
        console.error('No feed data in response:', feedResponse.data);
        return null;
      }

      const feed = feedResponse.data.feed;

      console.log('Fetching episodes for feed ID:', id);
      // Then, get the episodes for this podcast
      const episodesResponse = await axios.get(
        `${PODCASTINDEX_API_URL}/episodes/byfeedid`,
        {
          params: { id },
          headers: this.generateAuthHeaders(),
        }
      );

      console.log('Episodes response:', episodesResponse.data);

      const episodes = episodesResponse.data.items?.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || 'No description available',
        audioUrl: item.enclosureUrl,
        duration: item.duration,
        publishDate: item.datePublished,
        imageUrl: item.image || feed.image,
      })) || [];

      const podcast: Podcast = {
        id: feed.id,
        title: feed.title,
        author: feed.author || 'Unknown Author',
        description: feed.description || 'No description available',
        image: feed.image || 'https://via.placeholder.com/150',
        url: feed.url,
        categories: feed.categories ? Object.values(feed.categories).map(String) : [],
        language: feed.language,
        explicit: feed.explicit,
        episodeCount: feed.episodeCount,
        lastUpdateTime: feed.lastUpdateTime,
        episodes,
      };

      console.log('Processed podcast data:', podcast);
      return podcast;
    } catch (error) {
      console.error('Error in getPodcastById:', error);
      if (axios.isAxiosError(error)) {
        console.error('PodcastIndex API error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          }
        });
      }
      throw error;
    }
  }
} 

// Export a singleton instance
export const podcastIndex = new PodcastIndex(); 