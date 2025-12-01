import { NextRequest, NextResponse } from 'next/server';

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');
  const imageKey = searchParams.get('key');

  if (!imageUrl && !imageKey) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing required query parameter: url or key' }),
      {
        status: 400,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }

  try {
    // Build query string - prefer key over URL
    const queryParam = imageKey 
      ? `key=${encodeURIComponent(imageKey)}`
      : `url=${encodeURIComponent(imageUrl!)}`;
    
    // Proxy the request to the backend
    const response = await fetch(`${backendUrl}/api/image-proxy?${queryParam}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText, {
        status: response.status,
        headers: {
          'content-type': 'application/json',
        },
      });
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=31536000, immutable',
        'access-control-allow-origin': '*',
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `Network error: ${error.message}`
        : 'Unknown error occurred while fetching image';

    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
        },
      },
    );
  }
}

