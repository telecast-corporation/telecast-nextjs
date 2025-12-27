
interface Spotify {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url: string;
  author?: string;
  duration?: string;
  narrator?: string;
  rating?: string;
  spotifyUrl: string;
  sourceUrl?: string;
}

async function getSpotifyAccessToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn('Spotify credentials not configured');
        return null;
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            console.warn('Failed to get Spotify access token:', await response.text());
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error getting Spotify access token:', error);
        return null;
    }
}


export async function searchSpotifys(query: string, maxResults: number = 50): Promise<Spotify[]> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    return [];
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=audiobook&limit=${maxResults}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Spotify spotify search failed:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.audiobooks.items.map((item: any) => ({
      id: item.id,
      title: item.name,
      author: item.authors.map((author: any) => author.name).join(', '),
      description: item.html_description,
      thumbnail: item.images[0]?.url,
      url: `/spotify/${item.id}`,
      spotifyUrl: item.external_urls.spotify,
      sourceUrl: item.external_urls.spotify,
      narrator: item.narrators.map((narrator: any) => narrator.name).join(', '),
      duration: `${Math.floor(item.duration_ms / 60000)}:${((item.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}`,
    }));
  } catch (error) {
    console.error('Error searching Spotify for spotify:', error);
    return [];
  }
}
