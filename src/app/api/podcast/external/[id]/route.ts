import { NextRequest, NextResponse } from 'next/server';
import { SpotifyClient } from '@/lib/spotify';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Invalid podcast id' }, { status: 400 });
    }

    const spotify = new SpotifyClient();
    const podcast = await spotify.getPodcastById(id);

    if (!podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    const response = {
        id: podcast.id,
        title: podcast.name,
        author: podcast.publisher,
        image: podcast.images[0]?.url,
        description: podcast.description,
        episodes: podcast.episodes.items.map(episode => ({
            id: episode.id,
            title: episode.name,
            description: episode.description,
            audioUrl: episode.audio_preview_url,
            duration: episode.duration_ms / 1000,
            publishDate: episode.release_date,
            imageUrl: episode.images[0]?.url
        }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching external podcast:', error);
    return NextResponse.json(
      { error: 'Error fetching external podcast' },
      { status: 500 }
    );
  }
}
