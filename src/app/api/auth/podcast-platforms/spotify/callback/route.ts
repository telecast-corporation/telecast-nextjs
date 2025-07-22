import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/podcast-platforms';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Spotify OAuth error:', error);
      return NextResponse.redirect(new URL('/broadcast?error=spotify_oauth_failed&message=Spotify authorization was denied', req.url));
    }

    if (!code || !state) {
      console.error('Missing code or state in Spotify callback');
      return NextResponse.redirect(new URL('/broadcast?error=spotify_oauth_failed&message=Invalid callback parameters', req.url));
    }

    // Decode state to get user ID
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const userId = stateData.userId;

    if (!userId) {
      console.error('No user ID in state');
      return NextResponse.redirect(new URL('/broadcast?error=spotify_oauth_failed&message=Invalid user session', req.url));
    }

    console.log('Processing Spotify OAuth callback for user:', userId);

    // Exchange code for tokens
    const tokens = await exchangeCodeForToken('spotify', code);
    
    if (!tokens.access_token) {
      console.error('No access token received from Spotify');
      return NextResponse.redirect(new URL('/broadcast?error=spotify_oauth_failed&message=Failed to get access token', req.url));
    }

    // Store tokens in database
    await prisma.platformConnection.upsert({
      where: {
        userId_platform: {
          userId,
          platform: 'spotify'
        }
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        updatedAt: new Date()
      },
      create: {
        userId,
        platform: 'spotify',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
      }
    });

    console.log('Spotify connection saved for user:', userId);

    // Redirect back to broadcast page with success
    return NextResponse.redirect(new URL('/broadcast?success=spotify_connected', req.url));
  } catch (error) {
    console.error('Error processing Spotify callback:', error);
    return NextResponse.redirect(new URL('/broadcast?error=spotify_oauth_failed&message=Failed to complete Spotify connection', req.url));
  }
} 