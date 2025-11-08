/**
 * Polymarket Proxy Wallet Client
 * 
 * Handles trading using Polymarket proxy wallets
 * - Main wallet (via Privy) signs messages/transactions
 * - Proxy wallet holds positions/orders on Polymarket
 * - App uses main wallet signatures to control proxy
 * 
 * Documentation: https://docs.polymarket.com/developers/proxy-wallet
 */

import { ethers } from 'ethers';

const CLOB_API_URL = 'https://clob.polymarket.com';

export interface OrderParams {
  market: string;
  asset_id: string;
  side: 'BUY' | 'SELL';
  size: string;
  price: string;
  [key: string]: any;
}

export interface ProxyOrder {
  order_id: string;
  asset_id: string;
  market: string;
  side: 'BUY' | 'SELL';
  size: string;
  price: string;
  status: string;
  created_at: string;
  [key: string]: any;
}

/**
 * Get Polymarket proxy wallet address for a main wallet
 * 
 * Polymarket creates proxy wallets deterministically based on the main wallet address.
 * The proxy address can be found by:
 * 1. Checking CLOB API responses for the actual proxy address in positions/orders
 * 2. Querying Gnosis Safe factory contract to calculate proxy address
 * 3. Using Polymarket SDK to get proxy address
 * 
 * @param mainWalletAddress - The main wallet address (from Privy)
 * @param provider - Optional ethers provider for on-chain queries
 * @returns Proxy wallet address if found, null otherwise
 */
