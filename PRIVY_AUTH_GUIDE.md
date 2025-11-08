# Privy Authentication Guide

This guide explains how to use Privy authentication in the polyField dApp.

## Overview

Privy provides a unified authentication system that supports:
- **Email/Password** authentication
- **SMS** authentication  
- **Web3 Wallets** (MetaMask, WalletConnect, etc.)
- **Embedded Wallets** (auto-created for users without wallets)

## Client-Side Usage

### Basic Authentication

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, userAddress, login, logout, getAccessToken } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={login}>Sign In</button>;
  }

  return (
    <div>
      <p>Address: {userAddress}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Making Authenticated API Calls

```typescript
import { useAuth } from '@/contexts/AuthContext';

async function makeAuthenticatedRequest() {
  const { getAccessToken } = useAuth();
  const token = await getAccessToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/protected-route', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.json();
}
```

## Server-Side Usage

### Protecting API Routes

Use the `requireAuth` helper to protect API routes:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/privy-auth';

export async function GET(request: NextRequest) {
  try {
    // This will throw if user is not authenticated
    const { userId, address } = await requireAuth(request);
    
    // User is authenticated, proceed with request
    return NextResponse.json({
      success: true,
      userId,
      address,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

### Optional Authentication

If you want to allow both authenticated and unauthenticated requests:

```typescript
import { verifyPrivyAuth } from '@/lib/privy-auth';

export async function GET(request: NextRequest) {
  const authInfo = await verifyPrivyAuth(request);
  
  if (authInfo) {
    // User is authenticated
    return NextResponse.json({ user: authInfo });
  } else {
    // User is not authenticated, return public data
    return NextResponse.json({ user: null });
  }
}
```

## Token Verification

Privy tokens are verified using the JWKS (JSON Web Key Set) endpoint:
- **JWKS URL**: `https://auth.privy.io/api/v1/apps/{APP_ID}/jwks.json`
- **Verification**: Uses `jose` library to verify JWT signatures
- **Caching**: JWKS is cached for 1 hour to reduce API calls

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_PRIVY_APP_ID=cmhq9990j01idjy0c80j9ghq7
PRIVY_APP_SECRET=zBCRgabcVwQnZTm6QhCHuYBLfZFiENrMZikHKMBQ2d3L39MvLcFQkZm6dVsgTMKskyKUiftgsSNgaLDm5c3vcdh
```

## User Object Structure

The Privy user object contains:

```typescript
{
  id: string; // Privy user ID
  wallet: {
    address: string;
    chainType: 'EVM';
    walletClientType: 'privy' | 'metamask' | 'coinbase_wallet' | ...;
  };
  linkedAccounts: Array<{
    type: 'wallet' | 'email' | 'sms';
    address?: string;
    email?: string;
    phone?: string;
  }>;
  createdAt: number;
  // ... other fields
}
```

## Access Tokens

- **Getting Token**: Use `getAccessToken()` from `useAuth()`
- **Token Format**: JWT (JSON Web Token)
- **Expiration**: Tokens expire after a set time (Privy manages this)
- **Refresh**: Privy SDK automatically refreshes tokens when needed

## Example: Protected API Route

```typescript
// app/api/user/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/privy-auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId, address } = await requireAuth(request);
    
    // Fetch user's portfolio from database
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', address?.toLowerCase());
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      portfolio: data,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized: Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Security Best Practices

1. **Never expose `PRIVY_APP_SECRET`** in client-side code
2. **Always verify tokens** on the server side
3. **Use HTTPS** in production
4. **Validate user addresses** before processing transactions
5. **Rate limit** authenticated endpoints

## Troubleshooting

### "Unauthorized" errors
- Check that `NEXT_PUBLIC_PRIVY_APP_ID` is set correctly
- Verify the token is being sent in the `Authorization` header
- Ensure the token hasn't expired

### Token verification fails
- Check that the JWKS endpoint is accessible
- Verify the App ID matches your Privy dashboard
- Check server logs for detailed error messages

### User address is null
- User may have authenticated with email/SMS (no wallet)
- Check `user.linkedAccounts` for wallet information
- Prompt user to connect a wallet if needed

## Resources

- [Privy Documentation](https://docs.privy.io)
- [Privy React Auth SDK](https://docs.privy.io/guide/react)
- [JWKS Specification](https://tools.ietf.org/html/rfc7517)

