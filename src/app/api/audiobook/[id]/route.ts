
import { NextRequest, NextResponse } from 'next/server';
import { getAudibleBookDetails } from '@/lib/audible-search';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const bookDetails = await getAudibleBookDetails(params.id);
  if (bookDetails) {
    return NextResponse.json(bookDetails);
  }
  return NextResponse.json({ error: 'Book not found' }, { status: 404 });
}
