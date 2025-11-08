'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { initPMWithBuilder, checkSafeWallet, deploySafeWallet, ensureSafeWallet } from '@/lib/pm-builder';
import { ethers } from 'ethers';

interface SafeWalletState {
  safeAddress: string | null;
  isLoading: boolean;
  isDeploying: boolean;
  error: string | null;
}

/**
 * Hook to manage Safe Wallet for authenticated user
 * 
 * Usage:
 * ```tsx
 * const { safeAddress, ensureWallet, isLoading } = useSafeWallet();
 * 
 * // Deploy Safe Wallet if needed
 * await ensureWallet();
 * ```
 */
export function useSafeWallet() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, userAddress } = useAuth();
  const [state, setState] = useState<SafeWalletState>({
    safeAddress: null,
    isLoading: false,
    isDeploying: false,
    error: null,
  });
  const [relayerClient, setRelayerClient] = useState<any>(null);

  // Initialize Builder Relayer Client
  useEffect(() => {
    if (!isConnected || !address) return;

    const initialize = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          const { relayerClient: client } = await initPMWithBuilder(signer);
          setRelayerClient(client);
        }
      } catch (error) {
        console.error('Failed to initialize Builder Relayer Client:', error);
      }
    };

    initialize();
  }, [isConnected, address]);

  // Check if Safe Wallet exists
  const checkWallet = useCallback(async () => {
    if (!relayerClient || !userAddress) return null;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const safeAddress = await checkSafeWallet(relayerClient, userAddress);
      setState(prev => ({
        ...prev,
        safeAddress,
        isLoading: false,
      }));
      return safeAddress;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to check Safe Wallet',
        isLoading: false,
      }));
      return null;
    }
  }, [relayerClient, userAddress]);

  // Deploy Safe Wallet
  const deployWallet = useCallback(async () => {
    if (!relayerClient || !userAddress) {
      throw new Error('Relayer client or user address not available');
    }

    setState(prev => ({ ...prev, isDeploying: true, error: null }));

    try {
      const safeAddress = await deploySafeWallet(relayerClient, userAddress);
      setState(prev => ({
        ...prev,
        safeAddress,
        isDeploying: false,
      }));
      return safeAddress;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to deploy Safe Wallet',
        isDeploying: false,
      }));
      throw error;
    }
  }, [relayerClient, userAddress]);

  // Ensure Safe Wallet exists (check first, deploy if needed)
  const ensureWallet = useCallback(async () => {
    if (!relayerClient || !userAddress) {
      throw new Error('Relayer client or user address not available');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const safeAddress = await ensureSafeWallet(relayerClient, userAddress);
      setState(prev => ({
        ...prev,
        safeAddress,
        isLoading: false,
      }));
      return safeAddress;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to ensure Safe Wallet',
        isLoading: false,
      }));
      throw error;
    }
  }, [relayerClient, userAddress]);

  // Auto-check on mount if connected
  useEffect(() => {
    if (relayerClient && userAddress && isAuthenticated) {
      checkWallet();
    }
  }, [relayerClient, userAddress, isAuthenticated, checkWallet]);

  return {
    ...state,
    checkWallet,
    deployWallet,
    ensureWallet,
    isReady: !!relayerClient && !!userAddress,
  };
}

