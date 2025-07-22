import { NextRequest, NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/podcast-platforms';
import { getOrCreateUser } from '@/lib/auth0-user';

export async function GET(req: NextRequest) {
  try {
    // Ensure user is authenticated
    const user = await getOrCreateUser(req);
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Generate Spotify OAuth URL
    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');
    const authUrl = generateAuthUrl('spotify', state);

    console.log('Redirecting to Spotify OAuth:', authUrl);

    // Redirect to Spotify
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Spotify OAuth:', error);
    return NextResponse.redirect(new URL('/broadcast?error=spotify_oauth_failed&message=Failed to connect to Spotify', req.url));
  }
} 