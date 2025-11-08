'use client';

/**
 * Polymarket Real-Time Data Stream (RTDS) Client
 * Official Documentation: https://docs.polymarket.com/developers/real-time-data-stream/rtds-overview
 * 
 * Endpoint: wss://ws-live-data.polymarket.com
 * 
 * This is the publicly accessible WebSocket for real-time market data.
 * No authentication required for market price updates.
 */

export interface MarketUpdate {
  asset_id: string; // Token ID
  market: string; // Condition ID
  price?: number; // Current price
  size?: number; // Order size
  side?: 'BUY' | 'SELL';
  timestamp: number;
  event_type?: string;
}

export interface WebSocketMessage {
  channel?: string;
  event_type?: string;
  asset_id?: string;
  market?: string;
  price?: string;
  size?: string;
  side?: 'BUY' | 'SELL';
  timestamp?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export class PolymarketWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private pingInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Set<(data: MarketUpdate) => void>> = new Map();
  private isConnected = false;
  private subscribedAssetIds: Set<string> = new Set();

  constructor(
    private apiKey?: string,
    private secret?: string,
    private passphrase?: string
  ) {}

  connect() {
    // DISABLED: Using new polymarketWebSocket.ts service instead
    // This prevents duplicate WebSocket connections
    if (process.env.NODE_ENV === 'development') {
      console.warn('Old WebSocket service connect() called - using new service instead');
    }
    return;
    
    /* DISABLED CODE
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Polymarket Real-Time Data Stream (RTDS)
      // This is publicly accessible and doesn't require authentication
      this.ws = new WebSocket('wss://ws-live-data.polymarket.com');

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startPing();
        
        // Wait a bit for connection to stabilize before sending
        setTimeout(() => {
          this.authenticate();
        }, 100);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          // Error parsing WebSocket message
        }
      };

      this.ws.onerror = () => {
        // WebSocket error
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopPing();
        this.reconnect();
      };
    } catch (error) {
      this.reconnect();
    }
    */ // END DISABLED CODE
  }

  private authenticate() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    // RTDS is publicly accessible and doesn't require authentication
    // Subscribe to market updates immediately
    this.resubscribeToMarkets();
  }

  /**
   * Subscribe to market updates for specific market/asset IDs
   * @param marketIds Array of market/condition IDs to subscribe to
   */
  subscribeToAssets(marketIds: string[]) {
    marketIds.forEach(id => this.subscribedAssetIds.add(id));
    
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscription(marketIds);
    }
  }

  /**
   * Send subscription message for RTDS
   * Format: { type: 'subscribe', channel: 'market', market: '<market_id>' }
   */
  private sendSubscription(marketIds: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || marketIds.length === 0) {
      return;
    }

    try {
      // Subscribe to each market individually
      marketIds.forEach(marketId => {
        const subscribeMessage = {
          type: 'subscribe',
          channel: 'market',
          market: marketId,
        };
        this.ws?.send(JSON.stringify(subscribeMessage));
      });
    } catch (error) {
      // Error subscribing to markets
    }
  }

  /**
   * Resubscribe to all previously subscribed markets (used after reconnect)
   */
  private resubscribeToMarkets() {
    if (this.subscribedAssetIds.size > 0) {
      this.sendSubscription(Array.from(this.subscribedAssetIds));
    }
  }

  subscribeToMarket(marketId: string, callback: (data: MarketUpdate) => void) {
    if (!this.subscribers.has(marketId)) {
      this.subscribers.set(marketId, new Set());
    }
    this.subscribers.get(marketId)?.add(callback);

    // Subscribe to this asset ID
    this.subscribeToAssets([marketId]);
  }

  unsubscribeFromMarket(marketId: string, callback: (data: MarketUpdate) => void) {
    const callbacks = this.subscribers.get(marketId);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(marketId);
        this.subscribedAssetIds.delete(marketId);
      }
    }
  }

  private handleMessage(message: WebSocketMessage) {
    try {
      // RTDS sends different message types
      // Market updates typically include: market, asset_id, price, event_type
      if (message.channel === 'market' || message.market || message.asset_id) {
        this.handleMarketUpdate(message);
      }
    } catch (error) {
      // Skip malformed messages
    }
  }

  private handleMarketUpdate(message: WebSocketMessage) {
    const marketId = message.market || message.asset_id;
    
    if (!marketId) return;

    // Extract price from message
    // RTDS may send price in different formats
    let price: number | undefined;
    if (message.price !== undefined) {
      price = typeof message.price === 'string' ? parseFloat(message.price) : message.price;
    }

    const update: MarketUpdate = {
      asset_id: message.asset_id || marketId,
      market: message.market || marketId,
      price,
      size: message.size ? parseFloat(String(message.size)) : undefined,
      side: message.side,
      event_type: message.event_type || message.channel,
      timestamp: message.timestamp || Date.now(),
    };

    // Notify subscribers for this specific market
    const callbacks = this.subscribers.get(marketId);
    if (callbacks) {
      callbacks.forEach((callback) => callback(update));
    }

    // Also notify general market subscribers
    const generalCallbacks = this.subscribers.get('*');
    if (generalCallbacks) {
      generalCallbacks.forEach((callback) => callback(update));
    }
  }

  private startPing() {
    // Send ping every 5 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 5000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.subscribers.clear();
  }

  isWSConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let wsInstance: PolymarketWebSocket | null = null;

export const getPolymarketWebSocket = (
  apiKey?: string,
  secret?: string,
  passphrase?: string
): PolymarketWebSocket => {
  if (!wsInstance) {
    wsInstance = new PolymarketWebSocket(
      apiKey || process.env.NEXT_PUBLIC_POLYMARKET_BUILDER_API_KEY,
      secret || process.env.NEXT_PUBLIC_POLYMARKET_BUILDER_SECRET,
      passphrase || process.env.NEXT_PUBLIC_POLYMARKET_BUILDER_PASSPHRASE
    );
  }
  return wsInstance;
};


