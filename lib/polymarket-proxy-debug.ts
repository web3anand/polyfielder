/**
 * Debug utility to help find proxy wallet addresses
 * 
 * This file provides debugging functions to inspect CLOB API responses
 * and help identify proxy wallet addresses
 */

const CLOB_API_URL = 'https://clob.polymarket.com';

/**
 * Debug function to inspect CLOB API responses and find proxy address
 * 
 * @param mainAddress - Main wallet address
 * @returns Debug information about proxy wallet detection
 */
export async function debugProxyWallet(mainAddress: string) {
  const mainAddr = mainAddress.toLowerCase();
  const debug: any = {
    mainAddress: mainAddr,
    positions: null,
    orders: null,
    trades: null,
    detectedProxy: null,
  };

  try {
    // Check positions
    const positionsRes = await fetch(`${CLOB_API_URL}/positions?user=${mainAddr}`);
    if (positionsRes.ok) {
      debug.positions = await positionsRes.json();
      if (Array.isArray(debug.positions) && debug.positions.length > 0) {
        console.log('📊 Positions Response:', JSON.stringify(debug.positions[0], null, 2));
        
        // Check all possible proxy address fields
        const firstPos = debug.positions[0] as any;
        const possibleProxy = 
          firstPos.proxy_address ||
          firstPos.proxyAddress ||
          firstPos.trader ||
          firstPos.owner ||
          firstPos.user ||
          firstPos.address;
        
        if (possibleProxy && possibleProxy.toLowerCase() !== mainAddr) {
          debug.detectedProxy = possibleProxy.toLowerCase();
        }
      }
    }

    // Check orders
    const ordersRes = await fetch(`${CLOB_API_URL}/orders?user=${mainAddr}`);
    if (ordersRes.ok) {
      debug.orders = await ordersRes.json();
      if (Array.isArray(debug.orders) && debug.orders.length > 0) {
        console.log('📋 Orders Response:', JSON.stringify(debug.orders[0], null, 2));
        
        const firstOrder = debug.orders[0] as any;
        const possibleProxy = 
          firstOrder.proxy_address ||
          firstOrder.proxyAddress ||
          firstOrder.trader ||
          firstOrder.owner ||
          firstOrder.user ||
          firstOrder.address;
        
        if (possibleProxy && possibleProxy.toLowerCase() !== mainAddr && !debug.detectedProxy) {
          debug.detectedProxy = possibleProxy.toLowerCase();
        }
      }
    }

    // Check trades
    const tradesRes = await fetch(`${CLOB_API_URL}/trades?user=${mainAddr}`);
    if (tradesRes.ok) {
      debug.trades = await tradesRes.json();
      if (Array.isArray(debug.trades) && debug.trades.length > 0) {
        console.log('💱 Trades Response:', JSON.stringify(debug.trades[0], null, 2));
        
        const firstTrade = debug.trades[0] as any;
        // Check maker and taker addresses
        if (firstTrade.maker_address && firstTrade.maker_address.toLowerCase() !== mainAddr && !debug.detectedProxy) {
          debug.detectedProxy = firstTrade.maker_address.toLowerCase();
        }
        if (firstTrade.taker_address && firstTrade.taker_address.toLowerCase() !== mainAddr && !debug.detectedProxy) {
          debug.detectedProxy = firstTrade.taker_address.toLowerCase();
        }
      }
    }

    console.log('🔍 Proxy Wallet Debug Info:', debug);
    return debug;
  } catch (error) {
    console.error('Error debugging proxy wallet:', error);
    return debug;
  }
}

