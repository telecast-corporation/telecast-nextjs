import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth0-user';

export async function GET(req: NextRequest) {
  try {
    // Ensure user is authenticated
    const user = await getOrCreateUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Auth0 Management API token
    const managementToken = await getManagementApiToken();
    if (!managementToken) {
      return NextResponse.json({ error: 'Failed to get management token' }, { status: 500 });
    }

    // Get user's identity provider tokens from Auth0
    const userProfile = await getUserProfile(user.auth0Id!, managementToken);
    if (!userProfile) {
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 });
    }

    // Find Spotify identity
    const spotifyIdentity = userProfile.identities?.find(
      (identity: any) => identity.provider === 'spotify'
    );

    if (!spotifyIdentity || !spotifyIdentity.access_token) {
      return NextResponse.json({ 
        connected: false, 
        message: 'Spotify not connected' 
      });
    }

    return NextResponse.json({
      connected: true,
      accessToken: spotifyIdentity.access_token,
      refreshToken: spotifyIdentity.refresh_token,
      expiresAt: spotifyIdentity.expires_at
    });

  } catch (error) {
    console.error('Error getting Spotify token:', error);
    return NextResponse.json(
      { error: 'Error getting Spotify token' },
      { status: 500 }
    );
  }
}

async function getManagementApiToken(): Promise<string | null> {
  try {
    // Debug environment variables
    console.log('Environment variables check:');
    console.log('AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);
    console.log('AUTH0_MANAGEMENT_CLIENT_ID:', process.env.AUTH0_MANAGEMENT_CLIENT_ID ? 'Set' : 'Not set');
    console.log('AUTH0_MANAGEMENT_CLIENT_SECRET:', process.env.AUTH0_MANAGEMENT_CLIENT_SECRET ? 'Set' : 'Not set');

    // Validate required environment variables
    if (!process.env.AUTH0_DOMAIN) {
      console.error('AUTH0_DOMAIN is not set');
      return null;
    }

    if (!process.env.AUTH0_MANAGEMENT_CLIENT_ID || !process.env.AUTH0_MANAGEMENT_CLIENT_SECRET) {
      console.error('AUTH0_MANAGEMENT_CLIENT_ID or AUTH0_MANAGEMENT_CLIENT_SECRET is not set');
      return null;
    }

    const tokenUrl = `${process.env.AUTH0_DOMAIN}/oauth/token`;
    
    console.log('Making request to:', tokenUrl);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
        client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
        audience: `${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials',
        scope: 'read:user_idp_tokens'
      }),
    });

    if (!response.ok) {
      console.error('Failed to get management token:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting management token:', error);
    return null;
  }
}

async function getUserProfile(auth0Id: string, managementToken: string): Promise<any> {
  try {
    const userUrl = `${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(auth0Id)}`;
    
    console.log('Getting user profile from:', userUrl);

    const response = await fetch(userUrl, {
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to get user profile:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
} 