// src/app/api/placeholder/[width]/[height]/route.ts
import { NextRequest, NextResponse } from 'next/server';

type Params = {
  params: {
    width: string;
    height: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    // Parse width and height from params - ensure they're strings first
    const widthStr = params?.width || '600';
    const heightStr = params?.height || '400';
    
    const width = parseInt(widthStr, 10) || 600;
    const height = parseInt(heightStr, 10) || 400;

    // Limit dimensions to reasonable values
    const safeWidth = Math.min(Math.max(width, 50), 1200);
    const safeHeight = Math.min(Math.max(height, 50), 800);

    // Create an SVG placeholder image
    const svg = `
      <svg width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}" 
           xmlns="http://www.w3.org/2000/svg">
        <rect width="${safeWidth}" height="${safeHeight}" fill="#E5E7EB"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="system-ui, sans-serif" font-size="16px" fill="#94A3B8">
          Gambar tidak tersedia (${safeWidth}x${safeHeight})
        </text>
      </svg>
    `;

    // Return the SVG as an image
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating placeholder image:', error);
    
    // Return a fallback SVG in case of error
    const fallbackSvg = `
      <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#E5E7EB"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="system-ui, sans-serif" font-size="16px" fill="#94A3B8">
          Gambar tidak tersedia
        </text>
      </svg>
    `;
    
    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }
}