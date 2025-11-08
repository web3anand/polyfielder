# Polymarket Authentication Integration Guide

## Overview

This guide explains how to integrate Polymarket's authentication system with your dApp. Polymarket uses a hybrid authentication approach that supports both email-based accounts and Web3 wallets.

## Authentication Methods

### 1. User-Level Authentication

#### Email Magic Links (Magic SDK)
- Creates proxy wallets on Polygon
- No MetaMask needed for basic functionality
- Email signs you in and generates non-custodial keys
- Backend-tied accounts (PM-specific, not federated)

#### SIWE (Sign-In with Ethereum) - EIP-4361
- Standard Web3 authentication
- Works with MetaMask, WalletConnect, etc.
- Gasless signature-based authentication
- Domain-bound signatures
- **This is what we use in our dApp**

### 2. API/SDK Authentication

- **Token ID + Passphrase**: For CLOB trades (from PM dashboard)
- **EOA Private Keys**: For programmatic logins
- **Browser Providers**: Ethers.js for Web3 interactions

## Implementation

### Current SIWE Implementation

Our app already implements SIWE authentication compatible with Polymarket:

```typescript
// lib/auth.ts
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';

export const siweSignIn = async (signer: ethers.Signer) => {
  const address = await signer.getAddress();
  const domain = window.location.host;
  const uri = window.location.origin;
  const nonce = Math.random().toString(36).substring(2, 15);

  const message = new SiweMessage({
    domain,
    address,
    uri,
    version: '1',
    chainId: 137, // Polygon mainnet - Polymarket's chain
    nonce,
    issuedAt: new Date().toISOString(),
  });

  const messageToSign = message.prepareMessage();
  const signature = await signer.signMessage(messageToSign);
  
  // Verify with backend
  const response = await fetch('/api/verify-siwe', {
    method: 'POST',
    body: JSON.stringify({ message: messageToSign, signature, address }),
  });
  
  return await response.json();
};
```

### Using PM-Linked Wallets

**Important**: Polymarket accounts are NOT federated (like OAuth). You cannot directly use PM email accounts in your app.

**However**: If users connect their PM-linked wallet (e.g., MetaMask that they use on Polymarket), your app can:

1. Use SIWE to authenticate the wallet
2. Use Polymarket SDK to read/trade markets on their behalf
3. Access their PM market data and positions

### Integration Flow

```typescript
// 1. User connects wallet (MetaMask/WalletConnect)
const { address, isConnected } = useAccount();

// 2. Sign SIWE message
const signer = await provider.getSigner();
const authResult = await siweSignIn(signer);

// 3. Initialize Polymarket SDK with authenticated signer
const polymarket = await initPM(signer);

// 4. Now you can use PM SDK to:
// - Read markets
// - Place trades
// - Check positions
// - Access orderbook data
```

## Code Example

```typescript
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';

// Create SIWE message
const message = new SiweMessage({
  domain: 'yourapp.com',
  address: userAddress,
  uri: window.location.origin,
  version: '1',
  chainId: 137, // Polygon - Polymarket's chain
  nonce: Math.random().toString(),
  issuedAt: new Date().toISOString(),
});

// Sign message
const sig = await signer.signMessage(message.prepareMessage());

// Authenticate with Polymarket SDK (if PM SDK supports it)
// await pm.auth({ signature: sig });
```

## Key Points

1. **Chain ID**: Always use `137` (Polygon mainnet) - Polymarket's native chain
2. **SIWE Standard**: EIP-4361 is standard, so any wallet supporting it works
3. **Not Federated**: PM accounts are backend-tied, but SIWE allows wallet reuse
4. **Gasless**: SIWE signatures are gasless (no transaction needed)
5. **Domain-Bound**: Signatures are tied to your domain for security

## Future Enhancements

Consider adding:
- **Passkey/2FA**: On top of SIWE for email-like UX
- **Session Management**: Store authenticated sessions
- **Token Refresh**: Handle token expiration
- **Multi-Chain Support**: While PM uses Polygon, support other chains for flexibility

## References

- [SIWE Specification (EIP-4361)](https://eips.ethereum.org/EIPS/eip-4361)
- [Polymarket Documentation](https://docs.polymarket.com)
- [Magic SDK](https://magic.link/docs) - For email-based auth (if needed)

