'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Orderbook as OrderbookType, OrderbookLevel } from '@/lib/clob-client';

interface OrderbookProps {
  tokenId: string;
  onPriceSelect?: (price: number, side: 'BUY' | 'SELL') => void;
}

export function Orderbook({ tokenId, onPriceSelect }: OrderbookProps) {
  const [orderbook, setOrderbook] = useState<OrderbookType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    bestBid: number;
    bestAsk: number;
    spread: number;
    midPrice: number;
  } | null>(null);

  const fetchOrderbook = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orderbook?tokenId=${tokenId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orderbook');
      }

      const data = await response.json();
      setOrderbook(data.orderbook);
      setMetrics(data.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orderbook');
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    fetchOrderbook();
    // Refresh orderbook every 5 seconds
    const interval = setInterval(fetchOrderbook, 5000);
    return () => clearInterval(interval);
  }, [fetchOrderbook]);

  const handlePriceClick = (price: string, side: 'BUY' | 'SELL') => {
    if (onPriceSelect) {
      onPriceSelect(parseFloat(price), side);
    }
  };

  if (loading && !orderbook) {
    return (
      <div className="orderbook-container">
        <div className="orderbook-loading">
          <div className="spinner" />
          <p>Loading orderbook...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orderbook-container">
        <div className="orderbook-error">
          <p>{error}</p>
          <button onClick={fetchOrderbook} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!orderbook) {
    return null;
  }

  return (
    <div className="orderbook-container">
      <div className="orderbook-header">
        <h3>Order Book</h3>
        {metrics && (
          <div className="orderbook-metrics">
            <div className="metric">
              <span className="metric-label">Spread:</span>
              <span className="metric-value">
                {(metrics.spread * 100).toFixed(2)}%
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Mid:</span>
              <span className="metric-value">
                ${metrics.midPrice.toFixed(3)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="orderbook-table">
        {/* Asks (Sell Orders) - displayed in reverse */}
        <div className="orderbook-asks">
          <div className="orderbook-table-header">
            <span>Price</span>
            <span>Size</span>
            <span>Total</span>
          </div>
          {orderbook.asks.slice(0, 10).reverse().map((ask, index) => {
            const total = orderbook.asks
              .slice(0, orderbook.asks.length - index)
              .reduce((sum, level) => sum + parseFloat(level.size), 0);
            
            return (
              <div
                key={`ask-${index}`}
                className="orderbook-row orderbook-ask"
                onClick={() => handlePriceClick(ask.price, 'SELL')}
              >
                <span className="price ask-price">${parseFloat(ask.price).toFixed(3)}</span>
                <span className="size">{parseFloat(ask.size).toFixed(2)}</span>
                <span className="total">{total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {/* Spread */}
        {metrics && (
          <div className="orderbook-spread">
            <div className="spread-value">
              ${metrics.bestBid.toFixed(3)} / ${metrics.bestAsk.toFixed(3)}
            </div>
            <div className="spread-label">
              Spread: {(metrics.spread * 100).toFixed(2)}%
            </div>
          </div>
        )}

        {/* Bids (Buy Orders) */}
        <div className="orderbook-bids">
          {orderbook.bids.slice(0, 10).map((bid, index) => {
            const total = orderbook.bids
              .slice(0, index + 1)
              .reduce((sum, level) => sum + parseFloat(level.size), 0);
            
            return (
              <div
                key={`bid-${index}`}
                className="orderbook-row orderbook-bid"
                onClick={() => handlePriceClick(bid.price, 'BUY')}
              >
                <span className="price bid-price">${parseFloat(bid.price).toFixed(3)}</span>
                <span className="size">{parseFloat(bid.size).toFixed(2)}</span>
                <span className="total">{total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

