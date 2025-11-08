import { NextRequest, NextResponse } from 'next/server';
import { verifyPrivyAuth } from '@/lib/privy-auth';
import { getUserPositions, getMarketFromAssetId } from '@/lib/polymarket-clob';

/**
 * Get user active positions from Polymarket CLOB
 * This fetches positions from Polymarket's infrastructure, allowing us to use
 * existing Polymarket proxy wallets in our app
 */
export async function GET(request: NextRequest) {
  try {
    const authInfo = await verifyPrivyAuth(request);
    
    if (!authInfo) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing authentication token' },
        { status: 401 }
      );
    }

    // Try to get address from auth info, query param, or header
    const userAddress = 
      authInfo.address ||
      request.nextUrl.searchParams.get('address') ||
      request.headers.get('x-user-address');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User address not found. Please provide address in query param or header.' },
        { status: 401 }
      );
    }

    // Fetch positions from Polymarket CLOB API
    const polymarketPositions = await getUserPositions(userAddress);

    // Transform Polymarket positions to our format
    const positions = await Promise.all(
      polymarketPositions.map(async (pos, index) => {
        // Get market info from asset_id
        const marketInfo = await getMarketFromAssetId(pos.asset_id);
        
        // Determine side from outcome or asset_id
        // Polymarket uses 0 for YES, 1 for NO in asset_id
        const isYes = pos.outcome?.toLowerCase() === 'yes' || 
                     pos.asset_id?.endsWith('0') || 
                     !pos.asset_id?.endsWith('1');
        const side = isYes ? 'yes' : 'no';

        const shares = parseFloat(pos.balance || '0');
        const currentPrice = parseFloat(pos.price || '0') * 100; // Convert to percentage
        const avgPrice = currentPrice; // Use current price as avg for now

        return {
          id: pos.asset_id || `pos-${index}`,
          marketTitle: marketInfo?.question || pos.market || 'Unknown Market',
          side,
          shares,
          avgPrice,
          currentPrice,
          invested: shares * (avgPrice / 100), // Approximate invested amount
          assetId: pos.asset_id,
          marketId: marketInfo?.market || pos.market,
        };
      })
    );

    // Calculate totals
    const totalInvested = positions.reduce((sum, pos) => sum + pos.invested, 0);
    const totalValue = positions.reduce((sum, pos) => sum + (pos.shares * (pos.currentPrice / 100)), 0);
    const totalPnL = totalValue - totalInvested;
    const pnlPercentage = totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0;

    return NextResponse.json({
      success: true,
      positions,
      totals: {
        totalInvested,
        totalValue,
        totalPnL,
        pnlPercentage: pnlPercentage.toFixed(2),
      },
    });
  } catch (error: any) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions', details: error.message },
      { status: 500 }
    );
  }
}

