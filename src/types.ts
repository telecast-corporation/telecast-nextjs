
export interface TrendingItem {
  id: string;
  type: 'video' | 'music' | 'book' | 'podcast' | 'news' | 'tv' | 'local-news';
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  views?: string;
  publishedAt?: string;
  artist?: string;
  album?: string;
  author?: string;
  publishedDate?: string;
  rating?: number;
  episodeCount?: number;
  categories?: string[];
  source?: string;
  sourceUrl?: string;
  year?: string;
  duration?: string;
  previewVideo?: string;
  city?: string;
  country?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface TrendingContent {
  videos: TrendingItem[];
  music: TrendingItem[];
  books: TrendingItem[];
  podcasts: TrendingItem[];
  news: TrendingItem[];
  tv: TrendingItem[];
  localNews: TrendingItem[];
}
