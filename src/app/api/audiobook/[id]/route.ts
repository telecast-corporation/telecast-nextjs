import { NextRequest, NextResponse } from 'next/server';
import { searchAudible } from '@/lib/audible-search';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: audiobookId } = await params;

  if (!audiobookId) {
    return NextResponse.json(
      { error: 'Audiobook ID is required' },
      { status: 400 }
    );
  }

  try {
    const searchResults = await searchAudible(audiobookId, 1);

    if (searchResults.length === 0) {
      return NextResponse.json(
        { error: 'Audiobook not found' },
        { status: 404 }
      );
    }

    const audiobook = searchResults[0];

    const formattedResponse = {
      ...audiobook,
      audioUrl: audiobook.url,
    };

    return NextResponse.json(formattedResponse);

  } catch (error: any) {
    console.error('Error fetching audiobook details from Audible:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audiobook details' },
      { status: 500 }
    );
  }
}
