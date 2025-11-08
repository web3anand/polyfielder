import { NextRequest, NextResponse } from 'next/server';
import { verifyPrivyAuth } from '@/lib/privy-auth';
import { getUserTrades, getUserOrders, getMarketFromAssetId } from '@/lib/polymarket-clob';

/**
 * Get user transaction history from Polymarket CLOB
 * This fetches trades and orders from Polymarket's infrastructure
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
    const searchParams = request.nextUrl.searchParams;
    const filterType = searchParams.get('type') || 'all';

    // Fetch trades and orders from Polymarket CLOB
    const [trades, orders] = await Promise.all([
      getUserTrades(userAddress),
      getUserOrders(userAddress),
    ]);

    // Transform trades to transaction format
    const tradeTransactions = await Promise.all(
      trades.map(async (trade) => {
        const marketInfo = await getMarketFromAssetId(trade.asset_id);
        const isYes = trade.side === 'BUY' && trade.asset_id?.endsWith('0');
        const outcome = isYes ? 'YES' : 'NO';

        return {
          id: trade.trade_id || `trade-${trade.asset_id}`,
          type: 'trade',
          action: trade.side,
          market: marketInfo?.question || trade.market || 'Unknown Market',
          outcome,
          shares: parseFloat(trade.size || '0'),
          price: parseFloat(trade.price || '0') * 100, // Convert to percentage
          total: parseFloat(trade.size || '0') * parseFloat(trade.price || '0'),
          timestamp: trade.timestamp || new Date().toISOString(),
          status: 'completed',
          transaction_hash: trade.trade_id,
        };
      })
    );

    // Transform orders to transaction format
    const orderTransactions = await Promise.all(
      orders.map(async (order) => {
        const marketInfo = await getMarketFromAssetId(order.asset_id);
        const isYes = order.side === 'BUY' && order.asset_id?.endsWith('0');
        const outcome = isYes ? 'YES' : 'NO';

        return {
          id: order.order_id || `order-${order.asset_id}`,
          type: 'order',
          action: order.side,
          market: marketInfo?.question || order.market || 'Unknown Market',
          outcome,
          shares: parseFloat(order.size || '0'),
          price: parseFloat(order.price || '0') * 100, // Convert to percentage
          total: parseFloat(order.size || '0') * parseFloat(order.price || '0'),
          timestamp: order.created_at || new Date().toISOString(),
          status: order.status || 'pending',
          transaction_hash: order.order_id,
        };
      })
    );

    // Combine and sort by timestamp
    const allTransactions = [...tradeTransactions, ...orderTransactions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Filter by type if specified
    const filteredTransactions = filterType === 'all' 
      ? allTransactions 
      : allTransactions.filter(tx => tx.type === filterType.replace('s', ''));

    return NextResponse.json({
      success: true,
      transactions: filteredTransactions,
      count: filteredTransactions.length,
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error.message },
      { status: 500 }
    );
  }
}

