'use client';

import { useState, useEffect, useCallback } from 'react';
import { Orderbook } from './Orderbook';

interface OrderFormProps {
  marketId: string;
  tokenId: string;
  outcome: 'YES' | 'NO';
  currentPrice: number;
  onPlaceOrder: (params: {
    market_id: string;
    token_id: string;
    side: 'BUY' | 'SELL';
    size: string;
    price: string;
    orderType: 'market' | 'limit';
  }) => Promise<void>;
  onCancel: () => void;
}

export function OrderForm({
  marketId,
  tokenId,
  outcome,
  currentPrice,
  onPlaceOrder,
  onCancel,
}: OrderFormProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [amount, setAmount] = useState('100');
  const [price, setPrice] = useState(currentPrice.toFixed(3));
  const [loading, setLoading] = useState(false);
  const [livePrice, setLivePrice] = useState(currentPrice);
  const [showOrderbook, setShowOrderbook] = useState(true);

  // Fetch live price
  const fetchLivePrice = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/price?tokenId=${tokenId}&side=${outcome === 'YES' ? 'BUY' : 'SELL'}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const newPrice = parseFloat(data.price.price || data.price);
        setLivePrice(newPrice);
        
        // Update price input if in market order mode
        if (orderType === 'market') {
          setPrice(newPrice.toFixed(3));
        }
      }
    } catch (error) {
      // Silently fail - use current price as fallback
    }
  }, [tokenId, outcome, orderType]);

  useEffect(() => {
    fetchLivePrice();
    // Refresh price every 3 seconds
    const interval = setInterval(fetchLivePrice, 3000);
    return () => clearInterval(interval);
  }, [fetchLivePrice]);

  // Update price when switching between market/limit
  useEffect(() => {
    if (orderType === 'market') {
      setPrice(livePrice.toFixed(3));
    }
  }, [orderType, livePrice]);

  const handlePriceSelect = (selectedPrice: number, _side: 'BUY' | 'SELL') => {
    if (orderType === 'limit') {
      setPrice(selectedPrice.toFixed(3));
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!price || parseFloat(price) <= 0 || parseFloat(price) > 1) {
      alert('Please enter a valid price between 0 and 1');
      return;
    }

    setLoading(true);
    try {
      await onPlaceOrder({
        market_id: marketId,
        token_id: tokenId,
        side: outcome === 'YES' ? 'BUY' : 'SELL',
        size: amount,
        price: price,
        orderType,
      });
    } catch (error) {
      alert('Failed to place order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const estimatedCost = parseFloat(amount) * parseFloat(price);
  const estimatedShares = parseFloat(amount);
  const maxPayout = estimatedShares * 1.0; // $1 per share if outcome is correct

  return (
    <div className="order-form-container">
      <div className="order-form-header">
        <h3>Place Order - {outcome}</h3>
        <button onClick={onCancel} className="order-form-close">
          ✕
        </button>
      </div>

      <div className="order-form-body">
        {/* Order Type Selector */}
        <div className="order-type-selector">
          <button
            className={`order-type-button ${orderType === 'market' ? 'active' : ''}`}
            onClick={() => setOrderType('market')}
          >
            Market Order
          </button>
          <button
            className={`order-type-button ${orderType === 'limit' ? 'active' : ''}`}
            onClick={() => setOrderType('limit')}
          >
            Limit Order
          </button>
        </div>

        {/* Live Price Display */}
        <div className="live-price-display">
          <div className="live-price-label">
            <span>Live {outcome} Price</span>
            <span className="live-indicator">●</span>
          </div>
          <div className="live-price-value">
            ${livePrice.toFixed(3)}
          </div>
        </div>

        {/* Amount Input */}
        <div className="order-input-group">
          <label>Amount (Shares)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="order-input"
            step="1"
            min="1"
          />
        </div>

        {/* Price Input */}
        <div className="order-input-group">
          <label>
            Price per Share
            {orderType === 'market' && <span className="order-hint">(Current market price)</span>}
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.000"
            className="order-input"
            step="0.001"
            min="0.001"
            max="0.999"
            disabled={orderType === 'market'}
          />
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <div className="order-summary-row">
            <span>Estimated Cost:</span>
            <span className="order-summary-value">${estimatedCost.toFixed(2)}</span>
          </div>
          <div className="order-summary-row">
            <span>Shares:</span>
            <span className="order-summary-value">{estimatedShares.toFixed(0)}</span>
          </div>
          <div className="order-summary-row">
            <span>Max Payout:</span>
            <span className="order-summary-value highlight">${maxPayout.toFixed(2)}</span>
          </div>
          <div className="order-summary-row">
            <span>Potential Profit:</span>
            <span className={`order-summary-value ${maxPayout - estimatedCost > 0 ? 'positive' : ''}`}>
              ${(maxPayout - estimatedCost).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="order-submit-button"
        >
          {loading ? 'Placing Order...' : `Place ${orderType === 'market' ? 'Market' : 'Limit'} Order`}
        </button>

        {/* Orderbook Toggle */}
        {orderType === 'limit' && (
          <button
            onClick={() => setShowOrderbook(!showOrderbook)}
            className="orderbook-toggle"
          >
            {showOrderbook ? 'Hide' : 'Show'} Order Book
          </button>
        )}

        {/* Orderbook */}
        {showOrderbook && orderType === 'limit' && (
          <Orderbook
            tokenId={tokenId}
            onPriceSelect={handlePriceSelect}
          />
        )}
      </div>
    </div>
  );
}

