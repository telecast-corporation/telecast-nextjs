import { NextRequest, NextResponse } from 'next/server';
import { SpotifyClient, SpotifyChapter } from '@/lib/spotify';

// Helper to format duration from ms to a readable format
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
};

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
    const spotifyClient = new SpotifyClient();
    const audiobook = await spotifyClient.getAudiobookById(audiobookId);

    if (!audiobook) {
      return NextResponse.json(
        { error: 'Audiobook not found' },
        { status: 404 }
      );
    }

    // Map chapters to a consistent episode format
    const episodes = audiobook.chapters.items.map((chapter: SpotifyChapter) => ({
      id: chapter.id,
      title: chapter.name,
      url: chapter.audio_preview_url,
      duration: formatDuration(chapter.duration_ms),
      publishDate: chapter.release_date,
    }));

    const formattedResponse = {
      id: audiobook.id,
      title: audiobook.name,
      author: audiobook.authors.map(a => a.name).join(', '),
      description: audiobook.description,
      thumbnail: audiobook.images[0]?.url,
      // Use the preview URL from the first chapter as the main URL
      url: episodes.length > 0 ? episodes[0].url : '',
      duration: '', // This could be a total of chapter durations if needed
      narrator: audiobook.narrators.map(n => n.name).join(', '),
      rating: 0, // Spotify API doesn't provide this
      source: 'spotify',
      sourceUrl: audiobook.external_urls.spotify,
      episodes: episodes, // Include the list of episodes
    };

    return NextResponse.json(formattedResponse);

  } catch (error: any) {
    console.error('Error fetching audiobook details from Spotify:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audiobook details' },
      { status: 500 }
    );
  }
}
