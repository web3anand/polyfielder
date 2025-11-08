# Polymarket Proxy Wallet Trading Guide

## 🎯 Overview

This guide explains how to use Polymarket proxy wallets for trading in your app. Proxy wallets allow you to:
- **Main wallet** (via Privy) signs messages/transactions
- **Proxy wallet** holds positions/orders on Polymarket
- **Your app** uses main wallet signatures to control proxy

## 🏗️ Architecture

```
┌─────────────────┐
│  Main Wallet    │  ← User connects via Privy
│  (0xABC...)     │  ← Signs all transactions
└────────┬────────┘
         │
         │ Signs messages
         │
         ▼
┌─────────────────┐
│  Proxy Wallet   │  ← Holds positions/orders
│  (0xPROXY...)   │  ← Controlled by main wallet
└─────────────────┘
         │
         │ Places orders
         │
         ▼
┌─────────────────┐
│  Polymarket     │
│  CLOB API       │
└─────────────────┘
```

## 📦 Installation

The proxy wallet client is already included in the project:

```typescript
import { PolymarketProxyClient, createProxyClient, getPolymarketProxy } from '@/lib/polymarket-proxy';
import { usePolymarketProxy } from '@/hooks/usePolymarketProxy';
```

## 🚀 Quick Start

### Option 1: Using the Hook (Recommended)

```tsx
'use client';

import { usePolymarketProxy } from '@/hooks/usePolymarketProxy';

function TradingComponent() {
  const { 
    proxyClient, 
    proxyAddress, 
    isLoading, 
    placeOrder,
    isReady 
  } = usePolymarketProxy();

  const handlePlaceOrder = async () => {
    if (!isReady) {
      alert('Proxy client not ready');
      return;
    }

    try {
      const order = await placeOrder({
        market: 'market-id',
        asset_id: 'asset-id',
        side: 'BUY',
        size: '100',
        price: '0.50',
      });

      console.log('Order placed:', order);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  if (isLoading) {
    return <div>Loading proxy wallet...</div>;
  }

  return (
    <div>
      <p>Proxy Address: {proxyAddress}</p>
      <button onClick={handlePlaceOrder}>Place Order</button>
    </div>
  );
}
```

### Option 2: Manual Setup

```tsx
'use client';

import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { createProxyClient } from '@/lib/polymarket-proxy';
import { useEffect, useState } from 'react';

function TradingComponent() {
  const { wallets } = useWallets();
  const [proxyClient, setProxyClient] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (!wallets || wallets.length === 0) return;

      const mainWallet = wallets[0];
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const client = await createProxyClient(mainWallet, provider);
      setProxyClient(client);
    };

    init();
  }, [wallets]);

  const handlePlaceOrder = async () => {
    if (!proxyClient) return;

    const order = await proxyClient.placeOrder({
      market: 'market-id',
      asset_id: 'asset-id',
      side: 'BUY',
      size: '100',
      price: '0.50',
    });

    console.log('Order placed:', order);
  };

  return (
    <button onClick={handlePlaceOrder} disabled={!proxyClient}>
      Place Order
    </button>
  );
}
```

## 🔍 Finding Proxy Wallet Address

The `getPolymarketProxy()` function automatically finds the proxy wallet:

1. **Checks CLOB API** for existing positions/orders
2. **Queries Polymarket's proxy contract** (if available)
3. **Falls back to main address** if no proxy found

```typescript
const proxyAddress = await getPolymarketProxy(mainWalletAddress);
// Returns: '0xproxy...' or null
```

## 📝 Placing Orders

### Basic Order

```typescript
const order = await proxyClient.placeOrder({
  market: 'market-id',
  asset_id: '0x123...', // Condition token ID
  side: 'BUY',          // or 'SELL'
  size: '100',          // Number of shares
  price: '0.50',        // Price per share
});
```

### Order Flow

1. **Create order data** with proxy address
2. **Sign with main wallet** (via Privy)
3. **Submit to Polymarket CLOB** with signature
4. **Order is placed** from proxy address

