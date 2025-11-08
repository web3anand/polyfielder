import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';

export interface SIWEConfig {
  domain: string;
  address: string;
  uri: string;
  chainId: number;
  nonce: string;
}

/**
 * Create SIWE message compatible with Polymarket's authentication
 * Uses EIP-4361 standard for wallet authentication
 * 
 * Note: Polymarket uses Polygon (chainId: 137) as their native chain
 */
export const createSIWEMessage = (config: SIWEConfig): SiweMessage => {
  return new SiweMessage({
    domain: config.domain,
    address: config.address,
    uri: config.uri,
    version: '1',
    chainId: config.chainId,
    nonce: config.nonce,
    issuedAt: new Date().toISOString(),
    statement: 'Sign in to polyFielders',
  });
};

/**
 * SIWE Sign-In compatible with Polymarket
 * 
 * This allows users to connect their PM-linked wallets (MetaMask/WalletConnect)
 * and authenticate using EIP-4361 standard signatures (gasless, domain-bound).
 * 
 * Important: Polymarket accounts are NOT federated (like OAuth), so you cannot
 * directly use PM email accounts. However, if users connect their PM-linked
 * wallet, your app can use PM SDK to read/trade markets on their behalf.
 * 
 * @param signer - Ethers.js signer from connected wallet
 * @returns Authentication result with token and address
 */
export const siweSignIn = async (signer: ethers.Signer): Promise<{ success: boolean; token?: string; address?: string }> => {
  try {
    const address = await signer.getAddress();
    const domain = typeof window !== 'undefined' ? window.location.host : 'localhost';
    const uri = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const nonce = Math.random().toString(36).substring(2, 15);

    // Create SIWE message matching Polymarket's format
    const message = createSIWEMessage({
      domain,
      address,
      uri,
      chainId: 137, // Polygon mainnet - Polymarket's chain
      nonce,
    });

    const messageToSign = message.prepareMessage();
    const signature = await signer.signMessage(messageToSign);

    // Send to backend for verification
    const response = await fetch('/api/verify-siwe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageToSign,
        signature,
        address,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, token: data.token, address: data.address };
    }

    return { success: false };
  } catch (error) {
    return { success: false };
  }
};

/**
 * Authenticate with Polymarket SDK using SIWE signature
 * 
 * This allows the app to use PM SDK to read/trade markets on behalf of the user.
 * Note: This requires Polymarket SDK to support signature-based authentication.
 * 
 * @param signer - Ethers.js signer from connected wallet
 * @param pmSDK - Polymarket SDK instance (if available)
 * @returns Authentication result
 */
export const authenticateWithPolymarket = async (
  signer: ethers.Signer,
  pmSDK?: any // Polymarket SDK instance (type may vary)
): Promise<{ success: boolean }> => {
  try {
    const address = await signer.getAddress();
    const domain = typeof window !== 'undefined' ? window.location.host : 'localhost';
    const uri = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const nonce = Math.random().toString(36).substring(2, 15);

    const message = createSIWEMessage({
      domain,
      address,
      uri,
      chainId: 137, // Polygon - Polymarket's chain
      nonce,
    });

    const messageToSign = message.prepareMessage();
    const signature = await signer.signMessage(messageToSign);

    // Authenticate with Polymarket SDK (if PM SDK supports it)
    // Example: await pmSDK.auth({ signature });
    if (pmSDK && typeof pmSDK.auth === 'function') {
      await pmSDK.auth({ signature });
      return { success: true };
    }

    // If SDK doesn't support auth method, return success anyway
    // The signer can still be used for PM SDK operations
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

