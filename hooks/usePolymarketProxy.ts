'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { PolymarketProxyClient, createProxyClient, getPolymarketProxy } from '@/lib/polymarket-proxy';

/**
 * Hook to manage Polymarket Proxy Wallet Client
 * 
 * Usage:
 * ```tsx
 * const { proxyClient, proxyAddress, isLoading } = usePolymarketProxy();
 * 
 * // Place order via proxy
 * if (proxyClient) {
 *   await proxyClient.placeOrder({ ... });
 * }
 * ```
 */
export function usePolymarketProxy(
  manualProxyAddress?: string,
  signatureType: number = 2 // 1 for email/Magic, 2 for browser wallets (Privy/MetaMask)
) {
  const { wallets } = useWallets();
  const [proxyClient, setProxyClient] = useState<PolymarketProxyClient | null>(null);
  const [proxyAddress, setProxyAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize proxy client when wallet is available
  useEffect(() => {
    const initialize = async () => {
      if (!wallets || wallets.length === 0) {
        setProxyClient(null);
        setProxyAddress(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const mainWallet = wallets[0]; // Get first connected wallet

        // Create Polygon provider
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        
        // If manual proxy address is provided, use it directly
        if (manualProxyAddress) {
          console.log(`🔧 Using manual proxy address: ${manualProxyAddress}`);
          // Use createProxyClient but it will use the manual address
          // We'll create the client manually with the signer
          const privyWallet = mainWallet as any;
          let signer: ethers.Signer;
          if (typeof privyWallet.getEthersSigner === 'function') {
            signer = await privyWallet.getEthersSigner();
          } else if (privyWallet.signer) {
            signer = privyWallet.signer;
          } else {
            throw new Error('Cannot get signer from Privy wallet');
          }
          const client = new PolymarketProxyClient(signer, manualProxyAddress);
          setProxyClient(client);
          setProxyAddress(manualProxyAddress.toLowerCase());
          console.log(`✅ Polymarket Proxy Client initialized with manual proxy: ${manualProxyAddress}`);
          return;
        }
        
        // Otherwise, auto-detect proxy
        const client = await createProxyClient(mainWallet, provider, undefined, signatureType);

        if (client) {
          setProxyClient(client);
          const address = client.getProxyAddress();
          setProxyAddress(address);
          console.log(`✅ Polymarket Proxy Client initialized. Proxy: ${address}`);
        } else {
          setError('Failed to create proxy client');
        }
      } catch (err: any) {
        console.error('Error initializing proxy client:', err);
        setError(err.message || 'Failed to initialize proxy client');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [wallets]);

  /**
   * Place an order via proxy wallet
   */
  const placeOrder = useCallback(async (params: {
    market: string;
    asset_id: string;
    side: 'BUY' | 'SELL';
    size: string;
    price: string;
  }) => {
    if (!proxyClient) {
      throw new Error('Proxy client not initialized');
    }

    return await proxyClient.placeOrder(params);
  }, [proxyClient]);

  /**
   * Cancel an order
   */
  const cancelOrder = useCallback(async (orderId: string) => {
    if (!proxyClient) {
      throw new Error('Proxy client not initialized');
    }

    return await proxyClient.cancelOrder(orderId);
  }, [proxyClient]);

  /**
   * Get proxy positions
   */
  const getPositions = useCallback(async () => {
    if (!proxyClient) {
      return [];
    }

    return await proxyClient.getPositions();
  }, [proxyClient]);

  /**
   * Get proxy orders
   */
  const getOrders = useCallback(async () => {
    if (!proxyClient) {
      return [];
    }

    return await proxyClient.getOrders();
  }, [proxyClient]);

  return {
    proxyClient,
    proxyAddress,
    isLoading,
    error,
    placeOrder,
    cancelOrder,
    getPositions,
    getOrders,
    isReady: !!proxyClient,
  };
}

