import { NextRequest, NextResponse } from 'next/server';

const backendUrl =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  
  try {
    // Create abort controller for timeout (5 minutes)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);
    
    const response = await fetch(`${backendUrl}/api/image-flow`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const payload = await response.text();
    return new NextResponse(payload, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (error) {
    // Handle network errors, timeouts, and connection resets
    const isAbortError = error instanceof Error && error.name === 'AbortError';
    const isConnectionReset =
      error instanceof Error &&
      ('code' in error || error.message.includes('ECONNRESET') || error.message.includes('fetch failed'));
    
    const errorMessage = isAbortError
      ? 'Request timeout - the image generation is taking too long. Please try again.'
      : isConnectionReset
      ? 'Connection to backend failed. Please ensure the backend server is running on port 4000 and try again.'
      : error instanceof Error
      ? `Network error: ${error.message}`
      : 'Unknown error occurred while processing the request';
    
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

