import { NextRequest, NextResponse } from 'next/server';
import { searchAudible } from '@/lib/audible-search';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const results = await searchAudible(query);
  return NextResponse.json(results);
}
