import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Only show this in development or if explicitly enabled
  const isDev = process.env.NODE_ENV === 'development';
  const showDebug = process.env.ENABLE_DEBUG === 'true';
  
  if (!isDev && !showDebug) {
    return NextResponse.json({ error: 'Debug endpoint disabled in production' }, { status: 403 });
  }

  const envInfo = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    hasGoogleBooksApiKey: !!process.env.GOOGLE_BOOKS_API_KEY,
    googleBooksApiKeyLength: process.env.GOOGLE_BOOKS_API_KEY?.length,
    googleBooksApiKeyPrefix: process.env.GOOGLE_BOOKS_API_KEY?.substring(0, 10) + '...',
    hasYouTubeApiKey: !!process.env.YOUTUBE_API_KEY,
    hasSpotifyClientId: !!process.env.SPOTIFY_CLIENT_ID,
    hasSpotifyClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
    hasPodcastIndexApiKey: !!process.env.PODCASTINDEX_API_KEY,
    allGoogleKeys: Object.keys(process.env).filter(key => key.includes('GOOGLE')),
    allApiKeys: Object.keys(process.env).filter(key => key.includes('API')),
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(envInfo);
} 