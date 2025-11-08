import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for fetching recent trades from Polymarket CLOB
 * 
 * Endpoint: GET /api/trades?tokenId=<token_id>&limit=<number>
 * 
 * Documentation: https://docs.polymarket.com/developers/CLOB/trades
 */

const CLOB_API_URL = 'https://clob.polymarket.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tokenId = searchParams.get('tokenId');
    const limit = searchParams.get('limit') || '20';

    if (!tokenId) {
      return NextResponse.json(
        { error: 'tokenId parameter is required' },
        { status: 400 }
      );
    }

    // Fetch trades from CLOB API
    const response = await fetch(
      `${CLOB_API_URL}/trades?token_id=${tokenId}&limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store', // Disable caching for real-time data
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `CLOB API returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const trades = await response.json();

    return NextResponse.json({
      success: true,
      trades,
      count: trades.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch trades',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