## ❌ Canceling Orders

```typescript
const success = await proxyClient.cancelOrder('order-id');
```

## 📊 Getting Positions & Orders

```typescript
// Get all positions
const positions = await proxyClient.getPositions();

// Get all orders
const orders = await proxyClient.getOrders();
```

## 🔐 Signing with Privy

The proxy client automatically handles Privy signing:

```typescript
// Automatically uses Privy's getEthersSigner()
const signer = await privyWallet.getEthersSigner();
const signature = await signer.signMessage(message);
```

## 🎨 Integration Example

### Update Dashboard to Use Proxy Wallets

```tsx
// components/Dashboard.tsx
import { usePolymarketProxy } from '@/hooks/usePolymarketProxy';

function DashboardContent() {
  const { proxyClient, proxyAddress, placeOrder, isReady } = usePolymarketProxy();

  const handleBet = async (marketId: string, outcome: 'YES' | 'NO', amount: string) => {
    if (!isReady) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Get market info to find asset_id
      const market = markets.find(m => m.id === marketId);
      const assetId = outcome === 'YES' 
        ? market?.yesAssetId 
        : market?.noAssetId;

      // Get current price from market
      const price = outcome === 'YES' 
        ? market?.yesPrice || '0.50'
        : market?.noPrice || '0.50';

      // Place order via proxy
      const order = await placeOrder({
        market: marketId,
        asset_id: assetId,
        side: 'BUY',
        size: amount,
        price: price,
      });

      alert(`✅ Order placed via proxy wallet! ${outcome} $${amount}`);
      console.log('Order:', order);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  return (
    <div>
      {proxyAddress && (
        <p>Trading via proxy: {proxyAddress}</p>
      )}
      {/* ... rest of dashboard */}
    </div>
  );
}
```

## ⚠️ Important Notes

1. **Proxy Address**: Always use `proxyAddress` for trading, not main address
2. **Main Wallet Signs**: All signatures come from main wallet (via Privy)
3. **Proxy Holds Positions**: Positions are stored under proxy address
4. **Automatic Creation**: Polymarket creates proxy if it doesn't exist

## 🔄 Testing Flow

1. **Connect main wallet** via Privy → `0x4e7f...`
2. **Find proxy** → `0xproxy...` (or use main if none)
3. **Place order** → signed by `0x4e7f...`, executed from `0xproxy...`
4. **Position shows** under proxy address

## 📚 API Reference

### `PolymarketProxyClient`

```typescript
class PolymarketProxyClient {
  getProxyAddress(): string;
  getMainAddress(): Promise<string>;
  placeOrder(params: OrderParams): Promise<ProxyOrder>;
  cancelOrder(orderId: string): Promise<boolean>;
  getPositions(): Promise<any[]>;
  getOrders(): Promise<ProxyOrder[]>;
}
```

### `usePolymarketProxy` Hook

```typescript
const {
  proxyClient,      // PolymarketProxyClient instance
  proxyAddress,     // Proxy wallet address
  isLoading,        // Loading state
  error,            // Error message
  placeOrder,       // Place order function
  cancelOrder,      // Cancel order function
  getPositions,     // Get positions function
  getOrders,        // Get orders function
  isReady,          // Ready state
} = usePolymarketProxy();
```

## 🐛 Troubleshooting

### "Proxy client not initialized"
- Ensure wallet is connected via Privy
- Check that `useWallets()` returns a wallet

### "Failed to place order"
- Verify market ID and asset ID are correct
- Check that price and size are valid numbers
- Ensure main wallet has sufficient balance

### "No proxy wallet found"
- This is normal for new users
- Proxy will be created automatically on first trade
- Main address is used as fallback

## 📖 References

- [Polymarket Proxy Wallet Docs](https://docs.polymarket.com/developers/proxy-wallet)
- [Polymarket CLOB API](https://docs.polymarket.com/developers/CLOB/introduction)
- [Privy Wallet Integration](https://docs.privy.io/guide/react/wallets)

