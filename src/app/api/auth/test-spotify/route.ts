import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state');

    console.log('Spotify OAuth Debug Info:');
    console.log('Error:', error);
    console.log('Error Description:', errorDescription);
    console.log('State:', state);

    if (error) {
      return NextResponse.json({
        error,
        errorDescription: decodeURIComponent(errorDescription || ''),
        state,
        message: 'Spotify OAuth failed'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Spotify OAuth successful'
    });

  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Test endpoint error' },
      { status: 500 }
    );
  }
} 