export async function getPolymarketProxy(
  mainWalletAddress: string,
  provider?: ethers.Provider
): Promise<string | null> {
  try {
    const mainAddr = mainWalletAddress.toLowerCase();

    // Method 1: Check CLOB API for positions/orders
    // The API response may contain the actual proxy address
    const positionsResponse = await fetch(
      `${CLOB_API_URL}/positions?user=${mainAddr}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (positionsResponse.ok) {
      const positions = await positionsResponse.json();
      if (Array.isArray(positions) && positions.length > 0) {
        // Log the first position to see its structure
        console.log('🔍 Checking positions response structure:', JSON.stringify(positions[0], null, 2));
        
        // Check if positions contain a proxy address field
        // Common fields: user, owner, address, proxy_address, trader
        const firstPosition = positions[0] as any;
        const proxyAddr = 
          firstPosition.proxy_address ||
          firstPosition.proxyAddress ||
          firstPosition.trader ||
          firstPosition.owner ||
          firstPosition.user ||
          firstPosition.address;
        
        if (proxyAddr && proxyAddr.toLowerCase() !== mainAddr) {
          console.log(`✅ Found proxy address from positions: ${proxyAddr} (main: ${mainAddr})`);
          return proxyAddr.toLowerCase();
        }
        
        // If positions exist but no proxy address found, check if main address query returned empty
        // This might mean positions are under a different address (the proxy)
        console.log(`⚠️ Positions found but no proxy address in response. Main address: ${mainAddr}`);
      }
    }

    // Method 2: Check orders
    const ordersResponse = await fetch(
      `${CLOB_API_URL}/orders?user=${mainAddr}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (ordersResponse.ok) {
      const orders = await ordersResponse.json();
      if (Array.isArray(orders) && orders.length > 0) {
        // Check if orders contain a proxy address field
        const firstOrder = orders[0] as any;
        const proxyAddr = 
          firstOrder.proxy_address ||
          firstOrder.proxyAddress ||
          firstOrder.owner ||
          firstOrder.user;
        
        if (proxyAddr && proxyAddr.toLowerCase() !== mainAddr) {
          console.log(`✅ Found proxy address from orders: ${proxyAddr}`);
          return proxyAddr.toLowerCase();
        }
      }
    }

    // Method 3: Query Gnosis Safe factory to calculate proxy address
    // Gnosis Safe Factory: 0xaacfeea03eb1561c4e67d661e40682bd20e3541b (Polygon)
    if (provider) {
      try {
        const proxyAddr = await calculateProxyAddressFromFactory(mainAddr, provider);
        if (proxyAddr) {
          console.log(`✅ Calculated proxy address from factory: ${proxyAddr}`);
          return proxyAddr.toLowerCase();
        }
      } catch (factoryError) {
        console.warn('Could not calculate proxy from factory:', factoryError);
      }
    }

    // Method 4: Try to find proxy by checking if main address has NO positions
    // If main address has no positions but user has traded, positions are likely under proxy
    // We need to calculate or find the proxy address another way
    // For now, let's try querying trades to see if we can find the proxy address
    const tradesResponse = await fetch(
      `${CLOB_API_URL}/trades?user=${mainAddr}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (tradesResponse.ok) {
      const trades = await tradesResponse.json();
      if (Array.isArray(trades) && trades.length > 0) {
        // Check trades for proxy address
        const firstTrade = trades[0] as any;
        const proxyAddr = 
          firstTrade.trader ||
          firstTrade.maker_address ||
          firstTrade.taker_address ||
          firstTrade.user ||
          firstTrade.owner;
        
        // Check if maker or taker is different from main address (likely the proxy)
        if (firstTrade.maker_address && firstTrade.maker_address.toLowerCase() !== mainAddr) {
          console.log(`✅ Found proxy address from trades (maker): ${firstTrade.maker_address}`);
          return firstTrade.maker_address.toLowerCase();
        }
        if (firstTrade.taker_address && firstTrade.taker_address.toLowerCase() !== mainAddr) {
          console.log(`✅ Found proxy address from trades (taker): ${firstTrade.taker_address}`);
          return firstTrade.taker_address.toLowerCase();
        }
      }
    }

    // If no positions/orders found, user might not have a proxy wallet yet
    // They can still trade - Polymarket will create one if needed
    console.log(`ℹ️ No proxy wallet found for ${mainAddr} - will use main address`);
    return null;
  } catch (error) {
    console.error('Error getting Polymarket proxy:', error);
    return null;
  }
}

/**
 * Calculate proxy wallet address from Gnosis Safe factory
 * 
 * @param mainAddress - Main wallet address
 * @param provider - Ethers provider
 * @returns Proxy wallet address if found
 */
async function calculateProxyAddressFromFactory(
  mainAddress: string,
  provider: ethers.Provider
): Promise<string | null> {
  try {
    // Gnosis Safe Factory ABI (simplified - just the getAddress function)
    const FACTORY_ABI = [
      'function getAddress(bytes memory initCode, uint256 salt) public view returns (address)',
      'function predictDeterministicAddress(address masterCopy, bytes memory initializer, uint256 salt) public view returns (address)',
    ];

    // Gnosis Safe Factory address on Polygon
    const FACTORY_ADDRESS = '0xaacfeea03eb1561c4e67d661e40682bd20e3541b';

    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);

    // Try to get proxy address - this requires knowing the salt and init code
    // For now, we'll return null and rely on CLOB API responses
    // In production, you'd need to know Polymarket's specific proxy creation parameters
    
    return null;
  } catch (error) {
    console.error('Error calculating proxy from factory:', error);
    return null;
  }
}

/**
 * Polymarket Proxy Client
 * 
 * Handles trading operations using proxy wallets.
 * 
 * According to Polymarket docs:
 * - Initialize CLOB client with proxy wallet address as "funder"
 * - Use main wallet's private key for signing
 * - Use signature_type: 1 for email/Magic, 2 for browser wallets
 * - This allows multiple apps to control the same proxy wallet
 */
export class PolymarketProxyClient {
  private mainWallet: ethers.Signer;
  private proxyAddress: string; // This is the "funder" in CLOB client
  private apiUrl: string;
  private signatureType: number; // 1 for email/Magic, 2 for browser wallets
  private chainId: number; // 137 for Polygon

  constructor(
    mainWalletSigner: ethers.Signer, 
    proxyAddress: string,
    signatureType: number = 2 // Default to 2 for browser wallets (MetaMask/Privy)
  ) {
    this.mainWallet = mainWalletSigner;
    this.proxyAddress = proxyAddress.toLowerCase();
    this.apiUrl = CLOB_API_URL;
    this.signatureType = signatureType;
    this.chainId = 137; // Polygon mainnet
  }

  /**
   * Get the proxy wallet address
   */
  getProxyAddress(): string {
    return this.proxyAddress;
  }

  /**
   * Get the main wallet address
   */
  async getMainAddress(): Promise<string> {
    return await this.mainWallet.getAddress();
  }

  /**
   * Place an order using the proxy wallet
   * 
   * The order is placed from the proxy address (funder), but signed by the main wallet.
   * This allows the proxy wallet to hold positions while the main wallet controls it.
   * 
   * According to Polymarket docs, the CLOB client should be initialized with:
   * - funder: proxy wallet address
   * - key: main wallet private key
   * - signature_type: 1 for email/Magic, 2 for browser wallets
   * 
   * @param params - Order parameters
   * @returns The created order
   */
  async placeOrder(params: OrderParams): Promise<ProxyOrder> {
    try {
      // Get main wallet address and private key
      const mainAddress = await this.mainWallet.getAddress();
      
      // Note: For Privy wallets, we can't directly access the private key
      // Instead, we'll sign the order message and send it with the proxy address as funder
      
      // 1. Create order data with proxy address as funder
      const orderData = {
        asset_id: params.asset_id,
        side: params.side,
        size: params.size,
        price: params.price,
        market: params.market,
        funder: this.proxyAddress, // Proxy wallet address (funder)
        trader: this.proxyAddress, // Proxy wallet address (trader)
        expiration: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        nonce: Date.now().toString(),
        signature_type: this.signatureType,
        chain_id: this.chainId,
      };

      // 2. Create order hash (Polymarket's format)
      // Note: In production, use Polymarket's official order hash function from @polymarket/clob-client
      const orderHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(orderData))
      );

      // 3. Sign with main wallet
      const signature = await this.mainWallet.signMessage(ethers.getBytes(orderHash));

      // 4. Submit order to Polymarket CLOB
      // The order should include:
      // - funder: proxy wallet address
      // - signature: signed by main wallet
      // - signature_type: 1 or 2
      const response = await fetch(`${this.apiUrl}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          signature,
          // Polymarket CLOB expects these fields
          feeRateBps: '0', // Fee rate in basis points
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Failed to place order: ${error.message || response.statusText}`);
      }

      const order = await response.json();
      return order;
    } catch (error: any) {
      console.error('Error placing order via proxy:', error);
      throw new Error(`Failed to place order: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Cancel an order
   * 
   * @param orderId - The order ID to cancel
   * @returns Success status
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      // 1. Create cancel message
      const cancelData = {
        order_id: orderId,
        address: this.proxyAddress,
      };

      // 2. Sign with main wallet
      const message = JSON.stringify(cancelData);
      const signature = await this.mainWallet.signMessage(message);

      // 3. Submit cancel to Polymarket CLOB
      const response = await fetch(`${this.apiUrl}/order`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...cancelData,
          signature,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }

  /**
   * Get proxy wallet positions
   * 
   * @returns Array of positions
   */
  async getPositions(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/positions?user=${this.proxyAddress}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch positions: ${response.statusText}`);
      }

      const positions = await response.json();
      return Array.isArray(positions) ? positions : [];
    } catch (error) {
      console.error('Error fetching proxy positions:', error);
      return [];
    }
  }

  /**
   * Get proxy wallet orders
   * 
   * @returns Array of orders
   */
  async getOrders(): Promise<ProxyOrder[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/orders?user=${this.proxyAddress}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const orders = await response.json();
      return Array.isArray(orders) ? orders : [];
    } catch (error) {
      console.error('Error fetching proxy orders:', error);
      return [];
    }
  }
}

/**
 * Create a Polymarket Proxy Client from Privy wallet
 * 
 * @param privyWallet - Privy wallet object from useWallets()
 * @param provider - Ethers provider (Polygon)
 * @returns PolymarketProxyClient instance
 */
export async function createProxyClient(
  privyWallet: any,
  provider: ethers.Provider,
  proxyAddress?: string, // Optional: manually provide proxy address
  signatureType: number = 2 // Default to 2 for browser wallets (Privy/MetaMask)
): Promise<PolymarketProxyClient | null> {
  try {
    // Get ethers signer from Privy wallet
    // Privy wallets have a getEthersSigner() method
    let signer: ethers.Signer;

    if (typeof privyWallet.getEthersSigner === 'function') {
      // Use Privy's getEthersSigner method (recommended)
      signer = await privyWallet.getEthersSigner();
    } else if (privyWallet.signer) {
      // Use Privy's signer if available
      signer = privyWallet.signer;
    } else if (privyWallet.address) {
      // Fallback: Create signer from provider
      // Note: This may not work for signing - use Privy's signing methods instead
      // In ethers v6, BrowserProvider.getSigner() doesn't take an address parameter
      if (provider instanceof ethers.BrowserProvider) {
        signer = await (provider as ethers.BrowserProvider).getSigner();
      } else {
        throw new Error('Cannot create signer from provider - use Privy wallet signer instead');
      }
    } else {
      throw new Error('Invalid Privy wallet: missing signer or address');
    }

    const mainAddress = await signer.getAddress();

    // Use provided proxy address, or try to find it
    let finalProxyAddress = proxyAddress?.toLowerCase();
    
    if (!finalProxyAddress) {
      // Find proxy wallet - pass provider for on-chain queries
      const foundProxy = await getPolymarketProxy(mainAddress, provider);
      finalProxyAddress = foundProxy || undefined;
    }

    if (!finalProxyAddress) {
      // If no proxy found, check if main address has positions (might be proxy itself)
      // Or use main address as fallback - Polymarket will handle proxy creation if needed
      console.log(`⚠️ No proxy wallet found for ${mainAddress}, using main address`);
      console.log(`ℹ️ Note: Get your proxy wallet address from your Polymarket profile page`);
      console.log(`ℹ️ Then use: usePolymarketProxy('0xYOUR_PROXY_ADDRESS')`);
      return new PolymarketProxyClient(signer, mainAddress, signatureType);
    }

    if (finalProxyAddress.toLowerCase() === mainAddress.toLowerCase()) {
      console.log(`ℹ️ Proxy address same as main address: ${mainAddress}`);
      console.log(`ℹ️ This might mean positions are under main address, or proxy not yet created`);
    } else {
      console.log(`✅ Proxy wallet found: ${finalProxyAddress} (main: ${mainAddress})`);
      console.log(`ℹ️ Using signature_type: ${signatureType} (2 = browser wallet, 1 = email/Magic)`);
    }
    
    return new PolymarketProxyClient(signer, finalProxyAddress, signatureType);
  } catch (error) {
    console.error('Error creating proxy client:', error);
    return null;
  }
}

/**
 * Sign a message using Privy wallet
 * 
 * @param privyWallet - Privy wallet object
 * @param message - Message to sign
 * @returns Signature string
 */
export async function signWithPrivy(privyWallet: any, message: string): Promise<string> {
  try {
    // Use Privy's signMessage method
    if (typeof privyWallet.signMessage === 'function') {
      return await privyWallet.signMessage(message);
    }
    
    // Fallback: Get ethers signer and sign
    if (typeof privyWallet.getEthersSigner === 'function') {
      const signer = await privyWallet.getEthersSigner();
      return await signer.signMessage(message);
    }
    
    throw new Error('Privy wallet does not support signing');
  } catch (error) {
    console.error('Error signing with Privy:', error);
    throw error;
  }
}

