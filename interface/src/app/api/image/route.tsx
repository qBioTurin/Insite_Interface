import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const flaskUrl = `http://simulator:5000/download_image`;

  try {
    const response = await fetch(flaskUrl);

    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline'
      }
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
