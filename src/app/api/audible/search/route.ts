import { NextResponse } from 'next/server';
import { searchAudible } from '@/lib/audible-search';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const maxResults = parseInt(searchParams.get('maxResults') || '300');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const books = await searchAudible(query, maxResults);
    
    return NextResponse.json({
      items: books,
      total: books.length,
    });
  } catch (error) {
    console.error('🎧 Audible API error:', error);
    return NextResponse.json(
      { error: 'Failed to search audiobooks' },
      { status: 500 }
    );
  }
} 