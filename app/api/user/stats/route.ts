import { NextRequest, NextResponse } from 'next/server';
import { verifyPrivyAuth } from '@/lib/privy-auth';
import { supabase } from '@/lib/supabase';

/**
 * Get user statistics (bets count, win rate, join date, etc.)
 * 
 * Note: Privy tokens don't contain wallet addresses directly.
 * The address should be passed as a query parameter or header from the client.
 */
export async function GET(request: NextRequest) {
  try {
    // Log request details for debugging
    const authHeader = request.headers.get('authorization');
    const userAddressHeader = request.headers.get('x-user-address');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 /api/user/stats request:', {
        hasAuthHeader: !!authHeader,
        authHeaderPrefix: authHeader?.substring(0, 20),
        hasUserAddressHeader: !!userAddressHeader,
        userAddress: userAddressHeader,
      });
    }

    const authInfo = await verifyPrivyAuth(request);
    
    if (!authInfo) {
      // In development, provide more detailed error info
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Auth verification failed');
        console.log('Check server terminal for detailed error logs');
      }
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          message: 'Invalid or missing authentication token',
          // Only include debug info in development
          ...(process.env.NODE_ENV === 'development' && {
            debug: {
              hasAuthHeader: !!authHeader,
              hasUserAddressHeader: !!userAddressHeader,
            }
          })
        },
        { status: 401 }
      );
    }

    // Try to get address from auth info, query param, or header
    const userAddress = 
      authInfo.address?.toLowerCase() ||
      request.nextUrl.searchParams.get('address')?.toLowerCase() ||
      request.headers.get('x-user-address')?.toLowerCase();

    if (!userAddress) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User address not found. Please provide address in query param or header.' },
        { status: 401 }
      );
    }

    // Get user info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('created_at, last_login')
      .eq('wallet_address', userAddress)
      .single();

    // Get bets count
    const { count: betsCount, error: betsError } = await supabase
      .from('bets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userAddress);

    // Get settled bets to calculate win rate
    const { data: settledBets, error: settledError } = await supabase
      .from('bets')
      .select('outcome, status')
      .eq('user_id', userAddress)
      .eq('status', 'settled');

    // Calculate win rate (simplified - would need market resolution data for accurate calculation)
    const winRate = settledBets && settledBets.length > 0 
      ? '0%' // Placeholder - would need market resolution to calculate actual win rate
      : '0%';

    // Get join date
    const joinDate = userData?.created_at 
      ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'Unknown';

    // Calculate total invested (sum of all bet amounts)
    const { data: allBets, error: allBetsError } = await supabase
      .from('bets')
      .select('amount')
      .eq('user_id', userAddress);

    const totalInvested = allBets?.reduce((sum, bet) => sum + parseFloat(String(bet.amount || 0)), 0) || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalBets: betsCount || 0,
        winRate: winRate,
        joinDate: joinDate,
        totalInvested: totalInvested,
        balance: 0, // Would need to track balance separately or calculate from transactions
      },
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}

