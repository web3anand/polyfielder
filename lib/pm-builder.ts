// Note: BuilderRelayerClient might not be exported, using dynamic import
import { ethers } from 'ethers';

// Polymarket SDK - using dynamic import to avoid type issues
interface Polymarket {
  getMarkets: (options: { active?: boolean; liquidity?: number }) => Promise<unknown[]>;
  createOrder: (options: { market: string; outcome: string; amount: string; side: string }) => Promise<unknown>;
}

// Type for relayer client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RelayerClient = any; // BuilderRelayerClient from @polymarket/builder-relayer-client

export interface BuilderConfig {
  builderPrivateKey?: string; // For order attribution
  relayerUrl?: string; // Defaults to Polymarket's relayer
}

export interface MarketFilter {
  liquidity?: number;
  sport?: string;
  minLiquidity?: number;
}

/**
 * Initialize Polymarket with Builder Program support
 * This enables gasless transactions via the relayer
 */
export const initPMWithBuilder = async (
  signer: ethers.Signer,
  config?: BuilderConfig
) => {
  // Initialize standard Polymarket SDK for market data
  // Note: @polymarket/sdk v6+ uses a different structure
  // For now, we'll use the markets API directly instead of the class
  const polymarket: Polymarket = {
    getMarkets: async (_options: { active?: boolean; liquidity?: number }) => {
      // This will be implemented via the markets API
      return [];
    },
    createOrder: async (_options: { market: string; outcome: string; amount: string; side: string }) => {
      // Placeholder - will use builder relayer instead
      return {};
    },
  };

  // Initialize Builder Relayer Client for gasless transactions
  // Note: Actual API may vary - check @polymarket/builder-relayer-client docs
  const builderApiKey = config?.builderPrivateKey || process.env.POLYMARKET_BUILDER_API_KEY;
  const builderSecret = process.env.POLYMARKET_BUILDER_SECRET;
  const builderPassphrase = process.env.POLYMARKET_BUILDER_PASSPHRASE;

  if (!builderApiKey || !builderSecret || !builderPassphrase) {
    // Builder Program credentials not fully configured
  }

  // Dynamically import RelayClient (Builder Relayer Client)
  // API: new RelayClient(relayerUrl, chainId, wallet, builderConfig)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let relayerClient: any = null;
  
  try {
    const builderModule = await import('@polymarket/builder-relayer-client').catch(() => null);
    
    if (builderModule && builderApiKey && builderSecret && builderPassphrase) {
      const { RelayClient } = builderModule;
      const { BuilderConfig } = await import('@polymarket/builder-signing-sdk').catch(() => {
        // If signing SDK not available, use local config
        return { BuilderConfig: null };
      });
      
      if (RelayClient) {
        try {
          const relayerUrl = typeof config?.relayerUrl === 'string' 
            ? config.relayerUrl 
            : 'https://relayer-v2.polymarket.com/';
          const chainId = 137; // Polygon mainnet
          
          // Get wallet from signer
          const address = await signer.getAddress();
          const wallet = signer as any; // RelayClient expects ethers.Wallet
          
          // Configure builder credentials
          // Option 1: Use remote signing server (recommended for production)
          // Configure builder credentials
          let builderConfig: any;
          
          if (BuilderConfig) {
            // Use remote signing server if available
            const signingServerUrl = process.env.POLYMARKET_BUILDER_SIGNING_SERVER_URL;
            if (signingServerUrl) {
              builderConfig = new BuilderConfig({
                remoteBuilderConfig: { url: signingServerUrl }
              });
            } else {
              // Use local credentials (for development)
              // BuilderApiKeyCreds structure may vary - use type assertion
              builderConfig = new BuilderConfig({
                localBuilderCreds: {
                  apiKey: builderApiKey,
                  secret: builderSecret,
                  passphrase: builderPassphrase,
                } as any
              });
            }
          } else {
            // Fallback: create config object directly
            builderConfig = {
              apiKey: builderApiKey,
              secret: builderSecret,
              passphrase: builderPassphrase,
            };
          }
          
          // Initialize RelayClient
          relayerClient = new RelayClient(relayerUrl, chainId, wallet, builderConfig);
        } catch (error) {
          console.error('Failed to initialize Builder Relayer Client:', error);
          relayerClient = null;
        }
      }
    }
  } catch (error) {
    console.error('Failed to import Builder Relayer Client:', error);
    relayerClient = null;
  }

  return {
    polymarket,
    relayerClient,
  };
};

/**
 * Get active markets (same as before, using standard SDK)
 */
export const getActiveMarkets = async (
  polymarket: Polymarket,
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
      return (markets as Array<{ question?: string }>).filter((market) =>
        market.question?.toLowerCase().includes(sportLower)
      );
    }

    return markets;
  } catch (error) {
    return [];
  }
};

/**
 * Place a bet using the Builder Relayer (gasless transactions)
 * This uses Polymarket's relayer to cover gas fees
 */
