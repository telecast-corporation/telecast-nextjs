export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/podcast-platforms';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    if (error) {
      return NextResponse.redirect(`${baseUrl}/broadcast?error=spotify_auth_failed&message=${error}`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/broadcast?error=spotify_no_code`);
    }

    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(`${baseUrl}/broadcast?error=unauthorized`);
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken('spotify', code);

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${baseUrl}/broadcast?error=spotify_token_failed`);
    }

    // Store the access token in the database
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'spotify',
          providerAccountId: session.user.id,
        },
      },
      update: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
        scope: tokenData.scope,
      },
      create: {
        userId: session.user.id,
        type: 'oauth',
        provider: 'spotify',
        providerAccountId: session.user.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
        scope: tokenData.scope,
      },
    });

    return NextResponse.redirect(`${baseUrl}/broadcast?success=spotify_connected`);
  } catch (error) {
    console.error('Spotify OAuth callback error:', error);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/broadcast?error=spotify_callback_failed`);
  }
} 