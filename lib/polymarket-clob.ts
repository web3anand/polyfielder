/**
 * Polymarket CLOB API Client
 * 
 * Queries Polymarket's CLOB API to fetch user positions, orders, and trades
 * This allows us to use existing Polymarket proxy wallets in our app
 * 
 * Documentation: https://docs.polymarket.com/developers/CLOB/introduction
 */

const CLOB_API_URL = 'https://clob.polymarket.com';

export interface PolymarketPosition {
  asset_id: string;
  balance: string;
  market: string;
  outcome: string;
  price: string;
  [key: string]: unknown;
}

export interface PolymarketOrder {
  order_id: string;
  asset_id: string;
  market: string;
  side: 'BUY' | 'SELL';
  size: string;
  price: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

export interface PolymarketTrade {
  trade_id: string;
  asset_id: string;
  market: string;
  side: 'BUY' | 'SELL';
  size: string;
  price: string;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Get user positions from Polymarket CLOB
 * @param userAddress - User's wallet address
 * @returns Array of positions
 */
export async function getUserPositions(userAddress: string): Promise<PolymarketPosition[]> {
  try {
    const response = await fetch(
      `${CLOB_API_URL}/positions?user=${userAddress.toLowerCase()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // No positions found - return empty array
        return [];
      }
      throw new Error(`Failed to fetch positions: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching positions from Polymarket:', error);
    return [];
  }
}

/**
 * Get user orders from Polymarket CLOB
 * @param userAddress - User's wallet address
 * @returns Array of orders
 */
export async function getUserOrders(userAddress: string): Promise<PolymarketOrder[]> {
  try {
    const response = await fetch(
      `${CLOB_API_URL}/orders?user=${userAddress.toLowerCase()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // No orders found - return empty array
        return [];
      }
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching orders from Polymarket:', error);
    return [];
  }
}

/**
 * Get user trades from Polymarket CLOB
 * @param userAddress - User's wallet address
 * @returns Array of trades
 */
export async function getUserTrades(userAddress: string): Promise<PolymarketTrade[]> {
  try {
    const response = await fetch(
      `${CLOB_API_URL}/trades?user=${userAddress.toLowerCase()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // No trades found - return empty array
        return [];
      }
      throw new Error(`Failed to fetch trades: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching trades from Polymarket:', error);
    return [];
  }
}

/**
 * Get USDC.e balance on Polygon
 * USDC.e contract: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
 * @param userAddress - User's wallet address
 * @param provider - Ethers provider
 * @returns USDC balance as string
 */
export async function getUSDCBalance(
  userAddress: string,
  provider: any
): Promise<string> {
  try {
    const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
    const ERC20_ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];

    const contract = new (await import('ethers')).Contract(
      USDC_ADDRESS,
      ERC20_ABI,
      provider
    );

    const balance = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();
    const formattedBalance = (Number(balance) / Math.pow(10, decimals)).toFixed(2);

    return formattedBalance;
  } catch (error) {
    console.error('Error fetching USDC balance:', error);
    return '0.00';
  }
}

/**
 * Get Conditional Token Framework (CTF) position balance
 * CTF address: 0x4D97DCd97eC945f40cF65F87097ACe5EA0476045
 * @param userAddress - User's wallet address
 * @param assetId - Condition token ID (asset_id)
 * @param provider - Ethers provider
 * @returns Token balance as string
 */
export async function getCTFPositionBalance(
  userAddress: string,
  assetId: string,
  provider: any
): Promise<string> {
  try {
    const CTF_ADDRESS = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045';
    const ERC1155_ABI = [
      'function balanceOf(address account, uint256 id) view returns (uint256)',
    ];

    const contract = new (await import('ethers')).Contract(
      CTF_ADDRESS,
      ERC1155_ABI,
      provider
    );

    // Convert asset_id to uint256 (if it's not already)
    const tokenId = assetId.startsWith('0x') 
      ? BigInt(assetId) 
      : BigInt(`0x${assetId}`);
    
    const balance = await contract.balanceOf(userAddress, tokenId);
    return balance.toString();
  } catch (error) {
    console.error('Error fetching CTF position balance:', error);
    return '0';
  }
}

/**
 * Get all CTF positions for a user
 * Checks balance for multiple asset_ids
 * @param userAddress - User's wallet address
 * @param assetIds - Array of condition token IDs
 * @param provider - Ethers provider
 * @returns Map of asset_id to balance
 */
export async function getAllCTFPositions(
  userAddress: string,
  assetIds: string[],
  provider: any
): Promise<Map<string, string>> {
  const positions = new Map<string, string>();
  
  await Promise.all(
    assetIds.map(async (assetId) => {
      const balance = await getCTFPositionBalance(userAddress, assetId, provider);
      if (balance !== '0') {
        positions.set(assetId, balance);
      }
    })
  );
  
  return positions;
}

/**
 * Get market info from asset_id
 * This helps us get market title and other details
 * @param assetId - Condition token ID (asset_id)
 * @returns Market information
 */
export async function getMarketFromAssetId(assetId: string): Promise<{
  question?: string;
  slug?: string;
  market?: string;
} | null> {
  try {
    // Try to get market info from Gamma API
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?condition_id=${assetId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        question: data[0].question,
        slug: data[0].slug,
        market: data[0].id,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching market from asset_id:', error);
    return null;
  }
}

