import { NextResponse } from 'next/server';
import axios from 'axios';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw new Error('Failed to authenticate with Spotify');
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = params.id;
    if (!trackId) {
      return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    // Fetch track details
    const trackResponse = await axios.get(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const track = trackResponse.data;
    console.log('Full track data from Spotify:', JSON.stringify(track, null, 2));
    console.log('Track data:', {
      id: track.id,
      name: track.name,
      preview_url: track.preview_url,
      has_preview: !!track.preview_url
    });

    // Fetch artist details
    const artistResponse = await axios.get(
      `https://api.spotify.com/v1/artists/${track.artists[0].id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const artist = artistResponse.data;

    // Fetch artist's top tracks
    const topTracksResponse = await axios.get(
      `https://api.spotify.com/v1/artists/${track.artists[0].id}/top-tracks?market=US`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const relatedTracks = topTracksResponse.data.tracks
      .filter((t: any) => t.id !== trackId)
      .slice(0, 5)
      .map((t: any) => ({
        id: t.id,
        title: t.name,
        artist: t.artists[0].name,
        thumbnail: t.album.images[0]?.url || '',
      }));

    // Format duration from milliseconds to MM:SS
    const formatDuration = (ms: number) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const response = {
      id: track.id,
      title: track.name,
      artist: {
        name: track.artists[0].name,
        image: artist.images[0]?.url || '',
        genres: artist.genres || [],
      },
      album: {
        name: track.album.name,
        image: track.album.images[0]?.url || '',
        releaseDate: track.album.release_date,
      },
      duration: formatDuration(track.duration_ms),
      popularity: track.popularity,
      previewUrl: track.preview_url,
      relatedTracks,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching music details:', error);
    if (error.response?.status === 404) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch music details' },
      { status: 500 }
    );
  }
} 