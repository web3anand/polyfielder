# Gasless Transactions & Polymarket CLOB Integration Guide

## ✅ Implementation Complete

Your app now supports:
1. **Gasless transactions** via Polymarket Builder Program
2. **Polymarket CLOB API integration** to fetch user positions/orders from existing proxy wallets
3. **Polygon network** as default (already configured)

## 🔧 What Was Updated

### 1. **Polymarket CLOB Client** (`lib/polymarket-clob.ts`)
- `getUserPositions()` - Fetches positions from Polymarket CLOB
- `getUserOrders()` - Fetches orders from Polymarket CLOB
- `getUserTrades()` - Fetches trades from Polymarket CLOB
- `getUSDCBalance()` - Gets USDC.e balance on Polygon
- `getMarketFromAssetId()` - Gets market info from asset_id

### 2. **API Routes Updated**

#### `/api/user/positions` 
- Now fetches from Polymarket CLOB API: `GET /positions?user={address}`
- Uses existing Polymarket proxy wallets
- Returns real positions from Polymarket infrastructure

#### `/api/user/transactions`
- Now fetches from Polymarket CLOB API: `GET /orders?user={address}` and `GET /trades?user={address}`
- Combines trades and orders into transaction history
- Uses existing Polymarket data

### 3. **Gasless Transactions**
- Builder Program integration already exists in `lib/pm-builder.ts`
- Dashboard already uses `placeBetWithBuilder()` when Builder keys are configured
- Privy is configured with Polygon as default chain

## 🚀 How It Works

### Using Existing Polymarket Proxy Wallets

When a user connects their wallet (via Privy), your app:

1. **Authenticates** the user with Privy
2. **Gets wallet address** from Privy
3. **Queries Polymarket CLOB** using that address:
   ```typescript
   // Fetch positions
   const positions = await fetch(
     `https://clob.polymarket.com/positions?user=${userAddress}`
   ).then(r => r.json());
   
   // Fetch orders
   const orders = await fetch(
     `https://clob.polymarket.com/orders?user=${userAddress}`
   ).then(r => r.json());
   ```

4. **Displays data** from Polymarket's infrastructure

**Key Point**: Polymarket stores positions/orders in their CLOB (off-chain order book), not directly on the wallet. The wallet address is used to query Polymarket's API.

### Gasless Transactions Setup

To enable gasless transactions:

1. **Register for Builder Program**
   - Go to: https://docs.polymarket.com/developers/builders/builder-intro
   - Create builder profile
   - Get API keys: `apiKey`, `secret`, `passphrase`

2. **Add to `.env.local`**:
   ```env
   POLYMARKET_BUILDER_API_KEY=your-api-key
   POLYMARKET_BUILDER_SECRET=your-secret
   POLYMARKET_BUILDER_PASSPHRASE=your-passphrase
   ```

3. **Deploy Safe Wallets** (optional, for users without MATIC):
   ```typescript
   import { initPMWithBuilder, deploySafeWallet } from '@/lib/pm-builder';
   
   const { relayerClient } = await initPMWithBuilder(signer);
   const safeWallet = await deploySafeWallet(relayerClient, userAddress);
   ```

4. **Place Gasless Bets**:
   ```typescript
   import { placeBetWithBuilder } from '@/lib/pm-builder';
   
   // This is already implemented in Dashboard.tsx
   if (relayerClient && useBuilder) {
     const order = await placeBetWithBuilder(
       relayerClient,
       marketId,
       outcome,
       amount
     );
     // Gas is paid by Polymarket!
   }
   ```

## 📋 Current Flow

### Portfolio Page
1. User authenticates with Privy
2. App calls `/api/user/positions`
3. API queries `https://clob.polymarket.com/positions?user={address}`
4. Returns positions from Polymarket CLOB
5. Displays in UI

### History Page
1. User authenticates with Privy
2. App calls `/api/user/transactions`
3. API queries:
   - `https://clob.polymarket.com/trades?user={address}`
   - `https://clob.polymarket.com/orders?user={address}`
4. Combines and returns transaction history
5. Displays in UI

### Betting Flow
1. User clicks "Yes" or "No" on a market
2. Betting modal opens
3. User enters amount
4. Clicks "Place Bet"
5. If Builder Program is configured:
   - Uses `placeBetWithBuilder()` → **Gasless!**
   - Polymarket relayer pays gas
6. If not configured:
   - Falls back to standard bet placement
   - User needs MATIC for gas

## 🔐 Security Notes

1. **Builder Keys**: Keep server-side only (already in `.env.local`)
2. **User Address**: Retrieved from Privy auth token (verified server-side)
3. **CLOB API**: Public endpoints, no auth required for reading positions/orders
4. **Order Placement**: Requires wallet signature (handled client-side)

## 🧪 Testing

### Test CLOB Integration
```bash
# Test positions endpoint
curl "https://clob.polymarket.com/positions?user=0xYourAddress"

# Test orders endpoint
curl "https://clob.polymarket.com/orders?user=0xYourAddress"
```

### Test Gasless Transactions
1. Add Builder Program keys to `.env.local`
2. Restart dev server
3. Connect wallet via Privy
4. Place a bet
5. Check console for "GASLESS" message

## 📚 References

- [Polymarket Builder Program](https://docs.polymarket.com/developers/builders/builder-intro)
- [CLOB API Documentation](https://docs.polymarket.com/developers/CLOB/introduction)
- [Polygon Network](https://polygon.technology/)

## ✅ Checklist

- [x] CLOB API client created
- [x] Positions API updated to use CLOB
- [x] Transactions API updated to use CLOB
- [x] Polygon network configured in Privy
- [x] Builder Program integration ready
- [ ] Builder Program keys added to `.env.local` (you need to do this)
- [ ] Test gasless transactions (after adding keys)

## 🎯 Next Steps

1. **Register for Builder Program** and get API keys
2. **Add keys to `.env.local`**
3. **Test gasless transactions**
4. **Deploy Safe Wallets** for users without MATIC (optional)
5. **Monitor Builder Leaderboard** for volume tracking

