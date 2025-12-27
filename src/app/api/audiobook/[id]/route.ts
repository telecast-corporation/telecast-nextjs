
import { NextRequest, NextResponse } from 'next/server';
import { getAudibleBookDetails } from '@/lib/audible-search';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookDetails = await getAudibleBookDetails(id);
  if (bookDetails) {
    return NextResponse.json(bookDetails);
  }
  return NextResponse.json({ error: 'Book not found' }, { status: 404 });
}
