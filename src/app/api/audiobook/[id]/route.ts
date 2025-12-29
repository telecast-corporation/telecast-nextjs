
import { NextRequest, NextResponse } from 'next/server';
import { getAudiobookDetails } from '@/lib/spotify-audiobook-api';

export const revalidate = 3600;

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
    const audiobookDetails = await getAudiobookDetails(audiobookId);

    if (!audiobookDetails) {
      return NextResponse.json(
        { error: 'Audiobook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(audiobookDetails);

  } catch (error: any) {
    console.error('Error fetching audiobook details from Spotify:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audiobook details' },
      { status: 500 }
    );
  }
}
