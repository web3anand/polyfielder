# Polymarket Architecture & Integration Guide

## 🏗️ Understanding Polymarket's Architecture

Based on the information provided, here's how Polymarket works:

### Key Architecture Points

1. **Proxy Contract System + Off-Chain Order Book (CLOB)**
   - Polymarket uses a proxy contract system
   - Positions/orders are stored in Polymarket's CLOB (off-chain)
   - Data is linked to wallet addresses, not stored directly on-chain

2. **Original Account vs Proxy Wallet**
   - "Original acc" = Your wallet address on-chain (0xABC...)
   - "Proxy wallet" positions = Data in Polymarket's CLOB (needs API query)
   - You need to query Polymarket's infrastructure, not just check on-chain balances

## ✅ What's Already Implemented

### 1. Polygon Network Configuration
- ✅ Privy configured with `defaultChain: polygon`
- ✅ `supportedChains: [polygon]`
- ✅ Wagmi configured for Polygon

### 2. CLOB API Integration
- ✅ `getUserPositions()` - Fetches from `GET /positions?user={address}`
- ✅ `getUserOrders()` - Fetches from `GET /orders?user={address}`
- ✅ `getUserTrades()` - Fetches from `GET /trades?user={address}`

### 3. USDC.e Balance Checking
- ✅ `getUSDCBalance()` - Checks USDC.e on Polygon
- ✅ Contract: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`

### 4. Conditional Token Framework (CTF)
- ✅ `getCTFPositionBalance()` - Checks CTF positions
- ✅ Contract: `0x4D97DCd97eC945f40cF65F87097ACe5EA0476045`

## 📋 Complete Data Flow

### When User Connects Wallet:

```typescript
// 1. User connects via Privy
const { address } = useWallet(); // Gets wallet address

// 2. Query Polymarket CLOB for positions
const positions = await fetch(
  `https://clob.polymarket.com/positions?user=${address}`
).then(r => r.json());

// 3. Query Polymarket CLOB for orders
const orders = await fetch(
  `https://clob.polymarket.com/orders?user=${address}`
).then(r => r.json());

// 4. Check USDC.e balance (on-chain)
const usdcBalance = await getUSDCBalance(address, provider);

// 5. Check CTF positions (on-chain)
const ctfBalance = await getCTFPositionBalance(address, assetId, provider);
```

## 🔍 Data Sources

### Off-Chain (CLOB API)
- **Positions**: `GET /positions?user={address}`
- **Orders**: `GET /orders?user={address}`
- **Trades**: `GET /trades?user={address}`

### On-Chain (Polygon)
- **USDC.e Balance**: ERC20 contract at `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **CTF Positions**: ERC1155 contract at `0x4D97DCd97eC945f40cF65F87097ACe5EA0476045`

## 🎯 Best Practices

### 1. Always Query CLOB API for Positions/Orders
```typescript
// ✅ Correct: Query CLOB API
const positions = await getUserPositions(userAddress);

// ❌ Wrong: Don't just check on-chain balances
// Positions are in CLOB, not directly on wallet
```

### 2. Use Both CLOB and On-Chain Data
```typescript
// Get CLOB positions (off-chain order book)
const clobPositions = await getUserPositions(userAddress);

// Get CTF positions (on-chain tokens)
const ctfPositions = await getAllCTFPositions(userAddress, assetIds, provider);

// Combine for complete picture
```

### 3. Check USDC Balance for Trading
```typescript
// Check if user has USDC for trading
const usdcBalance = await getUSDCBalance(userAddress, provider);
if (parseFloat(usdcBalance) < amount) {
  // Insufficient balance
}
```

## 📊 API Endpoints Summary

### Polymarket CLOB API
- Base URL: `https://clob.polymarket.com`
- Positions: `GET /positions?user={address}`
- Orders: `GET /orders?user={address}`
- Trades: `GET /trades?user={address}`

### On-Chain Contracts (Polygon)
- USDC.e: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- CTF: `0x4D97DCd97eC945f40cF65F87097ACe5EA0476045`

## 🔄 Current Implementation Status

- ✅ Polygon network configured
- ✅ CLOB API integration complete
- ✅ USDC balance checking
- ✅ CTF position checking
- ✅ Positions API route uses CLOB
- ✅ Transactions API route uses CLOB
- ✅ Gasless transactions via Builder Program
- ✅ Safe Wallet deployment

## 🚀 Quick Reference

```typescript
import { 
  getUserPositions, 
  getUserOrders, 
  getUserTrades,
  getUSDCBalance,
  getCTFPositionBalance,
  getAllCTFPositions
} from '@/lib/polymarket-clob';

// After user connects wallet
const { address } = useWallet();

// Fetch all Polymarket data
const [positions, orders, trades, usdcBalance] = await Promise.all([
  getUserPositions(address),
  getUserOrders(address),
  getUserTrades(address),
  getUSDCBalance(address, provider),
]);
```

## 📚 Key Takeaways

1. **Positions/Orders are in CLOB** - Always query API, not just on-chain
2. **USDC balance is on-chain** - Check ERC20 contract
3. **CTF positions are on-chain** - Check ERC1155 contract
4. **Polygon is the network** - All contracts are on Polygon
5. **Proxy wallets work via CLOB** - Query using wallet address

