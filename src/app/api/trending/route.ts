import { NextResponse } from 'next/server';

// Use environment variables for API keys
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const PODCAST_INDEX_KEY = process.env.PODCAST_INDEX_KEY || '';
const PODCAST_INDEX_SECRET = process.env.PODCAST_INDEX_SECRET || '';

async function sha1(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function GET() {
  try {
    // Fetch podcasts from Podcast Index
    const time = Math.floor(Date.now() / 1000);
    const hash = await sha1(`${PODCAST_INDEX_KEY}${PODCAST_INDEX_SECRET}${time}`);
    
    let podcastData: any = { feeds: [] };
    const podcastRes = await fetch('https://api.podcastindex.org/api/1.0/recent/feeds?max=3', {
      method: 'GET',
      headers: {
        'User-Agent': 'PodcastSearchExample/1.0',
        'X-Auth-Date': time.toString(),
        'X-Auth-Key': PODCAST_INDEX_KEY,
        'Authorization': hash,
        'Accept': 'application/json'
      }
    });

    if (!podcastRes.ok) {
      console.warn('Podcast API error:', await podcastRes.text());
      // Return empty array instead of throwing
      podcastData = { feeds: [] };
    } else {
      podcastData = await podcastRes.json();
    }

    // Fetch YouTube trending videos for Canada
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=3&regionCode=CA&key=${GOOGLE_API_KEY}`
    );
    const videoData = await videoRes.json();

    // Fetch Spotify songs
    let songData = { tracks: { items: [] } };
    try {
      const spotifyTokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
        },
        body: 'grant_type=client_credentials'
      });
      
      if (!spotifyTokenRes.ok) {
        console.warn('Spotify token error:', await spotifyTokenRes.text());
      } else {
        const spotifyTokenData = await spotifyTokenRes.json();
        const defaultArtist = 'taylorswift';
        const songRes = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(defaultArtist)}&type=track&limit=3`,
          {
            headers: {
              'Authorization': `Bearer ${spotifyTokenData.access_token}`
            }
          }
        );
        
        if (!songRes.ok) {
          console.warn('Spotify search error:', await songRes.text());
        } else {
          songData = await songRes.json();
        }
      }
    } catch (error) {
      console.warn('Error fetching from Spotify:', error);
    }

    // Fetch Google Books
    const bookRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=a&maxResults=3&key=${GOOGLE_API_KEY}`
    );
    const bookData = await bookRes.json();

    // Process and validate the data before returning
    const processedData = {
      podcasts: (podcastData.feeds || []).slice(0, 3).map((podcast: any) => ({
        id: podcast.id,
        title: podcast.title,
        description: podcast.description,
        image: podcast.artwork || podcast.image,
        enclosureUrl: podcast.enclosureUrl || podcast.url || null,
        author: podcast.author,
        categories: podcast.categories,
        episodeCount: podcast.episodeCount,
        language: podcast.language
      })),
      videos: (videoData.items || []).slice(0, 3).map((video: any) => ({
        id: typeof video.id === 'string' ? video.id : video.id?.videoId,
        snippet: {
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnails: {
            medium: { url: video.snippet.thumbnails.medium.url }
          }
        }
      })),
      songs: (songData.tracks?.items || []).slice(0, 3).map((song: any) => ({
        id: song.id,
        name: song.name,
        artists: song.artists.map((artist: any) => ({ name: artist.name })),
        album: {
          images: song.album.images || []
        },
        preview_url: song.preview_url || null
      })),
      books: (bookData.items || []).slice(0, 3).map((book: any) => ({
        id: book.id,
        volumeInfo: {
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors || [],
          imageLinks: book.volumeInfo.imageLinks || { thumbnail: null }
        }
      }))
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending content' },
      { status: 500 }
    );
  }
} 