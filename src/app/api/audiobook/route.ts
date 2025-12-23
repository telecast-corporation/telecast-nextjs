import { NextRequest, NextResponse } from 'next/server';
import { searchAudible } from '@/lib/audible-search';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    const results = await searchAudible(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch audiobooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audiobooks' },
      { status: 500 }
    );
  }
}
