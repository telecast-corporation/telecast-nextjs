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

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log('Making request to Google Books API with params:', {
      q: query,
      maxResults,
      startIndex,
      key: process.env.GOOGLE_BOOKS_API_KEY ? 'API key is set' : 'API key is missing'
    });

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

    console.log('Google Books API response status:', response.status);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Books search error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        params: error.config?.params
      }
    });
    return NextResponse.json(
      { error: 'Failed to fetch books', details: error.message },
      { status: 500 }
    );
  }
} 