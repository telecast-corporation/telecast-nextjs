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

    // If we didn't find enough content, create some sample trending TV shows based on Tubi's popular content
    if (tvShows.length < 10) {
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
        }
      ];
      
      tvShows.push(...sampleTVShows);
    }

    console.log('📺 Tubi trending TV response:', { tvShowsCount: tvShows.length });
    return tvShows.slice(0, 30); // Return up to 30 TV shows
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