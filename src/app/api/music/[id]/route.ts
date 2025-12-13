import { NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/prisma';

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

// Function to generate alternative preview options
function generatePreviewOptions(track: any, artist: any) {
  const previewOptions = [];
  
  // If Spotify has a preview URL, use it as primary option
  if (track.preview_url) {
    previewOptions.push({
      type: 'spotify_preview',
      url: track.preview_url,
      label: 'Spotify Preview',
      duration: '30s',
      source: 'spotify'
    });
  }
  
  // Add YouTube Music search as fallback
  const searchQuery = `${track.name} ${track.artists[0].name} audio`;
  const youtubeMusicUrl = `https://music.youtube.com/search?q=${encodeURIComponent(searchQuery)}`;
  previewOptions.push({
    type: 'youtube_music',
    url: youtubeMusicUrl,
    label: 'Listen on YouTube Music',
    duration: 'Full track',
    source: 'youtube_music'
  });
  
  // Add Spotify full track link
  if (track.external_urls?.spotify) {
    previewOptions.push({
      type: 'spotify_full',
      url: track.external_urls.spotify,
      label: 'Listen on Spotify',
      duration: 'Full track',
      source: 'spotify'
    });
  }
  
  // Add Apple Music search as another option
  const appleMusicUrl = `https://music.apple.com/search?term=${encodeURIComponent(searchQuery)}`;
  previewOptions.push({
    type: 'apple_music',
    url: appleMusicUrl,
    label: 'Listen on Apple Music',
    duration: 'Full track',
    source: 'apple_music'
  });
  
  return previewOptions;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    if (!id) {
      return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    // Fetch track details
    const trackResponse = await axios.get(
      `https://api.spotify.com/v1/tracks/${id}`,
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
      .filter((t: any) => t.id !== id)
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

    // Generate preview options
    const previewOptions = generatePreviewOptions(track, artist);

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
      previewUrl: track.preview_url, // Keep original for backward compatibility
      previewOptions, // New field with multiple options
      hasPreview: previewOptions.length > 0,
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