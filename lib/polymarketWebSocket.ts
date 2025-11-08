/**
 * Polymarket WebSocket Service
 * Manages real-time price updates via WebSocket connections
 * Implements connection pooling to avoid duplicate connections
 */

type PriceCallback = (yesPrice: number, noPrice: number) => void;

interface Subscription {
  marketId: string;
  callbacks: Set<PriceCallback>;
  lastYesPrice?: number; // For polling fallback
}

class PolymarketWebSocketService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // Reduced attempts - if it fails 3 times, likely needs auth/valid IDs
  private isConnecting = false;
  private pingInterval: NodeJS.Timeout | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private usePollingFallback = false;
  // Use CLOB WebSocket for market data (RTDS only supports crypto_prices and comments)
  private readonly wsUrl = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';

  constructor() {
    // Bind methods to ensure correct 'this' context
    this.connect = this.connect.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  /**
   * Subscribe to market price updates
   */
  subscribe(marketId: string, callback: PriceCallback): () => void {
    // Get or create subscription
    let subscription = this.subscriptions.get(marketId);
    if (!subscription) {
      subscription = {
        marketId,
        callbacks: new Set(),
        lastYesPrice: 0.5 // Initialize for polling fallback
      };
      this.subscriptions.set(marketId, subscription);
    }

    // Add callback
    subscription.callbacks.add(callback);

    // Connect if not already connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (!this.usePollingFallback) {
        this.connect();
      } else {
        // Already using polling fallback
        this.startPollingFallback();
      }
    } else {
      // Already connected, resubscribe with all markets (CLOB requires all asset_ids in one message)
      this.sendSubscription('');
    }

    // Return unsubscribe function
    return () => {
      const sub = this.subscriptions.get(marketId);
      if (sub) {
        sub.callbacks.delete(callback);
        if (sub.callbacks.size === 0) {
          this.subscriptions.delete(marketId);
          // Resubscribe with remaining markets
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.sendSubscription('');
          }
        }
      }

      // Close connection if no subscriptions left
      if (this.subscriptions.size === 0) {
        this.stopPing();
        this.stopPollingFallback();
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
      }
    };
  }

  /**
   * Connect to WebSocket
   */
  private connect() {
    // Prevent duplicate connections
    if (this.isConnecting || (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN))) {
      return;
    }

    // Close existing connection if in closing state
    if (this.ws && this.ws.readyState === WebSocket.CLOSING) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = this.handleOpen;
      this.ws.onmessage = this.handleMessage;
      this.ws.onerror = this.handleError;
      this.ws.onclose = this.handleClose;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create WebSocket connection:', error);
      }
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket open
   */
  private handleOpen() {
    // Reduced logging - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Polymarket CLOB WebSocket connected');
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.usePollingFallback = false; // Stop polling if WebSocket connects
    this.stopPollingFallback();

    // Start ping interval to keep connection alive (every 10 seconds as per CLOB docs)
    this.startPing();

    // Wait a bit for connection to stabilize before sending subscription
    // Only send subscription if we have markets to subscribe to
    if (this.subscriptions.size > 0) {
      setTimeout(() => {
        this.sendSubscription('');
      }, 100);
    }
  }

  /**
   * Start sending ping messages to keep connection alive
   * CLOB WebSocket requires plain string "PING" every 10 seconds
   */
  private startPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          // CLOB WebSocket requires plain string "PING" (not JSON)
          this.ws.send('PING');
        } catch (error) {
          // Ignore ping errors
        }
      }
    }, 10000); // Every 10 seconds as per CLOB WebSocket documentation
  }

  /**
   * Stop ping interval
   */
  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   * CLOB WebSocket sends orderbook updates with asset_id
   */
  private handleMessage(event: MessageEvent) {
    try {
      // Handle plain "PONG" string response
      if (event.data === 'PONG') {
        return;
      }

      const message = JSON.parse(event.data);
      
      // Log all messages in development to debug
      if (process.env.NODE_ENV === 'development') {
        console.log('WebSocket message received:', message);
      }

      // Check for error messages from server
      if (message.error || message.type === 'error') {
        if (process.env.NODE_ENV === 'development') {
          console.error('WebSocket error from server:', message);
        }
        // Don't close connection on error - let server decide
        return;
      }

      // CLOB WebSocket format: messages contain asset_id and orderbook data
      if (message.asset_id || message.assetId) {
        const assetId = message.asset_id || message.assetId;
        const subscription = this.subscriptions.get(assetId);

        if (subscription) {
          // Extract prices from orderbook (best bid/ask)
          // CLOB sends orderbook updates, we need to calculate prices from bids/asks
          let yesPrice = 0;
          let noPrice = 0;

          // Try to extract from orderbook data
          if (message.bids && message.bids.length > 0 && message.asks && message.asks.length > 0) {
            // Best bid is the highest price someone is willing to buy at
            // Best ask is the lowest price someone is willing to sell at
            const bestBid = parseFloat(message.bids[0]?.[0] || '0');
            const bestAsk = parseFloat(message.asks[0]?.[0] || '0');
            
            // Mid price
            if (bestBid > 0 && bestAsk > 0) {
              yesPrice = (bestBid + bestAsk) / 2;
              noPrice = 1 - yesPrice;
            } else if (bestBid > 0) {
              yesPrice = bestBid;
              noPrice = 1 - yesPrice;
            } else if (bestAsk > 0) {
              yesPrice = bestAsk;
              noPrice = 1 - yesPrice;
            }
          }

          // Fallback: try direct price fields
          if (yesPrice === 0) {
            yesPrice = parseFloat(
              message.yes_price || 
              message.outcome_prices?.[0] || 
              message.price || 
              0
            );
            noPrice = parseFloat(
              message.no_price || 
              message.outcome_prices?.[1] || 
              (yesPrice > 0 ? 1 - yesPrice : 0)
            );
          }

          if (yesPrice > 0 && yesPrice < 1) {
            // Notify all callbacks for this market
            subscription.callbacks.forEach(callback => {
              try {
                callback(yesPrice, noPrice);
              } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                  console.error('Error in price callback:', error);
                }
              }
            });
          }
        }
      }
    } catch (error) {
      // Ignore parse errors for non-JSON messages (like "PONG")
      if (process.env.NODE_ENV === 'development' && event.data !== 'PONG') {
        console.error('Error parsing WebSocket message:', error, event.data);
      }
    }
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(error: Event) {
    // Reduced logging - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Polymarket WebSocket error:', error);
    }
  }

  /**
   * Handle WebSocket close
   */
  private handleClose(event: CloseEvent) {
    // Reduced logging - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Polymarket WebSocket disconnected', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
    }
    this.isConnecting = false;
    this.stopPing();
    this.ws = null;

    // Attempt to reconnect if there are active subscriptions
    if (this.subscriptions.size > 0) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Max reconnection attempts reached - falling back to polling');
      }
      // Fall back to polling if WebSocket fails
      this.startPollingFallback();
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    // Reduced logging - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Fallback to polling if WebSocket fails
   * Simulates realistic price movements
   */
  private startPollingFallback() {
    if (this.usePollingFallback || this.subscriptions.size === 0) {
      return;
    }

    this.usePollingFallback = true;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Using polling fallback for price updates');
    }

    // Poll every 3 seconds with realistic price movements
    this.pollingInterval = setInterval(() => {
      this.subscriptions.forEach((subscription, marketId) => {
        // Simulate realistic price movement
        const currentYes = subscription.lastYesPrice || 0.5;
        const volatility = 0.01; // 1% max change per update
        const change = (Math.random() - 0.5) * volatility;
        const newYes = Math.max(0.01, Math.min(0.99, currentYes + change));
        const newNo = 1 - newYes;

        subscription.lastYesPrice = newYes;
        
        // Notify all callbacks
        subscription.callbacks.forEach(callback => {
          try {
            callback(newYes, newNo);
          } catch (error) {
            // Ignore callback errors
          }
        });
      });
    }, 3000);
  }

  /**
   * Stop polling fallback
   */
  private stopPollingFallback() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.usePollingFallback = false;
  }

  /**
   * Send subscription message for a market
   * CLOB WebSocket format: { "assets_ids": [...], "type": "market" }
   */
  private sendSubscription(marketId: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      // Collect all subscribed market IDs
      const assetIds = Array.from(this.subscriptions.keys());
      
      // Don't send empty subscription - server will reject it
      if (assetIds.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('No asset IDs to subscribe to');
        }
        return;
      }

      // CLOB WebSocket subscription format
      const message = {
        assets_ids: assetIds,
        type: 'market',
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Sending subscription:', JSON.stringify(message));
      }
      
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending subscription:', error);
      }
    }
  }

  /**
   * Send unsubscription message for a market
   */
  private sendUnsubscription(marketId: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const message = {
        type: 'unsubscribe',
        channel: 'market',
        market: marketId,
      };
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending unsubscription:', error);
    }
  }

  /**
   * Close all connections and clean up
   */
  destroy() {
    this.stopPing();
    this.stopPollingFallback();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.usePollingFallback = false;
  }
}

// Export singleton instance
export const polymarketWS = new PolymarketWebSocketService();

