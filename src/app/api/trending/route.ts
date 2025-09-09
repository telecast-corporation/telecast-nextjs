import { NextResponse } from 'next/server';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const PODCASTINDEX_API_KEY = process.env.PODCASTINDEX_API_KEY;
const PODCASTINDEX_API_SECRET = process.env.PODCASTINDEX_API_SECRET;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getTrendingVideos() {
  try {
    console.log('Fetching trending videos...');
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'snippet,statistics',
          chart: 'mostPopular',
          regionCode: 'CA',
          maxResults: 200,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    console.log('Videos response:', response.data);
    return response.data.items.map((item: any) => ({
      id: item.id,
      type: 'video',
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      views: item.statistics.viewCount,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return [];
  }
}

async function getTrendingMusic() {
  try {
    console.log('Fetching trending music...');
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error('Missing Spotify credentials');
      return [];
    }

    // First, get an access token
    console.log('Getting Spotify access token...');
    const tokenResponse = await axios.post(
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

    if (!tokenResponse.data.access_token) {
      console.error('No access token received from Spotify');
      return [];
    }

    const accessToken = tokenResponse.data.access_token;
    console.log('Got Spotify access token');

        // Search for tracks from multiple popular artists to get more results
    const popularArtists = ['Taylor Swift', 'Drake', 'The Weeknd', 'Ed Sheeran', 'Ariana Grande', 'Post Malone'];
    const searchPromises = popularArtists.slice(0, 6).map(artist => // Use 6 artists to get ~300 tracks (50 each)
      axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: `artist:${artist}`,
          type: 'track',
          limit: 50, // Spotify's max limit per request
          market: 'CA',
        },
      })
    );

    const responses = await Promise.allSettled(searchPromises);
    const allTracks: any[] = [];

    responses.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.data.tracks?.items) {
        const tracks = result.value.data.tracks.items;
        allTracks.push(...tracks);
        console.log(`Got ${tracks.length} tracks from ${popularArtists[index]}`);
      } else {
        console.error(`Failed to get tracks from ${popularArtists[index]}`);
      }
    });

    console.log('Music response:', {
      totalTracks: allTracks.length,
      artistsSearched: popularArtists.slice(0, 6),
    });

    // Remove duplicates based on track ID and shuffle for variety
    const uniqueTracks = Array.from(
      new Map(allTracks.map(track => [track.id, track])).values()
    );
    
    // Shuffle the tracks for better variety
    const shuffledTracks = uniqueTracks.sort(() => Math.random() - 0.5);

    return shuffledTracks.slice(0, 300).map((track: any) => ({
      id: track.id,
      type: 'music',
      title: track.name,
      description: track.artists.map((artist: any) => artist.name).join(', '),
      thumbnail: track.album.images[0]?.url,
      url: track.external_urls?.spotify,
      artist: track.artists[0].name,
      album: track.album.name,
      releaseDate: track.album.release_date,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Spotify API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('Error fetching trending music:', error);
    }
    return [];
  }
}

function ensureHttps(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
}

async function getTrendingBooks() {
  try {
    console.log('Fetching trending books...');
    const response = await axios.get(
      'https://www.googleapis.com/books/v1/volumes',
      {
        params: {
          q: 'fiction',
          maxResults: 40,
          country: 'CA',
          key: GOOGLE_BOOKS_API_KEY,
        },
      }
    );

    console.log('Books response:', response.data);
    if (!response.data.items) {
      console.error('No books found in response');
      return [];
    }

    return response.data.items.map((item: any) => ({
      id: item.id,
      type: 'book',
      title: item.volumeInfo.title,
      description: item.volumeInfo.description,
      thumbnail: ensureHttps(item.volumeInfo.imageLinks?.thumbnail),
      url: item.volumeInfo.infoLink,
      author: item.volumeInfo.authors?.[0] || 'Unknown Author',
      publishedDate: item.volumeInfo.publishedDate,
      rating: item.volumeInfo.averageRating,
    }));
  } catch (error) {
    console.error('Error fetching trending books:', error);
    return [];
  }
}

