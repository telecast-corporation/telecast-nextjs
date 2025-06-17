import { NextResponse } from 'next/server';
import axios from 'axios';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const maxResults = searchParams.get('maxResults') || '20';
    const startIndex = searchParams.get('startIndex') || '0';

    // Log environment info
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasApiKey: !!process.env.GOOGLE_BOOKS_API_KEY,
      apiKeyLength: process.env.GOOGLE_BOOKS_API_KEY?.length
    });

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_BOOKS_API_KEY) {
      console.error('Google Books API key is missing in production');
      return NextResponse.json(
        { error: 'Google Books API key is not configured' },
        { status: 500 }
      );
    }

    // Log the actual request URL (without the API key)
    const requestUrl = `${GOOGLE_BOOKS_API_URL}?q=${query}&maxResults=${maxResults}&startIndex=${startIndex}&langRestrict=en&printType=books&orderBy=relevance`;
    console.log('Making request to:', requestUrl);

    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: query,
        maxResults,
        startIndex,
        langRestrict: 'en',
        printType: 'books',
        orderBy: 'relevance',
        key: process.env.GOOGLE_BOOKS_API_KEY
      },
    });

    // Log response details
    console.log('Google Books API response:', {
      status: response.status,
      statusText: response.statusText,
      itemsCount: response.data.items?.length || 0,
      totalItems: response.data.totalItems,
      hasError: !!response.data.error,
      errorMessage: response.data.error?.message
    });

    if (response.data.error) {
      console.error('Google Books API returned an error:', response.data.error);
      return NextResponse.json(
        { error: 'Google Books API error', details: response.data.error },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    // Enhanced error logging
    console.error('Books search error details:', {
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
        params: {
          ...error.config?.params,
          key: error.config?.params?.key ? '[REDACTED]' : undefined
        }
      }
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch books', 
        details: error.message,
        status: error.response?.status,
        apiError: error.response?.data
      },
      { status: error.response?.status || 500 }
    );
  }
} 