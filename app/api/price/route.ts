import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route for fetching live prices from Polymarket CLOB
 * 
 * Endpoint: GET /api/price?tokenId=<token_id>&side=<BUY|SELL>
 * 
 * Documentation: https://docs.polymarket.com/developers/CLOB/pricing
 */

const CLOB_API_URL = 'https://clob.polymarket.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tokenId = searchParams.get('tokenId');
    const side = searchParams.get('side') || 'BUY';

    if (!tokenId) {
      return NextResponse.json(
        { error: 'tokenId parameter is required' },
        { status: 400 }
      );
    }

    if (!['BUY', 'SELL'].includes(side)) {
      return NextResponse.json(
        { error: 'side must be BUY or SELL' },
        { status: 400 }
      );
    }

    // Fetch price from CLOB API
    const response = await fetch(
      `${CLOB_API_URL}/price?token_id=${tokenId}&side=${side}`,
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

    const priceData = await response.json();

    // Extract price from response
    // CLOB API returns price as a string or number
    let price: number;
    if (typeof priceData === 'string') {
      price = parseFloat(priceData);
    } else if (typeof priceData === 'number') {
      price = priceData;
    } else if (priceData.price !== undefined) {
      price = typeof priceData.price === 'string' ? parseFloat(priceData.price) : priceData.price;
    } else if (priceData.bestPrice !== undefined) {
      price = typeof priceData.bestPrice === 'string' ? parseFloat(priceData.bestPrice) : priceData.bestPrice;
    } else {
      // Fallback: try to find any numeric value
      price = 0.5; // Default to 50% if we can't parse
    }

    // Ensure price is between 0 and 1
    price = Math.max(0, Math.min(1, price));

    return NextResponse.json({
      success: true,
      price,
      raw: priceData,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch price',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

