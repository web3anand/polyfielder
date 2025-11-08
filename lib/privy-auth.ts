/**
 * Privy Authentication Utilities
 * 
 * Server-side utilities for verifying Privy tokens and authenticating users
 * Uses Privy's JWKS endpoint for token verification
 */

// Server-side: Use PRIVY_APP_ID (without NEXT_PUBLIC_ prefix)
// Client-side: Use NEXT_PUBLIC_PRIVY_APP_ID
const PRIVY_APP_ID = process.env.PRIVY_APP_ID || process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const PRIVY_JWKS_URL = PRIVY_APP_ID ? `https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/jwks.json` : '';

interface PrivyTokenPayload {
  sub: string; // User ID
  iat: number; // Issued at
  exp: number; // Expiration
  iss: string; // Issuer
  aud: string; // Audience
  [key: string]: any;
}

/**
 * Get Privy JWKS (JSON Web Key Set) for token verification
 */
async function getPrivyJWKS() {
  try {
    const response = await fetch(PRIVY_JWKS_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Privy JWKS:', error);
    throw error;
  }
}

/**
 * Verify a Privy access token
 * 
 * @param token - The Privy access token to verify
 * @returns The decoded token payload if valid, null otherwise
 */
export async function verifyPrivyToken(token: string): Promise<PrivyTokenPayload | null> {
  if (!PRIVY_APP_ID) {
    console.error('PRIVY_APP_ID not configured');
    return null;
  }

  if (!PRIVY_JWKS_URL) {
    console.error('PRIVY_JWKS_URL not configured - PRIVY_APP_ID might be invalid');
    return null;
  }

  try {
    // Import jose library for JWT verification (lightweight alternative to jsonwebtoken)
    const { jwtVerify, createRemoteJWKSet } = await import('jose');
    
    // Create JWKS remote set from Privy's endpoint
    const JWKS = createRemoteJWKSet(new URL(PRIVY_JWKS_URL));
    
    // Verify the token
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `privy.io/apps/${PRIVY_APP_ID}`,
      audience: PRIVY_APP_ID,
    });
    
    return payload as PrivyTokenPayload;
  } catch (error: any) {
    console.error('Error verifying Privy token:', error?.message || error);
    // Log more details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Token verification error details:', {
        errorName: error?.name,
        errorMessage: error?.message,
        PRIVY_APP_ID,
        hasJWKS_URL: !!PRIVY_JWKS_URL,
      });
    }
    return null;
  }
}

/**
 * Get user address from Privy token
 * 
 * Note: Privy access tokens don't directly contain wallet addresses.
 * The wallet address needs to be fetched from the Privy API using the user ID,
 * or passed from the client side. For now, we'll rely on the client to provide it.
 * 
 * @param token - The Privy access token
 * @returns The user's wallet address if available, null otherwise
 */
export async function getPrivyUserAddress(token: string): Promise<string | null> {
  const payload = await verifyPrivyToken(token);
  
  if (!payload) {
    return null;
  }
  
  // Privy access tokens typically don't contain wallet addresses directly
  // The address should be provided by the client or fetched from Privy API
  // Check common fields, but likely will be null
  return payload.wallet_address || payload.address || payload.linked_accounts?.[0]?.address || null;
}

/**
 * Extract token from Authorization header
 * 
 * @param authHeader - The Authorization header value (e.g., "Bearer <token>")
 * @returns The token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Verify request is authenticated with Privy
 * 
 * @param request - Next.js request object
 * @returns User info if authenticated, null otherwise
 */
export async function verifyPrivyAuth(request: Request): Promise<{
  userId: string;
  address: string | null;
} | null> {
  // Check if PRIVY_APP_ID is configured
  if (!PRIVY_APP_ID) {
    console.error('PRIVY_APP_ID not configured. Check your .env.local file.');
    console.error('Available env vars:', {
      PRIVY_APP_ID: !!process.env.PRIVY_APP_ID,
      NEXT_PUBLIC_PRIVY_APP_ID: !!process.env.NEXT_PUBLIC_PRIVY_APP_ID,
      PRIVY_APP_SECRET: !!process.env.PRIVY_APP_SECRET,
    });
    return null;
  }

  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    console.warn('No authorization token found in request');
    return null;
  }
  
  const payload = await verifyPrivyToken(token);
  
  if (!payload) {
    console.warn('Failed to verify Privy token');
    return null;
  }
  
  // Extract address from token payload
  // Privy stores wallet info in the token, but we need to get it from the user object
  // For now, we'll use the userId and let the client provide the address
  const address = payload.wallet_address || payload.address || null;
  
  return {
    userId: payload.sub,
    address,
  };
}

/**
 * Require authentication for an API route
 * Returns user info if authenticated, throws error otherwise
 * 
 * @param request - Next.js request object
 * @returns User info
 * @throws Error if not authenticated
 */
export async function requireAuth(request: Request): Promise<{
  userId: string;
  address: string | null;
}> {
  const authInfo = await verifyPrivyAuth(request);
  
  if (!authInfo) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  return authInfo;
}

