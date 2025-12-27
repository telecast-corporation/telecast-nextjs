
import { NextRequest, NextResponse } from 'next/server';
import { getSpotifyDetails } from '@/lib/spotify-details';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookDetails = await getSpotifyDetails(id);
  if (bookDetails) {
    return NextResponse.json(bookDetails);
  }
  return NextResponse.json({ error: 'Book not found' }, { status: 404 });
}
