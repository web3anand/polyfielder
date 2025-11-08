import { ethers } from 'ethers';

// Re-export builder functions for backward compatibility
export {
  initPMWithBuilder,
  placeBetWithBuilder,
  getActiveOrders,
  cancelOrder,
  deploySafeWallet,
  type BuilderConfig,
} from './pm-builder';

export interface MarketFilter {
  liquidity?: number;
  sport?: string;
  minLiquidity?: number;
}

interface PolymarketSDK {
  getMarkets: (options: { active?: boolean; liquidity?: number }) => Promise<unknown[]>;
  createOrder: (options: { market: string; outcome: string; amount: string; side: string }) => Promise<unknown>;
}

interface MarketData {
  question?: string;
}

/**
 * Initialize Polymarket SDK (standard version)
 * For Builder Program with gasless transactions, use initPMWithBuilder instead
 * 
 * Note: @polymarket/sdk v6+ may have changed structure
 * Using placeholder implementation for now
 */
export const initPM = async (_signer: ethers.Signer): Promise<PolymarketSDK> => {
  // Placeholder - in production, use the actual SDK
  return {
    getMarkets: async (_options: { active?: boolean; liquidity?: number }) => {
      // Fetch from API instead
      return [];
    },
    createOrder: async (_options: { market: string; outcome: string; amount: string; side: string }) => {
      throw new Error('Use Builder Program for placing bets');
    },
  };
};

export const getActiveMarkets = async (
  polymarket: PolymarketSDK,
  filter: MarketFilter = {}
) => {
  try {
    // Get markets with liquidity filter
    const markets = await polymarket.getMarkets({
      active: true,
      liquidity: filter.minLiquidity || 10000, // Default >$10k
    });

    // Filter by sport if provided
    if (filter.sport) {
      const sportLower = filter.sport.toLowerCase();
      return (markets as MarketData[]).filter((market) =>
        market.question?.toLowerCase().includes(sportLower)
      );
    }

    return markets;
  } catch (error) {
    return [];
  }
};

export const placeBet = async (
  polymarket: PolymarketSDK,
  marketId: string,
  outcome: 'YES' | 'NO',
  amount: string
) => {
  try {
    const order = await polymarket.createOrder({
      market: marketId,
      outcome,
      amount,
      side: 'buy',
    });

    return order;
  } catch (error) {
    throw error;
  }
};

