import { NextRequest, NextResponse } from 'next/server';
import { searchAudible } from '@/lib/audible-search';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
   const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: 'Audiobook ID (title) is required' },
      { status: 400 }
    );
  }

  try {
    // The 'id' from the URL is expected to be the audiobook's title.
    // We'll use this title to search Audible and take the first result.
    const searchResults = await searchAudible(id, 1);

    if (searchResults.length === 0) {
      return NextResponse.json(
        { error: 'Audiobook not found on Audible' },
        { status: 404 }
      );
    }

    const audiobook = searchResults[0];

    // The searchAudible function already returns a well-formatted object.
    // We can add or modify fields if needed.
    const formattedResponse = {
      ...audiobook,
      // The audible-search scraper does not provide a direct audio stream URL.
      // The 'audioUrl' will be a placeholder or could link to the Audible page.
      audioUrl: audiobook.url, // Linking to the audible page as we can't get a direct stream.
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
