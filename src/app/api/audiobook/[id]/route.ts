
import { NextRequest, NextResponse } from 'next/server';
import { getAudibleBookDetails } from '@/lib/audible-search';

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
    const audiobook = await getAudibleBookDetails(audiobookId);

    if (!audiobook) {
      return NextResponse.json(
        { error: 'Audiobook not found' },
        { status: 404 }
      );
    }

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
