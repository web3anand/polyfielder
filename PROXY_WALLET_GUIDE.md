# Polymarket Proxy Wallets & Safe Wallets Guide

## 🔑 Understanding Proxy Wallets vs Safe Wallets

### Polymarket's Email-Based Proxy Wallets
- **Created by**: Polymarket (for users who sign up with email on Polymarket.com)
- **Access**: **NOT available to third-party builders**
- **Purpose**: Allow email users to trade without MetaMask
- **Control**: User controls via email magic links (non-custodial)
- **Location**: Polygon blockchain

**Important**: You **cannot** directly access or deploy Polymarket's email-based proxy wallets in your dApp.

### Safe Wallets (via Builder Program)
- **Created by**: You (as a Builder) using Builder Relayer Client
- **Access**: Available via Builder Program
- **Purpose**: Gasless transactions for your users
- **Control**: User controls via their EOA (Externally Owned Account)
- **Location**: Polygon blockchain (Smart Contract)

**This is what you can deploy!**

## 🚀 How to Deploy Safe Wallets for Your Users

### Step 1: Check if User Has Safe Wallet

```typescript
import { RelayClient } from '@polymarket/builder-relayer-client';

async function checkSafeWallet(client: RelayClient, userAddress: string): Promise<string | null> {
  try {
    // Check if Safe Wallet exists for this user
    // The Safe Wallet address is deterministic based on user's EOA
    const safeAddress = await client.getSafeAddress(userAddress);
    return safeAddress;
  } catch (error) {
    // Safe Wallet doesn't exist yet
    return null;
  }
}
```

### Step 2: Deploy Safe Wallet (if needed)

```typescript
async function deploySafeWallet(client: RelayClient, userAddress: string): Promise<string> {
  try {
    // Deploy Safe Wallet for user
    // This is gasless - Polymarket pays for deployment
    const response = await client.deploySafe();
    const result = await response.wait();
    
    // Get the deployed Safe Wallet address
    const safeAddress = result.safeAddress || result.address;
    
    console.log(`Safe Wallet deployed at: ${safeAddress}`);
    return safeAddress;
  } catch (error) {
    console.error('Error deploying Safe Wallet:', error);
    throw error;
  }
}
```

### Step 3: Use Safe Wallet for Transactions

```typescript
// After deploying Safe Wallet, all transactions are gasless
const order = await placeBetWithBuilder(relayerClient, marketId, 'YES', '100');
// Gas is paid by Polymarket's relayer!
```

## 📋 Complete Implementation Flow

```typescript
import { initPMWithBuilder, deploySafeWallet } from '@/lib/pm-builder';
import { useAuth } from '@/contexts/AuthContext';

async function setupUserWallet() {
  // 1. Get user's wallet address
  const { userAddress } = useAuth();
  
  // 2. Initialize Builder Relayer Client
  const { relayerClient } = await initPMWithBuilder(signer);
  
  // 3. Check if Safe Wallet exists
  let safeAddress = await checkSafeWallet(relayerClient, userAddress);
  
  // 4. Deploy if doesn't exist
  if (!safeAddress) {
    safeAddress = await deploySafeWallet(relayerClient, userAddress);
    // Store safeAddress in your database for future reference
    await saveSafeWalletAddress(userAddress, safeAddress);
  }
  
  // 5. Now user can trade gaslessly!
  return safeAddress;
}
```

## 🔍 Querying Existing Polymarket Proxy Wallets

Even though you can't deploy Polymarket's email-based proxy wallets, you **CAN** query positions/orders for ANY wallet address (including proxy wallets) via CLOB API:

```typescript
// This works for ANY wallet address, including Polymarket proxy wallets
const positions = await fetch(
  `https://clob.polymarket.com/positions?user=${walletAddress}`
).then(r => r.json());

const orders = await fetch(
  `https://clob.polymarket.com/orders?user=${walletAddress}`
).then(r => r.json());
```

**Key Point**: If a user has a Polymarket proxy wallet, you can query their data using that wallet address, but you can't control or deploy that proxy wallet.

## 🎯 Best Practice: Deploy Your Own Safe Wallets

For the best user experience:

1. **User connects wallet** (via Privy)
2. **Check if Safe Wallet exists** (for their address)
3. **Deploy Safe Wallet** (if doesn't exist) - **Gasless!**
4. **Use Safe Wallet** for all transactions - **Gasless!**

This gives you:
- ✅ Full control over wallet deployment
- ✅ Gasless transactions for users
- ✅ Better UX (no MATIC needed)
- ✅ Order attribution to your builder account

## 📚 References

- [Builder Program Docs](https://docs.polymarket.com/developers/builders/builder-intro)
- [Relayer Client Docs](https://docs.polymarket.com/developers/builders/relayer-client)
- [Proxy Wallet Docs](https://docs.polymarket.com/developers/proxy-wallet) (Polymarket.com only)

## ✅ Summary

- ❌ **Cannot** access Polymarket's email-based proxy wallets
- ✅ **Can** query positions/orders for any wallet address via CLOB API
- ✅ **Can** deploy Safe Wallets for your users via Builder Program
- ✅ **Can** use Safe Wallets for gasless transactions

