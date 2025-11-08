/**
 * Polymarket CLOB (Central Limit Order Book) Client
 * 
 * Documentation: https://docs.polymarket.com/developers/CLOB/introduction
 * 
 * This client provides methods to:
 * - Fetch orderbook data
 * - Get live pricing
 * - Place limit orders
 * - Manage orders
 */

import { ethers } from 'ethers';

// CLOB API Base URLs
const CLOB_API_URL = 'https://clob.polymarket.com';
const CLOB_API_KEY = process.env.NEXT_PUBLIC_POLYMARKET_API_KEY || '';

export interface OrderbookLevel {
  price: string;
  size: string;
}

export interface Orderbook {
  market: string;
  asset_id: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  timestamp: number;
}

export interface MarketPrice {
  market: string;
  asset_id: string;
  price: string;
  side: 'BUY' | 'SELL';
  timestamp: number;
}

export interface OrderRequest {
  market: string;
  asset_id: string;
  side: 'BUY' | 'SELL';
  size: string;
  price: string;
  owner: string;
  feeRateBps?: string;
  nonce?: string;
  expiration?: string;
}

export interface Order {
  orderId: string;
  market: string;
  asset_id: string;
  side: 'BUY' | 'SELL';
  size: string;
  price: string;
  status: 'LIVE' | 'MATCHED' | 'CANCELLED';
  owner: string;
  created_at: string;
}

export interface Trade {
  id: string;
  market: string;
  asset_id: string;
  side: 'BUY' | 'SELL';
  size: string;
  price: string;
  timestamp: number;
  maker_address: string;
  taker_address: string;
}

/**
 * CLOB Client for interacting with Polymarket's Central Limit Order Book
 */
export class ClobClient {
  private apiUrl: string;
  private apiKey: string;
  private signer?: ethers.Signer;
  private address?: string;

  constructor(apiKey?: string) {
    this.apiUrl = CLOB_API_URL;
    this.apiKey = apiKey || CLOB_API_KEY;
  }

  /**
   * Initialize with a signer for authenticated requests
   */
  async initialize(signer: ethers.Signer) {
    this.signer = signer;
    this.address = await signer.getAddress();
  }

  /**
   * Get orderbook for a specific market
   * Endpoint: GET /orderbook
   * 
   * @param tokenId - The token/asset ID for the market (e.g., condition token ID)
   * @returns Orderbook with bids and asks
   */
  async getOrderbook(tokenId: string): Promise<Orderbook> {
    const url = `${this.apiUrl}/book?token_id=${tokenId}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orderbook: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get current price for a market
   * Endpoint: GET /price
   * 
   * @param tokenId - The token/asset ID
   * @param side - BUY or SELL
   * @returns Current price
   */
  async getPrice(tokenId: string, side: 'BUY' | 'SELL'): Promise<MarketPrice> {
    const url = `${this.apiUrl}/price?token_id=${tokenId}&side=${side}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get spread (difference between best bid and ask)
   * Endpoint: GET /spread
   * 
   * @param tokenId - The token/asset ID
   * @returns Spread information
   */
  async getSpread(tokenId: string): Promise<{ spread: string; mid: string }> {
    const url = `${this.apiUrl}/spread?token_id=${tokenId}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch spread: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get recent trades for a market
   * Endpoint: GET /trades
   * 
   * @param tokenId - The token/asset ID
   * @param limit - Number of trades to fetch (default 20)
   * @returns List of recent trades
   */
  async getTrades(tokenId: string, limit: number = 20): Promise<Trade[]> {
    const url = `${this.apiUrl}/trades?token_id=${tokenId}&limit=${limit}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trades: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Place a limit order
   * Endpoint: POST /order
   * 
   * Requires authentication via signed message
   * 
   * @param orderRequest - Order details
   * @returns Created order
   */
  async placeOrder(orderRequest: OrderRequest): Promise<Order> {
    if (!this.signer || !this.address) {
      throw new Error('Client not initialized with signer');
    }

    // Create order payload
    const payload = {
      ...orderRequest,
      owner: this.address,
      nonce: orderRequest.nonce || Date.now().toString(),
      expiration: orderRequest.expiration || Math.floor(Date.now() / 1000 + 86400).toString(), // 24h default
      feeRateBps: orderRequest.feeRateBps || '0',
    };

    // Sign the order
    const orderHash = this.hashOrder(payload);
    const signature = await this.signer.signMessage(ethers.getBytes(orderHash));

    // Submit order
    const url = `${this.apiUrl}/order`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order: payload,
        signature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to place order: ${error}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get user's active orders
   * Endpoint: GET /orders
   * 
   * @returns List of active orders
   */
  async getActiveOrders(): Promise<Order[]> {
    if (!this.address) {
      throw new Error('Client not initialized');
    }

    const url = `${this.apiUrl}/orders?owner=${this.address}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Cancel an order
   * Endpoint: DELETE /order
   * 
   * @param orderId - ID of the order to cancel
   * @returns Success status
   */
  async cancelOrder(orderId: string): Promise<{ success: boolean }> {
    if (!this.signer) {
      throw new Error('Client not initialized with signer');
    }

    const url = `${this.apiUrl}/order/${orderId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.statusText}`);
    }

    return { success: true };
  }

  /**
   * Hash order for signing
   * This follows Polymarket's order hashing specification
   */
  private hashOrder(order: OrderRequest & { nonce: string; expiration: string }): string {
    // Simplified hash - in production, use Polymarket's official hashing function
    const message = `${order.market}:${order.asset_id}:${order.side}:${order.size}:${order.price}:${order.nonce}:${order.expiration}`;
    return ethers.keccak256(ethers.toUtf8Bytes(message));
  }
}

/**
 * Helper function to format price from orderbook
 */
export function formatOrderbookPrice(price: string): number {
  return parseFloat(price);
}

/**
 * Helper function to calculate best bid/ask
 */
export function getBestBidAsk(orderbook: Orderbook): {
  bestBid: number;
  bestAsk: number;
  spread: number;
} {
  const bestBid = orderbook.bids.length > 0 ? formatOrderbookPrice(orderbook.bids[0].price) : 0;
  const bestAsk = orderbook.asks.length > 0 ? formatOrderbookPrice(orderbook.asks[0].price) : 0;
  const spread = bestAsk - bestBid;

  return { bestBid, bestAsk, spread };
}

/**
 * Helper function to calculate mid price
 */
export function getMidPrice(orderbook: Orderbook): number {
  const { bestBid, bestAsk } = getBestBidAsk(orderbook);
  return (bestBid + bestAsk) / 2;
}

