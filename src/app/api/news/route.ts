import { NextResponse } from 'next/server';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content?: string;
}

interface NewsRequest {
  location?: string;
  query?: string;
  page?: number;
  limit?: number;
}

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2';

async function getNewsByLocation(location: string, page: number = 1, limit: number = 20) {
  try {
    console.log('📰 Fetching news for location:', location);
    console.log('📰 API Key available:', !!NEWS_API_KEY);
    
    // Use the "everything" endpoint for better results
    const url = `${NEWS_API_URL}/everything?q=${encodeURIComponent(location)}&language=en&sortBy=publishedAt&page=${page}&pageSize=${limit}&apiKey=${NEWS_API_KEY}`;
    console.log('📰 Request URL:', url.replace(NEWS_API_KEY || '', '***'));
    
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

    console.log('📰 Response status:', response.status);
    console.log('📰 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('📰 News API error response:', errorText);
      throw new Error(`News API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📰 News API response data:', {
      status: data.status,
      totalResults: data.totalResults,
      articlesCount: data.articles?.length || 0
    });
    
    return data.articles || [];
  } catch (error) {
    console.error('📰 Error fetching news by location:', error);
    return [];
  }
}

async function getGeneralNews(page: number = 1, limit: number = 20) {
  try {
    console.log('📰 Fetching global news');
    console.log('📰 API Key available:', !!NEWS_API_KEY);
    
    // Use US top headlines as they have more content available
    const url = `${NEWS_API_URL}/top-headlines?country=us&page=${page}&pageSize=${limit}&apiKey=${NEWS_API_KEY}`;
    console.log('📰 Request URL:', url.replace(NEWS_API_KEY || '', '***'));
    
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

    console.log('📰 Response status:', response.status);
    console.log('📰 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('📰 News API error response:', errorText);
      throw new Error(`News API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📰 News API response data:', {
      status: data.status,
      totalResults: data.totalResults,
      articlesCount: data.articles?.length || 0
    });
    
    return data.articles || [];
  } catch (error) {
    console.error('📰 Error fetching general news:', error);
    return [];
  }
}

async function searchNews(query: string, page: number = 1, limit: number = 20) {
  try {
    const response = await fetch(
      `${NEWS_API_URL}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&page=${page}&pageSize=${limit}&apiKey=${NEWS_API_KEY}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error searching news:', error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    console.log('=== NEWS SEARCH DEBUG INFO ===');
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasApiKey: !!NEWS_API_KEY,
      apiKeyLength: NEWS_API_KEY?.length,
    });
    console.log('Request URL:', request.url);
    
    const body: NewsRequest = await request.json();
    const { location, query, page = 1, limit = 20 } = body;

    console.log('Search params:', { location, query, page, limit });

    if (!NEWS_API_KEY) {
      console.error('❌ News API key not configured');
      return NextResponse.json(
        { error: 'News API key not configured' },
        { status: 500 }
      );
    }

    let articles: NewsArticle[] = [];

    if (query) {
      articles = await searchNews(query, page, limit);
    } else if (location) {
      articles = await getNewsByLocation(location, page, limit);
    } else {
      articles = await getGeneralNews(page, limit);
    }

    console.log('✅ News API response articles count:', articles.length);

    const transformedResults = articles.map((article, index) => ({
      type: 'news',
      id: `news-${index}-${Date.now()}`,
      title: article.title || 'No title available',
      description: article.description || article.content || 'No description available',
      thumbnail: article.urlToImage || 'https://via.placeholder.com/300x200?text=News',
      url: article.url,
      author: article.source?.name || 'Unknown Source',
      publishedAt: article.publishedAt,
      source: 'newsapi',
      sourceUrl: article.url,
    }));

    return NextResponse.json({
      results: transformedResults,
      pagination: {
        page,
        limit,
        total: transformedResults.length,
        totalPages: Math.ceil(transformedResults.length / limit),
        hasNextPage: transformedResults.length === limit,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error('❌ News search error:', {
      message: error.message,
      code: error.code,
    });
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    console.log('=== NEWS SEARCH DEBUG INFO ===');
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasApiKey: !!NEWS_API_KEY,
      apiKeyLength: NEWS_API_KEY?.length,
    });
    console.log('Request URL:', request.url);

    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('Search params:', { location, query, page, limit });

    if (!NEWS_API_KEY) {
      console.error('❌ News API key not configured');
      return NextResponse.json(
        { error: 'News API key not configured' },
        { status: 500 }
      );
    }

    let articles: NewsArticle[] = [];

    if (query) {
      articles = await searchNews(query, page, limit);
    } else if (location) {
      articles = await getNewsByLocation(location, page, limit);
    } else {
      articles = await getGeneralNews(page, limit);
    }

    console.log('✅ News API response articles count:', articles.length);

    const transformedResults = articles.map((article, index) => ({
      type: 'news',
      id: `news-${index}-${Date.now()}`,
      title: article.title || 'No title available',
      description: article.description || article.content || 'No description available',
      thumbnail: article.urlToImage || 'https://via.placeholder.com/300x200?text=News',
      url: article.url,
      author: article.source?.name || 'Unknown Source',
      publishedAt: article.publishedAt,
      source: 'newsapi',
      sourceUrl: article.url,
    }));

    return NextResponse.json({
      results: transformedResults,
      pagination: {
        page,
        limit,
        total: transformedResults.length,
        totalPages: Math.ceil(transformedResults.length / limit),
        hasNextPage: transformedResults.length === limit,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error('❌ News search error:', {
      message: error.message,
      code: error.code,
    });
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
