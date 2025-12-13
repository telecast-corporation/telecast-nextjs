import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string | string[] } }
) {
  try {
    const pathSegments = Array.isArray(params.path) ? params.path : [params.path];
    const path = pathSegments.join('/');
    
    console.log('=== AUDIO PROXY DEBUG ===');
    console.log('Original path parameter:', path);
    
    // Decode the path parameter - handle multiple levels of encoding
    let decodedPath = decodeURIComponent(path);
    // Handle double encoding
    if (decodedPath.includes('%')) {
      decodedPath = decodeURIComponent(decodedPath);
    }
    
    console.log('Decoded path:', decodedPath);
    console.log('Is GCS path:', decodedPath.includes('storage.googleapis.com'));
    
    // Check if we have an original URL in the query parameters
    const originalUrl = request.nextUrl.searchParams.get('originalUrl');
    let audioUrl: string;
    
    if (originalUrl) {
      console.log('Using original URL from query parameter');
      audioUrl = originalUrl;
    } else {
      console.log('Using decoded path as direct GCS URL');
      // If the path is already a full GCS URL, use it directly
      if (decodedPath.startsWith('https://storage.googleapis.com/')) {
        audioUrl = decodedPath;
      } else {
        // Construct the GCS URL from the path
        const bucketName = process.env.GOOGLE_CLOUD_PODCAST_BUCKET_NAME;
        audioUrl = `https://storage.googleapis.com/${bucketName}/${decodedPath}`;
      }
    }
    
    // Check for range request
    const range = request.headers.get('range');
    console.log('Range header:', range);
    
    // Fetch the audio file from Google Cloud Storage
    console.log('Fetching from GCS URL:', audioUrl);
    
    const fetchOptions: RequestInit = {};
    if (range) {
      fetchOptions.headers = { 'Range': range };
    }
    
    const response = await fetch(audioUrl, fetchOptions);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('Failed to fetch audio file:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to fetch audio file' }, { status: 404 });
    }
    
    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    console.log('Audio buffer size:', audioBuffer.byteLength, 'bytes');
    console.log('Content type from GCS:', response.headers.get('content-type'));
    console.log('Content length from GCS:', response.headers.get('content-length'));
    
    // Determine content type from the file extension
    let contentType = 'audio/mpeg'; // default
    if (decodedPath.endsWith('.wav')) {
      contentType = 'audio/wav';
    } else if (decodedPath.endsWith('.mp3')) {
      contentType = 'audio/mpeg';
    } else if (decodedPath.endsWith('.m4a')) {
      contentType = 'audio/mp4';
    } else if (decodedPath.endsWith('.ogg')) {
      contentType = 'audio/ogg';
    }
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': audioBuffer.byteLength.toString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Range, Accept-Ranges',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    };

    // For audio files, always return the full file to ensure proper metadata reading
    // Browsers need the full file to read audio duration and format information
    if (range && response.status === 206) {
      console.log('Range request detected, fetching full file for audio metadata');
      
      // Fetch the full file without range header
      const fullResponse = await fetch(audioUrl);
      if (fullResponse.ok) {
        const fullBuffer = await fullResponse.arrayBuffer();
        console.log('Full file fetched, size:', fullBuffer.byteLength, 'bytes');
        
        return new NextResponse(fullBuffer, {
          status: 200,
          headers: {
            ...headers,
            'Content-Length': fullBuffer.byteLength.toString(),
          },
        });
      }
    }

    // Return the audio file with proper CORS headers
    console.log('Returning full response with status 200');
    return new NextResponse(audioBuffer, {
      status: 200,
      headers,
    });
    
  } catch (error) {
    console.error('Audio proxy error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to serve audio file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Range, Accept-Ranges',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    },
  });
}
