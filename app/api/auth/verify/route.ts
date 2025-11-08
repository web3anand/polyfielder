import { NextRequest, NextResponse } from 'next/server';
import { verifyPrivyAuth } from '@/lib/privy-auth';

/**
 * Verify Privy authentication token
 * 
 * This endpoint verifies that a request is authenticated with a valid Privy token.
 * Use this to protect API routes that require authentication.
 * 
 * Usage:
 *   Authorization: Bearer <privy_access_token>
 */
export async function GET(request: NextRequest) {
  const authInfo = await verifyPrivyAuth(request);
  
  if (!authInfo) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unauthorized',
        message: 'Invalid or missing authentication token'
      },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    success: true,
    userId: authInfo.userId,
    address: authInfo.address,
  });
}

/**
 * POST endpoint for verifying tokens (same as GET)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

