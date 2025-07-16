export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/podcast-platforms';

export async function GET() {
  try {
    const authUrl = generateAuthUrl('google');
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/broadcast?error=google_auth_url_failed`);
  }
} 