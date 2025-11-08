import { NextRequest, NextResponse } from 'next/server';
import { verifyPrivyAuth } from '@/lib/privy-auth';
import { initPMWithBuilder, checkSafeWallet, deploySafeWallet, ensureSafeWallet } from '@/lib/pm-builder';
import { ethers } from 'ethers';

/**
 * Get or deploy Safe Wallet for user
 * 
 * GET /api/user/safe-wallet - Check if Safe Wallet exists
 * POST /api/user/safe-wallet - Deploy Safe Wallet (if doesn't exist)
 */
export async function GET(request: NextRequest) {
  try {
    const authInfo = await verifyPrivyAuth(request);
    
    if (!authInfo || !authInfo.address) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userAddress = authInfo.address;

    // Note: This requires a signer, which we don't have server-side
    // This endpoint is mainly for checking status
    // Actual deployment should happen client-side
    
    return NextResponse.json({
      success: true,
      message: 'Use client-side deployment. Safe Wallet deployment requires user signature.',
      userAddress,
    });
  } catch (error: any) {
    console.error('Error checking Safe Wallet:', error);
    return NextResponse.json(
      { error: 'Failed to check Safe Wallet', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authInfo = await verifyPrivyAuth(request);
    
    if (!authInfo || !authInfo.address) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Note: Safe Wallet deployment requires user signature
    // This should be done client-side, not server-side
    // This endpoint is a placeholder
    
    return NextResponse.json({
      success: true,
      message: 'Safe Wallet deployment must be done client-side with user signature.',
      note: 'Use ensureSafeWallet() from lib/pm-builder.ts in your client component.',
    });
  } catch (error: any) {
    console.error('Error deploying Safe Wallet:', error);
    return NextResponse.json(
      { error: 'Failed to deploy Safe Wallet', details: error.message },
      { status: 500 }
    );
  }
}