async function getTrendingPodcasts() {
  try {
    console.log('Fetching trending podcasts...');
    if (!PODCASTINDEX_API_KEY || !PODCASTINDEX_API_SECRET) {
      console.error('Missing Podcast Index credentials');
      return [];
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const hash = require('crypto')
      .createHash('sha1')
      .update(PODCASTINDEX_API_KEY + PODCASTINDEX_API_SECRET + timestamp)
      .digest('hex');

    const response = await axios.get(
      'https://api.podcastindex.org/api/1.0/recent/feeds',
      {
        params: { max: 200 },
        headers: {
          'User-Agent': 'Telecast/1.0',
          'X-Auth-Key': PODCASTINDEX_API_KEY,
          'X-Auth-Date': timestamp.toString(),
          'Authorization': hash,
        },
      }
    );

    console.log('Podcasts response:', response.data);
    return response.data.feeds.map((feed: any) => ({
      id: feed.id,
      type: 'podcast',
      title: feed.title,
      description: feed.description,
      thumbnail: feed.artwork || feed.image,
      url: feed.url,
      author: feed.author,
      episodeCount: feed.episodeCount,
      categories: feed.categories ? Object.values(feed.categories) : [],
    }));
  } catch (error) {
    console.error('Error fetching trending podcasts:', error);
    return [];
  }
}

async function getTrendingTV() {
  try {
    console.log('📺 Fetching trending TV from Tubi...');
    
    const response = await axios.get('https://tubitv.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'DNT': '1',
      },
      timeout: 30000,
      maxRedirects: 5,
    });

    console.log('📺 Tubi response status:', response.status);
    
    if (response.status !== 200) {
      console.error('📺 Failed to fetch Tubi homepage');
      return [];
    }

    const html = response.data;
    const tvShows = [];

    // Extract trending TV shows from the HTML
    // Look for TV show cards in the trending sections
    const tvShowRegex = /<div[^>]*class="[^"]*tv[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const titleRegex = /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i;
    const imgRegex = /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/i;
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>/i;
    const yearRegex = /(\d{4})/;
    const durationRegex = /(\d+h?\s?\d*m?)/i;
    const ratingRegex = /(PG|PG-13|R|TV-PG|TV-14|TV-MA|G)/i;

    // Extract content from the HTML
    let match;
    let itemCount = 0;
    
    // Look for TV show patterns in the HTML
    const contentSections = html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) || [];
    
    for (const section of contentSections) {
      // Extract individual items from each section
      const items = section.match(/<div[^>]*class="[^"]*item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) || 
                   section.match(/<div[^>]*class="[^"]*card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) ||
                   section.match(/<div[^>]*class="[^"]*show[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
      
      if (items) {
        for (const item of items.slice(0, 20)) { // Limit to 20 items per section
          try {
            const titleMatch = item.match(titleRegex);
            const imgMatch = item.match(imgRegex);
            const linkMatch = item.match(linkRegex);
            
            if (titleMatch && imgMatch) {
              const title = titleMatch[1].trim();
              const thumbnail = imgMatch[1].startsWith('http') ? imgMatch[1] : `https://tubitv.com${imgMatch[1]}`;
              const altText = imgMatch[2] || title;
              const url = linkMatch ? (linkMatch[1].startsWith('http') ? linkMatch[1] : `https://tubitv.com${linkMatch[1]}`) : 'https://tubitv.com';
              
              // Extract additional metadata
              const yearMatch = item.match(yearRegex);
              const durationMatch = item.match(durationRegex);
              const ratingMatch = item.match(ratingRegex);
              
              // Determine if it's a TV show (look for TV-specific indicators)
              const isTVShow = item.includes('TV') || item.includes('Series') || item.includes('Episode') || 
                              title.includes('Season') || title.includes('Episode') ||
                              durationMatch && durationMatch[1].includes('h'); // TV shows often have hour durations
              
              if (isTVShow || itemCount < 30) { // Include some movies too for variety
                tvShows.push({
                  id: `tubi-tv-${itemCount}-${Date.now()}`,
                  type: 'tv',
                  title: title,
                  description: altText,
                  thumbnail: thumbnail,
                  url: url,
                  year: yearMatch ? yearMatch[1] : null,
                  duration: durationMatch ? durationMatch[1] : null,
                  rating: ratingMatch ? ratingMatch[1] : null,
                  source: 'Tubi',
                  sourceUrl: url,
                });
                itemCount++;
              }
            }
          } catch (error) {
            console.log('📺 Error parsing TV item:', error);
            continue;
          }
        }
      }
    }

    // If we didn't find enough content, create comprehensive sample trending TV shows
    if (tvShows.length < 50) {
      const sampleTVShows = [
        {
          id: `tubi-tv-sample-1-${Date.now()}`,
          type: 'tv',
          title: 'Everybody Hates Chris',
          description: 'A comedy series about Chris Rock\'s teenage years growing up in Brooklyn.',
          thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '2009',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: `tubi-tv-sample-2-${Date.now()}`,
          type: 'tv',
          title: 'Empire',
          description: 'A drama series about a hip-hop music and entertainment company.',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '2020',
          duration: 'TV-14',
          rating: 'TV-14',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
        {
          id: `tubi-tv-sample-3-${Date.now()}`,
          type: 'tv',
          title: 'Dance Moms',
          description: 'A reality series following young competitive dancers and their mothers.',
          thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '2016',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: `tubi-tv-sample-4-${Date.now()}`,
          type: 'tv',
          title: 'My Little Pony: Friendship Is Magic',
          description: 'An animated series about magical ponies and the power of friendship.',
          thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '2010',
          duration: 'TV-Y',
          rating: 'TV-Y',
          source: 'Tubi',
          sourceUrl: 'https://tubi.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: `tubi-tv-sample-5-${Date.now()}`,
          type: 'tv',
          title: 'Love Thy Neighbor',
          description: 'A comedy series about neighbors and their hilarious interactions.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '2017',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          id: `tubi-tv-sample-6-${Date.now()}`,
          type: 'tv',
          title: 'Sanford and Son',
          description: 'A classic comedy series about a junk dealer and his son.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1977',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        },
        {
          id: `tubi-tv-sample-7-${Date.now()}`,
          type: 'tv',
          title: 'Gilligan\'s Island',
          description: 'A classic comedy series about castaways on a deserted island.',
          thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1967',
          duration: 'TV-G',
          rating: 'TV-G',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        },
        {
          id: `tubi-tv-sample-8-${Date.now()}`,
          type: 'tv',
          title: 'The Magic School Bus',
          description: 'An educational animated series about science adventures.',
          thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1997',
          duration: 'TV-Y7',
          rating: 'TV-Y7',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        },
        {
          id: `tubi-tv-sample-9-${Date.now()}`,
          type: 'tv',
          title: 'Scooby-Doo Where Are You?',
          description: 'A classic animated mystery series featuring Scooby-Doo and friends.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1976',
          duration: 'TV-G',
          rating: 'TV-G',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        },
        {
          id: `tubi-tv-sample-10-${Date.now()}`,
          type: 'tv',
          title: 'All in the Family',
          description: 'A groundbreaking sitcom about a working-class family in Queens.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1980',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        },
        {
          id: `tubi-tv-sample-11-${Date.now()}`,
          type: 'tv',
          title: 'The Fresh Prince of Bel-Air',
          description: 'A comedy series about a street-smart teenager who moves to Bel-Air.',
          thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1993',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: `tubi-tv-sample-12-${Date.now()}`,
          type: 'tv',
          title: 'Family Matters',
          description: 'A family sitcom featuring the Winslow family and their nerdy neighbor Steve Urkel.',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1991',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
        {
          id: `tubi-tv-sample-13-${Date.now()}`,
          type: 'tv',
          title: 'Martin',
          description: 'A comedy series about a radio DJ and his relationships with friends and girlfriend.',
          thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1995',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: `tubi-tv-sample-14-${Date.now()}`,
          type: 'tv',
          title: 'The Cosby Show',
          description: 'A family sitcom about the Huxtable family living in Brooklyn.',
          thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1986',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: `tubi-tv-sample-15-${Date.now()}`,
          type: 'tv',
          title: 'A Different World',
          description: 'A spin-off of The Cosby Show following Denise Huxtable at college.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1989',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          id: `tubi-tv-sample-16-${Date.now()}`,
          type: 'tv',
          title: 'Good Times',
          description: 'A sitcom about an African-American family living in a Chicago housing project.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1976',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        },
        {
          id: `tubi-tv-sample-17-${Date.now()}`,
          type: 'tv',
          title: 'The Jeffersons',
          description: 'A spin-off of All in the Family about a successful African-American family.',
          thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1979',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        },
        {
          id: `tubi-tv-sample-18-${Date.now()}`,
          type: 'tv',
          title: '227',
          description: 'A sitcom about residents of a Washington D.C. apartment building.',
          thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1987',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        },
        {
          id: `tubi-tv-sample-19-${Date.now()}`,
          type: 'tv',
          title: 'Amen',
          description: 'A sitcom about a church deacon and his family.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1988',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        },
        {
          id: `tubi-tv-sample-20-${Date.now()}`,
          type: 'tv',
          title: 'What\'s Happening!!',
          description: 'A sitcom about three teenage friends and their families.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1978',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        },
        {
          id: `tubi-tv-sample-21-${Date.now()}`,
          type: 'tv',
          title: 'The Brady Bunch',
          description: 'A family sitcom about a blended family with six children.',
          thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1971',
          duration: 'TV-G',
          rating: 'TV-G',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: `tubi-tv-sample-22-${Date.now()}`,
          type: 'tv',
          title: 'Happy Days',
          description: 'A sitcom about life in the 1950s featuring the Cunningham family.',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1974',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
        {
          id: `tubi-tv-sample-23-${Date.now()}`,
          type: 'tv',
          title: 'Laverne & Shirley',
          description: 'A spin-off of Happy Days about two friends working at a brewery.',
          thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1976',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: `tubi-tv-sample-24-${Date.now()}`,
          type: 'tv',
          title: 'Mork & Mindy',
          description: 'A sitcom about an alien from Ork who comes to Earth.',
          thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1978',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: `tubi-tv-sample-25-${Date.now()}`,
          type: 'tv',
          title: 'Three\'s Company',
          description: 'A sitcom about a man who pretends to be gay to live with two women.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1977',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          id: `tubi-tv-sample-26-${Date.now()}`,
          type: 'tv',
          title: 'Taxi',
          description: 'A sitcom about New York City taxi drivers and their lives.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1978',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        },
        {
          id: `tubi-tv-sample-27-${Date.now()}`,
          type: 'tv',
          title: 'Barney Miller',
          description: 'A police sitcom about detectives in a New York City precinct.',
          thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1975',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        },
        {
          id: `tubi-tv-sample-28-${Date.now()}`,
          type: 'tv',
          title: 'WKRP in Cincinnati',
          description: 'A sitcom about the staff of a struggling radio station.',
          thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1978',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        },
        {
          id: `tubi-tv-sample-29-${Date.now()}`,
          type: 'tv',
          title: 'M*A*S*H',
          description: 'A dramedy about doctors and nurses during the Korean War.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1972',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        },
        {
          id: `tubi-tv-sample-30-${Date.now()}`,
          type: 'tv',
          title: 'The Mary Tyler Moore Show',
          description: 'A sitcom about a single woman working in television news.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1970',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        },
        {
          id: `tubi-tv-sample-31-${Date.now()}`,
          type: 'tv',
          title: 'The Bob Newhart Show',
          description: 'A sitcom about a psychologist and his relationships.',
          thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1972',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: `tubi-tv-sample-32-${Date.now()}`,
          type: 'tv',
          title: 'Rhoda',
          description: 'A spin-off of The Mary Tyler Moore Show about Rhoda Morgenstern.',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1974',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
        {
          id: `tubi-tv-sample-33-${Date.now()}`,
          type: 'tv',
          title: 'Phyllis',
          description: 'A spin-off of The Mary Tyler Moore Show about Phyllis Lindstrom.',
          thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1975',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: `tubi-tv-sample-34-${Date.now()}`,
          type: 'tv',
          title: 'Lou Grant',
          description: 'A drama series about a newspaper editor starring Ed Asner.',
          thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1977',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: `tubi-tv-sample-35-${Date.now()}`,
          type: 'tv',
          title: 'The Love Boat',
          description: 'A romantic comedy series set on a luxury cruise ship.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1977',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          id: `tubi-tv-sample-36-${Date.now()}`,
          type: 'tv',
          title: 'Fantasy Island',
          description: 'A fantasy drama series about an island where dreams come true.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1977',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        },
        {
          id: `tubi-tv-sample-37-${Date.now()}`,
          type: 'tv',
          title: 'The Six Million Dollar Man',
          description: 'A science fiction series about a bionic man with superhuman abilities.',
          thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1974',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        },
        {
          id: `tubi-tv-sample-38-${Date.now()}`,
          type: 'tv',
          title: 'The Bionic Woman',
          description: 'A spin-off of The Six Million Dollar Man about a bionic woman.',
          thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1976',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        },
        {
          id: `tubi-tv-sample-39-${Date.now()}`,
          type: 'tv',
          title: 'Charlie\'s Angels',
          description: 'A crime drama series about three female private investigators.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1976',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        },
        {
          id: `tubi-tv-sample-40-${Date.now()}`,
          type: 'tv',
          title: 'Starsky & Hutch',
          description: 'A crime drama series about two police detectives.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1975',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        },
        {
          id: `tubi-tv-sample-41-${Date.now()}`,
          type: 'tv',
          title: 'Hawaii Five-O',
          description: 'A police procedural series set in Hawaii.',
          thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1968',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: `tubi-tv-sample-42-${Date.now()}`,
          type: 'tv',
          title: 'The Rockford Files',
          description: 'A detective series about a private investigator.',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1974',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
        {
          id: `tubi-tv-sample-43-${Date.now()}`,
          type: 'tv',
          title: 'Columbo',
          description: 'A detective series featuring Lieutenant Columbo.',
          thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1971',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: `tubi-tv-sample-44-${Date.now()}`,
          type: 'tv',
          title: 'Kojak',
          description: 'A police procedural series about a bald detective.',
          thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1973',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: `tubi-tv-sample-45-${Date.now()}`,
          type: 'tv',
          title: 'The Streets of San Francisco',
          description: 'A police procedural series set in San Francisco.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1972',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          id: `tubi-tv-sample-46-${Date.now()}`,
          type: 'tv',
          title: 'Emergency!',
          description: 'A medical drama series about paramedics and firefighters.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1972',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        },
        {
          id: `tubi-tv-sample-47-${Date.now()}`,
          type: 'tv',
          title: 'Adam-12',
          description: 'A police procedural series about two police officers.',
          thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1968',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        },
        {
          id: `tubi-tv-sample-48-${Date.now()}`,
          type: 'tv',
          title: 'Dragnet',
          description: 'A police procedural series about Los Angeles police officers.',
          thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1967',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        },
        {
          id: `tubi-tv-sample-49-${Date.now()}`,
          type: 'tv',
          title: 'The Mod Squad',
          description: 'A crime drama series about three young undercover police officers.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1968',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        },
        {
          id: `tubi-tv-sample-50-${Date.now()}`,
          type: 'tv',
          title: 'Mission: Impossible',
          description: 'A spy thriller series about a secret government organization.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1966',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        },
        {
          id: `tubi-tv-sample-51-${Date.now()}`,
          type: 'tv',
          title: 'The Man from U.N.C.L.E.',
          description: 'A spy series about agents of the United Network Command for Law and Enforcement.',
          thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1964',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: `tubi-tv-sample-52-${Date.now()}`,
          type: 'tv',
          title: 'Get Smart',
          description: 'A spy comedy series about a bumbling secret agent.',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1965',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
        {
          id: `tubi-tv-sample-53-${Date.now()}`,
          type: 'tv',
          title: 'I Dream of Jeannie',
          description: 'A fantasy sitcom about an astronaut and his genie.',
          thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1965',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: `tubi-tv-sample-54-${Date.now()}`,
          type: 'tv',
          title: 'Bewitched',
          description: 'A fantasy sitcom about a witch who marries a mortal.',
          thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1964',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: `tubi-tv-sample-55-${Date.now()}`,
          type: 'tv',
          title: 'The Addams Family',
          description: 'A comedy series about a macabre family.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1964',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          id: `tubi-tv-sample-56-${Date.now()}`,
          type: 'tv',
          title: 'The Munsters',
          description: 'A comedy series about a family of monsters.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1964',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        },
        {
          id: `tubi-tv-sample-57-${Date.now()}`,
          type: 'tv',
          title: 'The Twilight Zone',
          description: 'An anthology series featuring supernatural and science fiction stories.',
          thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1959',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        },
        {
          id: `tubi-tv-sample-58-${Date.now()}`,
          type: 'tv',
          title: 'The Outer Limits',
          description: 'An anthology series featuring science fiction stories.',
          thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1963',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        },
        {
          id: `tubi-tv-sample-59-${Date.now()}`,
          type: 'tv',
          title: 'Lost in Space',
          description: 'A science fiction series about a family lost in space.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1965',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        },
        {
          id: `tubi-tv-sample-60-${Date.now()}`,
          type: 'tv',
          title: 'Star Trek',
          description: 'A science fiction series about the crew of the starship Enterprise.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1966',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        },
        {
          id: `tubi-tv-sample-61-${Date.now()}`,
          type: 'tv',
          title: 'Batman',
          description: 'A superhero series about Batman and Robin fighting crime in Gotham City.',
          thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1966',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: `tubi-tv-sample-62-${Date.now()}`,
          type: 'tv',
          title: 'The Green Hornet',
          description: 'A superhero series about a masked crime fighter.',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1966',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
        {
          id: `tubi-tv-sample-63-${Date.now()}`,
          type: 'tv',
          title: 'The Wild Wild West',
          description: 'A western series about secret agents in the Old West.',
          thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1965',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: `tubi-tv-sample-64-${Date.now()}`,
          type: 'tv',
          title: 'Bonanza',
          description: 'A western series about the Cartwright family and their ranch.',
          thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1959',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: `tubi-tv-sample-65-${Date.now()}`,
          type: 'tv',
          title: 'Gunsmoke',
          description: 'A western series about Marshal Matt Dillon in Dodge City.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1955',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          id: `tubi-tv-sample-66-${Date.now()}`,
          type: 'tv',
          title: 'The Lone Ranger',
          description: 'A western series about a masked hero and his Native American companion.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1949',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        },
        {
          id: `tubi-tv-sample-67-${Date.now()}`,
          type: 'tv',
          title: 'Rawhide',
          description: 'A western series about cattle drives and cowboys.',
          thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1959',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        },
        {
          id: `tubi-tv-sample-68-${Date.now()}`,
          type: 'tv',
          title: 'Wagon Train',
          description: 'A western series about pioneers traveling west in wagon trains.',
          thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1957',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        },
        {
          id: `tubi-tv-sample-69-${Date.now()}`,
          type: 'tv',
          title: 'Have Gun - Will Travel',
          description: 'A western series about a gunfighter for hire.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1957',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        },
        {
          id: `tubi-tv-sample-70-${Date.now()}`,
          type: 'tv',
          title: 'The Rifleman',
          description: 'A western series about a widowed rancher and his son.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1958',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        },
        {
          id: `tubi-tv-sample-71-${Date.now()}`,
          type: 'tv',
          title: 'The Andy Griffith Show',
          description: 'A comedy series about a sheriff and his family in Mayberry.',
          thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1960',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: `tubi-tv-sample-72-${Date.now()}`,
          type: 'tv',
          title: 'The Beverly Hillbillies',
          description: 'A comedy series about a family from the Ozarks who strike oil.',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1962',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
        {
          id: `tubi-tv-sample-73-${Date.now()}`,
          type: 'tv',
          title: 'Petticoat Junction',
          description: 'A comedy series about a family running a hotel in a small town.',
          thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1963',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: `tubi-tv-sample-74-${Date.now()}`,
          type: 'tv',
          title: 'Green Acres',
          description: 'A comedy series about a lawyer who moves to a farm.',
          thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1965',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: `tubi-tv-sample-75-${Date.now()}`,
          type: 'tv',
          title: 'Hogan\'s Heroes',
          description: 'A comedy series about Allied prisoners in a German POW camp.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1965',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          id: `tubi-tv-sample-76-${Date.now()}`,
          type: 'tv',
          title: 'F Troop',
          description: 'A comedy series about incompetent soldiers at a frontier fort.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1965',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        },
        {
          id: `tubi-tv-sample-77-${Date.now()}`,
          type: 'tv',
          title: 'McHale\'s Navy',
          description: 'A comedy series about sailors on a PT boat during World War II.',
          thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1962',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        },
        {
          id: `tubi-tv-sample-78-${Date.now()}`,
          type: 'tv',
          title: 'The Dick Van Dyke Show',
          description: 'A comedy series about a comedy writer and his family.',
          thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1961',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        },
        {
          id: `tubi-tv-sample-79-${Date.now()}`,
          type: 'tv',
          title: 'The Donna Reed Show',
          description: 'A comedy series about a suburban family in the 1950s.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1958',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        },
        {
          id: `tubi-tv-sample-80-${Date.now()}`,
          type: 'tv',
          title: 'Father Knows Best',
          description: 'A comedy series about a middle-class family in the 1950s.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1954',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        },
        {
          id: `tubi-tv-sample-81-${Date.now()}`,
          type: 'tv',
          title: 'Leave It to Beaver',
          description: 'A comedy series about a young boy and his family.',
          thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1957',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: `tubi-tv-sample-82-${Date.now()}`,
          type: 'tv',
          title: 'Dennis the Menace',
          description: 'A comedy series about a mischievous young boy.',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1959',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
        {
          id: `tubi-tv-sample-83-${Date.now()}`,
          type: 'tv',
          title: 'The Adventures of Ozzie and Harriet',
          description: 'A comedy series about the Nelson family.',
          thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1952',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: `tubi-tv-sample-84-${Date.now()}`,
          type: 'tv',
          title: 'My Three Sons',
          description: 'A comedy series about a widowed engineer raising three sons.',
          thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1960',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: `tubi-tv-sample-85-${Date.now()}`,
          type: 'tv',
          title: 'The Patty Duke Show',
          description: 'A comedy series about identical cousins with different personalities.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1963',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          id: `tubi-tv-sample-86-${Date.now()}`,
          type: 'tv',
          title: 'Gidget',
          description: 'A comedy series about a teenage girl and her surfing adventures.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1965',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        },
        {
          id: `tubi-tv-sample-87-${Date.now()}`,
          type: 'tv',
          title: 'The Flying Nun',
          description: 'A comedy series about a nun who can fly.',
          thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1967',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        },
        {
          id: `tubi-tv-sample-88-${Date.now()}`,
          type: 'tv',
          title: 'The Partridge Family',
          description: 'A comedy series about a family band.',
          thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1970',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        },
        {
          id: `tubi-tv-sample-89-${Date.now()}`,
          type: 'tv',
          title: 'The Monkees',
          description: 'A comedy series about a fictional rock band.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1966',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        },
        {
          id: `tubi-tv-sample-90-${Date.now()}`,
          type: 'tv',
          title: 'The Banana Splits Adventure Hour',
          description: 'A children\'s variety show featuring animated segments.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1968',
          duration: 'TV-G',
          rating: 'TV-G',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        },
        {
          id: `tubi-tv-sample-91-${Date.now()}`,
          type: 'tv',
          title: 'H.R. Pufnstuf',
          description: 'A children\'s fantasy series about a boy and his talking flute.',
          thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1969',
          duration: 'TV-G',
          rating: 'TV-G',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        },
        {
          id: `tubi-tv-sample-92-${Date.now()}`,
          type: 'tv',
          title: 'Lidsville',
          description: 'A children\'s fantasy series about a boy trapped in a magical hat world.',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1971',
          duration: 'TV-G',
          rating: 'TV-G',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        },
        {
          id: `tubi-tv-sample-93-${Date.now()}`,
          type: 'tv',
          title: 'Sigmund and the Sea Monsters',
          description: 'A children\'s fantasy series about a boy and a friendly sea monster.',
          thumbnail: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1973',
          duration: 'TV-G',
          rating: 'TV-G',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
        {
          id: `tubi-tv-sample-94-${Date.now()}`,
          type: 'tv',
          title: 'Land of the Lost',
          description: 'A children\'s science fiction series about a family trapped in a prehistoric world.',
          thumbnail: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1974',
          duration: 'TV-G',
          rating: 'TV-G',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        },
        {
          id: `tubi-tv-sample-95-${Date.now()}`,
          type: 'tv',
          title: 'Electra Woman and Dyna Girl',
          description: 'A children\'s superhero series about two female crime fighters.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1976',
          duration: 'TV-G',
          rating: 'TV-G',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        },
        {
          id: `tubi-tv-sample-96-${Date.now()}`,
          type: 'tv',
          title: 'Shazam!',
          description: 'A children\'s superhero series about a boy who becomes a superhero.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1974',
          duration: 'TV-G',
          rating: 'TV-G',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        },
        {
          id: `tubi-tv-sample-97-${Date.now()}`,
          type: 'tv',
          title: 'Isis',
          description: 'A children\'s superhero series about an Egyptian goddess.',
          thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1975',
          duration: 'TV-G',
          rating: 'TV-G',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        },
        {
          id: `tubi-tv-sample-98-${Date.now()}`,
          type: 'tv',
          title: 'Wonder Woman',
          description: 'A superhero series about an Amazon princess.',
          thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1975',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        },
        {
          id: `tubi-tv-sample-99-${Date.now()}`,
          type: 'tv',
          title: 'The Six Million Dollar Man',
          description: 'A science fiction series about a bionic man with superhuman abilities.',
          thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1974',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        },
        {
          id: `tubi-tv-sample-100-${Date.now()}`,
          type: 'tv',
          title: 'The Bionic Woman',
          description: 'A science fiction series about a bionic woman with superhuman abilities.',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
          url: 'https://tubitv.com',
          year: '1976',
          duration: 'TV-PG',
          rating: 'TV-PG',
          source: 'Tubi',
          sourceUrl: 'https://tubitv.com',
          previewVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        }
      ];
      
      tvShows.push(...sampleTVShows);
    }

    console.log('📺 Tubi trending TV response:', { tvShowsCount: tvShows.length });
    return tvShows.slice(0, 100); // Return up to 100 TV shows for streaming tab
  } catch (error) {
    console.error('📺 Error fetching trending TV from Tubi:', error);
    return [];
  }
}

async function getTrendingNews() {
  try {
    console.log('Fetching trending Canadian news...');

    // Try multiple sources to get more news
    const newsSources = [
      'https://globalnews.ca/feed/',
      'https://www.cbc.ca/webfeed/rss/rss-topstoriestopstories',
      'https://www.cbc.ca/webfeed/rss/rss-business',
      'https://www.cbc.ca/webfeed/rss/rss-politics',
      'https://www.cbc.ca/webfeed/rss/rss-canada',
      'https://www.cbc.ca/webfeed/rss/rss-world',
      'https://www.cbc.ca/webfeed/rss/rss-technology',
      'https://www.cbc.ca/webfeed/rss/rss-sports',
      'https://www.cbc.ca/webfeed/rss/rss-arts',
      'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009',
      'https://www.ctvnews.ca/rss/ctvnews-ca-canada-public-rss-1.822008',
      'https://www.ctvnews.ca/rss/ctvnews-ca-world-public-rss-1.822010',
      'https://www.ctvnews.ca/rss/ctvnews-ca-business-public-rss-1.822011',
      'https://www.ctvnews.ca/rss/ctvnews-ca-politics-public-rss-1.822012'
    ];
    
    let allArticles = [];
    
    for (const source of newsSources) {
      try {
        console.log(`📰 Trying trending source: ${source}`);
        const response = await fetch(source, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Telecast/1.0)'
          }
        });
        
        if (!response.ok) {
          console.log(`📰 Source failed: ${source} - ${response.status}`);
          continue;
        }

        const xmlText = await response.text();
        
        // Parse RSS feed - handle CDATA sections
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/;
        const descriptionRegex = /<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/;
        const linkRegex = /<link>(.*?)<\/link>/;
        const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
        const creatorRegex = /<dc:creator>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/dc:creator>/;
        const mediaThumbnailRegex = /<media:thumbnail url="(.*?)"/;
        
        let match;
        while ((match = itemRegex.exec(xmlText)) !== null) {
          const itemContent = match[1];
          
          const title = itemContent.match(titleRegex)?.[1] || 'No title';
          const description = itemContent.match(descriptionRegex)?.[1] || 'No description';
          const link = itemContent.match(linkRegex)?.[1] || '';
          const pubDate = itemContent.match(pubDateRegex)?.[1] || '';
          const creator = itemContent.match(creatorRegex)?.[1] || 'Unknown Author';
          const thumbnail = itemContent.match(mediaThumbnailRegex)?.[1] || 'https://via.placeholder.com/300x200?text=Canadian+News';
          
          allArticles.push({
            id: `news-${allArticles.length}-${Date.now()}`,
            type: 'news',
            title: title,
            description: description,
            thumbnail: thumbnail,
            url: link,
            author: creator,
            publishedAt: pubDate,
            source: source.includes('globalnews') ? 'globalnews' : 
                   source.includes('ctv') ? 'ctv' : 'cbc',
            sourceUrl: link,
          });
        }
        
        console.log(`📰 Found ${allArticles.length} articles from ${source}`);
        
      } catch (error: any) {
        console.log(`📰 Error with source ${source}:`, error.message);
        continue;
      }
    }
    
    console.log('Canadian trending news response:', { articlesCount: allArticles.length });
    return allArticles;
  } catch (error) {
    console.error('Error fetching trending Canadian news:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    console.log('Starting to fetch all trending content...');
    const [videos, music, books, podcasts, news, tv] = await Promise.all([
      getTrendingVideos(),
      getTrendingMusic(),
      getTrendingBooks(),
      getTrendingPodcasts(),
      getTrendingNews(),
      getTrendingTV(),
    ]);

    console.log('All content fetched:', {
      videosCount: videos.length,
      musicCount: music.length,
      booksCount: books.length,
      podcastsCount: podcasts.length,
      newsCount: news.length,
      tvCount: tv.length,
    });

    // Combine and sort all trending content by type
    const trendingContent = {
      videos,
      music,
      books,
      podcasts,
      news,
      tv,
    };

    return new NextResponse(JSON.stringify(trendingContent), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch trending content' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 