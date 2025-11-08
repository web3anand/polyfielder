import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { message, signature, address } = await request.json();

    // Verify SIWE message
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (fields.data.address.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Address mismatch' },
        { status: 401 }
      );
    }

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Create or get user in Supabase
    try {
      await supabase
        .from('users')
        .upsert(
          {
            wallet_address: address.toLowerCase(),
            last_login: new Date().toISOString(),
          },
          {
            onConflict: 'wallet_address',
          }
        );
    } catch (userError) {
      // Table might not exist yet, that's OK for MVP
    }

    // Generate a simple JWT-like token (in production, use a proper JWT library)
    const token = Buffer.from(
      JSON.stringify({
        address,
        timestamp: Date.now(),
      })
    ).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      address,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