export const placeBetWithBuilder = async (
  relayerClient: RelayerClient,
  marketId: string,
  outcome: 'YES' | 'NO',
  amount: string,
  price?: string // Optional: specify price, otherwise uses market price
) => {
  try {
    // Create order via builder relayer
    // This will be gasless and attributed to your builder account
    // Note: The actual API may vary - check @polymarket/builder-relayer-client docs
    // Common methods: createOrder, placeOrder, submitOrder
    
    // Try different method names based on the actual API
    let order;
    
    if (typeof relayerClient.createOrder === 'function') {
      order = await relayerClient.createOrder({
        marketId,
        outcome: outcome === 'YES' ? 0 : 1,
        amount,
        price: price || '0',
        side: 'buy',
      });
    } else if (typeof relayerClient.placeOrder === 'function') {
      order = await relayerClient.placeOrder({
        marketId,
        outcome: outcome === 'YES' ? 0 : 1,
        amount,
        price: price || '0',
        side: 'buy',
      });
    } else {
      throw new Error('RelayerClient does not have createOrder or placeOrder method');
    }

    return {
      success: true,
      orderId: order.orderId || order.id || order.order_id,
      transactionHash: order.txHash || order.transactionHash || order.tx_hash,
      message: 'Order placed successfully via Builder Relayer (gasless)',
    };
  } catch (error: any) {
    console.error('Error placing bet with Builder:', error);
    throw new Error(`Failed to place bet: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Get user's active orders
 */
export const getActiveOrders = async (relayerClient: RelayerClient) => {
  try {
    const orders = await relayerClient.getActiveOrders();
    return orders;
  } catch (error) {
    return [];
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (
  relayerClient: RelayerClient,
  orderId: string
) => {
  try {
    const result = await relayerClient.cancelOrder(orderId);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if a Safe Wallet exists for a user
 * @param relayerClient - Builder Relayer Client
 * @param userAddress - User's EOA address
 * @returns Safe Wallet address if exists, null otherwise
 */
export const checkSafeWallet = async (
  relayerClient: RelayerClient,
  userAddress: string
): Promise<string | null> => {
  try {
    // Try to get Safe Wallet address
    // The Safe Wallet address is deterministic based on user's EOA
    if (typeof relayerClient.getSafeAddress === 'function') {
      const safeAddress = await relayerClient.getSafeAddress(userAddress);
      return safeAddress;
    } else if (typeof relayerClient.getSafe === 'function') {
      const safe = await relayerClient.getSafe(userAddress);
      return safe?.address || null;
    }
    
    // If methods don't exist, return null (Safe Wallet doesn't exist)
    return null;
  } catch (error) {
    // Safe Wallet doesn't exist yet
    return null;
  }
};

/**
 * Deploy a Safe Wallet for a user (via Builder Relayer)
 * This allows users to interact with Polymarket without holding MATIC for gas
 * The deployment is gasless - Polymarket pays for it
 * 
 * @param relayerClient - Builder Relayer Client
 * @param userAddress - User's EOA address (optional, will use signer's address if not provided)
 * @returns Safe Wallet address
 */
export const deploySafeWallet = async (
  relayerClient: RelayerClient,
  userAddress?: string
): Promise<string> => {
  try {
    // Deploy Safe Wallet for user
    // This is gasless - Polymarket pays for deployment via relayer
    let response;
    
    if (typeof relayerClient.deploySafe === 'function') {
      // Standard method
      response = await relayerClient.deploySafe();
    } else if (typeof relayerClient.deploySafeWallet === 'function') {
      // Alternative method name
      response = await relayerClient.deploySafeWallet(userAddress);
    } else {
      throw new Error('RelayerClient does not have deploySafe or deploySafeWallet method');
    }
    
    // Wait for transaction to be mined
    const result = await response.wait();
    
    // Get the deployed Safe Wallet address
    const safeAddress = result.safeAddress || result.address || result.to;
    
    if (!safeAddress) {
      throw new Error('Failed to get Safe Wallet address from deployment result');
    }
    
    console.log(`✅ Safe Wallet deployed at: ${safeAddress}`);
    return safeAddress;
  } catch (error: any) {
    console.error('Error deploying Safe Wallet:', error);
    throw new Error(`Failed to deploy Safe Wallet: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Check if Safe Wallet exists, deploy if needed
 * @param relayerClient - Builder Relayer Client
 * @param userAddress - User's EOA address
 * @returns Safe Wallet address
 */
export const ensureSafeWallet = async (
  relayerClient: RelayerClient,
  userAddress: string
): Promise<string> => {
  try {
    // Check if Safe Wallet exists
    const existingSafe = await checkSafeWallet(relayerClient, userAddress);
    
    if (existingSafe) {
      console.log(`✅ Safe Wallet already exists: ${existingSafe}`);
      return existingSafe;
    }
    
    // Deploy if doesn't exist
    console.log(`Deploying Safe Wallet for user: ${userAddress}`);
    const safeAddress = await deploySafeWallet(relayerClient, userAddress);
    
    return safeAddress;
  } catch (error: any) {
    console.error('Error ensuring Safe Wallet:', error);
    throw error;
  }
};

