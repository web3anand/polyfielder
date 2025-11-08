'use client';

import { useEffect, useState, useCallback } from 'react';
import { getPolymarketWebSocket, type MarketUpdate } from './polymarket-websocket';

export interface LiveMarket {
  id: string;
  asset_id?: string; // Token ID
  question: string;
  liquidity: number;
  odds: {
    yes: number;
    no: number;
  };
  sport?: string;
  lastUpdate: number;
}

export function useLiveMarkets(marketIds?: string[]) {
  const [markets, setMarkets] = useState<Map<string, LiveMarket>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  const handleMarketUpdate = useCallback((update: MarketUpdate) => {
    setMarkets((prev) => {
      const newMarkets = new Map(prev);
      const marketKey = update.market || update.asset_id;
      if (!marketKey) return prev;
      
      const existing = newMarkets.get(marketKey);

      // Update market with new price data from WebSocket
      const updatedMarket: LiveMarket = {
        id: marketKey,
        asset_id: update.asset_id,
        question: existing?.question || 'Unknown Market',
        liquidity: existing?.liquidity || 0,
        odds: update.price !== undefined 
          ? {
              yes: update.price,
              no: 1 - update.price,
            }
          : existing?.odds || { yes: 0.5, no: 0.5 },
        sport: existing?.sport,
        lastUpdate: update.timestamp,
      };

      newMarkets.set(marketKey, updatedMarket);
      return newMarkets;
    });
  }, []);

  useEffect(() => {
    const ws = getPolymarketWebSocket();
    
    // Subscribe to all markets or specific ones
    if (marketIds && marketIds.length > 0) {
      marketIds.forEach((marketId) => {
        ws.subscribeToMarket(marketId, handleMarketUpdate);
      });
    } else {
      // Subscribe to all market updates
      ws.subscribeToMarket('*', handleMarketUpdate);
    }

    // Connect if not already connected
    if (!ws.isWSConnected()) {
      ws.connect();
    }

    // Check connection status
    const checkConnection = setInterval(() => {
      setIsConnected(ws.isWSConnected());
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      // Note: We don't disconnect the singleton to allow reuse
      // If you need to fully disconnect, call ws.disconnect()
    };
  }, [marketIds, handleMarketUpdate]);

  return {
    markets: Array.from(markets.values()),
    isConnected,
    getMarket: (marketId: string) => markets.get(marketId),
  };
}

