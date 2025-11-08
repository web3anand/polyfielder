# Polymarket Wallets & Builder Program Explained

## 🔑 Understanding Polymarket's Wallet System

Based on the [Polymarket Builder Program documentation](https://docs.polymarket.com/developers/builders/builder-intro), here's how wallets work:

## ❌ **No, Polymarket Does NOT Automatically Create Sub-Wallets**

**Important**: Just connecting to Polymarket does **NOT** automatically create a sub-wallet. Here's what actually happens:

### 1. **User's Own Wallet** (Standard Flow)
- Users connect with their **existing wallet** (MetaMask, WalletConnect, etc.)
- This is their **own wallet** on Polygon
- They use this wallet for all Polymarket activities
- **No sub-wallet is created**

### 2. **Polymarket's Email Auth** (Polymarket.com Only)
- When users sign up with **email on Polymarket.com**, Polymarket creates a **proxy wallet** on Polygon
- This is **only for Polymarket.com** - not for your dApp
- These proxy wallets are **non-custodial** (user controls keys via email magic links)
- **This is NOT available for third-party builders**

### 3. **Builder Program Safe Wallets** (Your dApp)
- As a **Builder**, **YOU** can deploy **Safe Wallets** for your users
- These are **separate wallets** deployed via the Builder Relayer
- Users **don't need MATIC** for gas (Polymarket pays via relayer)
- These wallets are **controlled by the user** but **deployed by you**

## 🏗️ How the Builder Program Works

### What is a Builder?
A "builder" is a person/organization that routes orders from their customers to Polymarket. If you've created a front-end that allows users to place trades on Polymarket, you're a builder.

### Builder Program Benefits

#### 1. **Polygon Relayer Access**
- Polymarket exposes their Polygon relayer to builders
- **Polymarket pays for gas fees** on your behalf (when using Safe Wallets)
- You can deploy **Safe Wallets** for your users

#### 2. **Trading Attribution**
- When posting orders, you add custom headers identifying you as a builder
- Orders are attributed to your builder account
- High volume builders compete for grants via the **Builder Leaderboard**

## 💼 Safe Wallets Explained

### What are Safe Wallets?
- **Smart contract wallets** deployed on Polygon
- Deployed via the Builder Relayer
- Users don't need MATIC for gas (relayer pays)
- **User controls the wallet** (they sign transactions)
- **You deploy it** (via Builder Program)

### When to Deploy Safe Wallets

**Deploy Safe Wallets when:**
- User doesn't have MATIC for gas
- You want to provide gasless transactions
- User wants a dedicated wallet for your dApp

**Don't deploy Safe Wallets when:**
- User already has a wallet with MATIC
- User prefers using their existing wallet
- You want to keep it simple

### How Safe Wallets Work

```typescript
// 1. User authenticates (via Privy, MetaMask, etc.)
const userAddress = await signer.getAddress();

// 2. Check if user has Safe Wallet
const hasSafeWallet = await checkSafeWallet(userAddress);

// 3. If not, deploy one (via Builder Relayer)
if (!hasSafeWallet) {
  const safeWallet = await relayerClient.deploySafeWallet(userAddress);
  // Safe wallet is now deployed and ready
}

// 4. User can now trade gaslessly
const order = await placeBetWithBuilder(relayerClient, marketId, 'YES', '100');
// Gas is paid by Polymarket's relayer!
```

## 🔄 Current Setup in Your dApp

### What You're Using: **Privy Authentication**

**Privy creates "Embedded Wallets"** - these are:
- Created by Privy (not Polymarket)
- For users who don't have wallets
- Managed by Privy's infrastructure
- **Separate from Polymarket's system**

### How It Works Together

```
User Flow:
1. User signs in with Privy (email/SMS/wallet)
2. Privy creates/manages their wallet
3. User's wallet address is used for Polymarket activities
4. (Optional) Deploy Safe Wallet via Builder Program for gasless transactions
```

## 📋 Two Different Wallet Systems

### 1. **Privy Embedded Wallets**
- **Purpose**: User authentication & wallet management
- **Created by**: Privy
- **Used for**: General dApp authentication
- **Location**: Privy's infrastructure

### 2. **Polymarket Safe Wallets** (via Builder Program)
- **Purpose**: Gasless transactions on Polymarket
- **Created by**: You (via Builder Relayer)
- **Used for**: Polymarket trading (gasless)
- **Location**: Polygon blockchain (Smart Contract)

## 🎯 Best Practice Flow

### Recommended User Journey

```typescript
// Step 1: User authenticates with Privy
const { user, isAuthenticated } = useAuth();
const userAddress = user?.wallet?.address;

// Step 2: Check if user needs Safe Wallet
if (isAuthenticated && userAddress) {
  // Check if Safe Wallet exists
  const safeWallet = await checkOrDeploySafeWallet(userAddress);
  
  // Step 3: Use Safe Wallet for gasless transactions
  if (safeWallet) {
    // All transactions are gasless!
    await placeBetWithBuilder(relayerClient, marketId, 'YES', '100');
  } else {
    // Fallback to regular wallet (user needs MATIC)
    await placeBetRegular(signer, marketId, 'YES', '100');
  }
}
```

## 🔐 Security Considerations

### Private Keys
- **Privy Embedded Wallets**: Keys managed by Privy (encrypted)
- **Safe Wallets**: User controls via their EOA (Externally Owned Account)
- **Builder Keys**: Keep on server-side only (for order attribution)

### Best Practices
1. **Never expose builder keys** in client-side code
2. **Use server-side signing** for builder headers (recommended)
3. **Let users choose** between Safe Wallet or their own wallet
4. **Store Safe Wallet addresses** in your database for quick lookup

## 📚 Key Takeaways

1. ✅ **Polymarket does NOT auto-create sub-wallets** - you deploy them via Builder Program
2. ✅ **Safe Wallets are optional** - deploy them for gasless transactions
3. ✅ **Users can use their own wallets** - Safe Wallets are just for convenience
4. ✅ **Privy Embedded Wallets** are separate from Polymarket's system
5. ✅ **Builder Program** enables gasless transactions and order attribution

## 🚀 Implementation Checklist

- [ ] Register for Polymarket Builder Program
- [ ] Get Builder API keys (apiKey, secret, passphrase)
- [ ] Set up Builder Relayer Client
- [ ] Implement Safe Wallet deployment logic
- [ ] Add Safe Wallet check before transactions
- [ ] Set up server-side signing for builder headers (recommended)
- [ ] Test gasless transactions on Mumbai testnet
- [ ] Deploy to mainnet

## 📖 References

- [Polymarket Builder Program Docs](https://docs.polymarket.com/developers/builders/builder-intro)
- [Builder Profile & Keys](https://docs.polymarket.com/developers/builders/builder-profile-keys)
- [Relayer Client](https://docs.polymarket.com/developers/builders/relayer-client)
- [Proxy Wallets](https://docs.polymarket.com/developers/proxy-wallet) (Polymarket.com only)

