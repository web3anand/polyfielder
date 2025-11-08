# Polymarket Proxy Wallet Setup Guide

## 🎯 Overview

According to Polymarket documentation, to use the same proxy wallet across different applications, you need to:

1. **Get your proxy wallet address** from your Polymarket profile page
2. **Initialize the CLOB client** with:
   - `funder`: Your proxy wallet address
   - `key`: Your main wallet's private key
   - `signature_type`: `1` for email/Magic, `2` for browser wallets (MetaMask/Privy)

This allows multiple apps to control the same proxy wallet and access the same positions and USDC balance.

## 📍 Finding Your Proxy Wallet Address

1. Go to [Polymarket.com](https://polymarket.com)
2. Log in to your account
3. Navigate to your **Profile page**
4. Your **proxy wallet address** is displayed there

## 🚀 Usage

### Option 1: Manual Proxy Address (Recommended)

If you know your proxy wallet address from your Polymarket profile:

```tsx
import { usePolymarketProxy } from '@/hooks/usePolymarketProxy';

function TradingComponent() {
  // Provide your proxy wallet address from Polymarket profile
  const { proxyClient, proxyAddress, isReady } = usePolymarketProxy(
    '0xYOUR_PROXY_WALLET_ADDRESS', // From Polymarket profile
    2 // signature_type: 2 for browser wallets (Privy/MetaMask), 1 for email/Magic
  );

  const handlePlaceOrder = async () => {
    if (!isReady) {
      alert('Proxy client not ready');
      return;
    }

    try {
      const order = await proxyClient.placeOrder({
        market: 'market-id',
        asset_id: 'asset-id',
        side: 'BUY',
        size: '100',
        price: '0.50',
      });

      console.log('Order placed via proxy:', order);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <p>Proxy Address: {proxyAddress}</p>
      <button onClick={handlePlaceOrder}>Place Order</button>
    </div>
  );
}
```

### Option 2: Auto-Detection

The system will try to auto-detect your proxy wallet:

```tsx
import { usePolymarketProxy } from '@/hooks/usePolymarketProxy';

function TradingComponent() {
  // Auto-detect proxy wallet
  const { proxyClient, proxyAddress, isLoading, error } = usePolymarketProxy();

  if (isLoading) {
    return <div>Loading proxy wallet...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <p>Get your proxy wallet address from your Polymarket profile page</p>
      </div>
    );
  }

  return (
    <div>
      <p>Proxy Address: {proxyAddress}</p>
      {/* Your trading UI */}
    </div>
  );
}
```

## 🔧 Configuration

### Signature Type

- **`1`**: For email/Magic Link wallets
- **`2`**: For browser wallets (MetaMask, Privy, WalletConnect, etc.) - **Default**

```tsx
// Browser wallet (Privy/MetaMask)
usePolymarketProxy('0xPROXY_ADDRESS', 2);

// Email/Magic Link
usePolymarketProxy('0xPROXY_ADDRESS', 1);
```

## 📋 How It Works

1. **Main Wallet** (via Privy) → Signs all transactions
2. **Proxy Wallet** (from Polymarket) → Holds positions/orders and USDC balance
3. **Your App** → Uses main wallet signatures to control proxy wallet

When placing an order:
- Order is placed from **proxy wallet address** (funder)
- Order is **signed by main wallet** (via Privy)
- Positions and USDC are held in **proxy wallet**

## ✅ Benefits

- ✅ **Same proxy wallet** across multiple apps
- ✅ **Access same positions** and USDC balance
- ✅ **Consistent trading** experience
- ✅ **Gasless transactions** (if using Builder Program)

## 🔍 Debugging

If auto-detection doesn't work:

1. **Check browser console** for logs:
   - `🔍 Checking positions response structure:`
   - `✅ Found proxy address from positions:`
   - `⚠️ No proxy wallet found`

2. **Get proxy address manually**:
   - Go to Polymarket profile page
   - Copy your proxy wallet address
   - Use it in `usePolymarketProxy('0xYOUR_PROXY_ADDRESS')`

3. **Check signature type**:
   - Browser wallets (Privy/MetaMask): Use `2`
   - Email/Magic Link: Use `1`

## 📚 References

- [Polymarket CLOB Clients](https://docs.polymarket.com/developers/CLOB/clients)
- [Proxy Wallet Overview](https://docs.polymarket.com/developers/proxy-wallet)
- [Your First Order](https://docs.polymarket.com/developers/CLOB/your-first-order)

## 🎯 Quick Start

1. **Get your proxy wallet address** from Polymarket profile
2. **Use it in your component**:
   ```tsx
   const { proxyClient } = usePolymarketProxy('0xYOUR_PROXY_ADDRESS', 2);
   ```
3. **Place orders** via proxy:
   ```tsx
   await proxyClient.placeOrder({ ... });
   ```

That's it! Your app will now use the same proxy wallet as Polymarket.com.

