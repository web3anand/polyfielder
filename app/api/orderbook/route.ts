import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for fetching orderbook data from Polymarket CLOB
 * 
 * Endpoint: GET /api/orderbook?tokenId=<token_id>
 * 
 * Documentation: https://docs.polymarket.com/developers/CLOB/orderbook
 */

const CLOB_API_URL = 'https://clob.polymarket.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
      return NextResponse.json(
        { error: 'tokenId parameter is required' },
        { status: 400 }
      );
    }

    // Fetch orderbook from CLOB API
    const response = await fetch(`${CLOB_API_URL}/book?token_id=${tokenId}`, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Disable caching for real-time data
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `CLOB API returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const orderbook = await response.json();

    // Calculate additional metrics
    const bestBid = orderbook.bids && orderbook.bids.length > 0
      ? parseFloat(orderbook.bids[0].price)
      : 0;
    
    const bestAsk = orderbook.asks && orderbook.asks.length > 0
      ? parseFloat(orderbook.asks[0].price)
      : 0;
    
    const spread = bestAsk - bestBid;
    const midPrice = (bestBid + bestAsk) / 2;

    return NextResponse.json({
      success: true,
      orderbook,
      metrics: {
        bestBid,
        bestAsk,
        spread,
        midPrice,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch orderbook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

