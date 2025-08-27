import { NextResponse } from 'next/server';
import axios from 'axios';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export const dynamic = 'force-dynamic';

// Helper function to convert HTTP URLs to HTTPS
function ensureHttps(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const maxResults = searchParams.get('maxResults') || '20';
    const startIndex = searchParams.get('startIndex') || '0';

    // Enhanced environment logging
    console.log('=== BOOKS SEARCH DEBUG INFO ===');
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasApiKey: !!process.env.GOOGLE_BOOKS_API_KEY,
      apiKeyLength: process.env.GOOGLE_BOOKS_API_KEY?.length,
      apiKeyPrefix: process.env.GOOGLE_BOOKS_API_KEY?.substring(0, 10) + '...',
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('GOOGLE'))
    });
    console.log('Request URL:', request.url);
    console.log('Search params:', { query, maxResults, startIndex });

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_BOOKS_API_KEY) {
      console.error('❌ Google Books API key is missing in production');
      console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('API')));
      return NextResponse.json(
        { error: 'Google Books API key is not configured' },
        { status: 500 }
      );
    }

    // Log the actual request URL (without the API key)
    const requestUrl = `${GOOGLE_BOOKS_API_URL}?q=${query}&maxResults=${maxResults}&startIndex=${startIndex}&langRestrict=en&printType=books&orderBy=relevance`;
    console.log('Making request to:', requestUrl);
    console.log('API Key present:', !!process.env.GOOGLE_BOOKS_API_KEY);

    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: query,
        maxResults,
        startIndex,
        langRestrict: 'en',
        printType: 'books',
        orderBy: 'relevance',
        country: 'CA',
        key: process.env.GOOGLE_BOOKS_API_KEY
      },
      timeout: 10000, // 10 second timeout
    });

    // Log response details
    console.log('✅ Google Books API response:', {
      status: response.status,
      statusText: response.statusText,
      itemsCount: response.data.items?.length || 0,
      totalItems: response.data.totalItems,
      hasError: !!response.data.error,
      errorMessage: response.data.error?.message
    });

    if (response.data.error) {
      console.error('❌ Google Books API returned an error:', response.data.error);
      return NextResponse.json(
        { error: 'Google Books API error', details: response.data.error },
        { status: 500 }
      );
    }

    // Convert all image URLs to HTTPS
    if (response.data.items) {
      response.data.items = response.data.items.map((item: any) => {
        if (item.volumeInfo?.imageLinks) {
          Object.keys(item.volumeInfo.imageLinks).forEach(key => {
            item.volumeInfo.imageLinks[key] = ensureHttps(item.volumeInfo.imageLinks[key]);
          });
        }
        return item;
      });
    }

    console.log('✅ Successfully processed and returning data');
    return NextResponse.json(response.data);
  } catch (error: any) {
    // Enhanced error logging
    console.error('❌ Books search error:', {
      message: error.message,
      code: error.code,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      },
      config: {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      }
    });

    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Google Books API quota exceeded or invalid API key' },
        { status: 429 }
      );
    }

    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Request timeout - Google Books API is not responding' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
} 