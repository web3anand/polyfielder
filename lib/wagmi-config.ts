'use client';

// Import polyfills FIRST to prevent SSR errors
import '@/lib/polyfills';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon } from 'wagmi/chains';
import { http } from 'wagmi';
import type { Config } from 'wagmi';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2a971bfae268fe4d03db46f2a203cb34';

/**
 * Wagmi + RainbowKit Configuration
 * 
 * This config enables:
 * - WalletConnect (mobile wallets, desktop wallets via QR code)
 * - MetaMask (browser extension)
 * - Coinbase Wallet (browser extension + mobile app)
 * - Injected wallets (any browser extension wallet)
 * - Other wallets supported by RainbowKit
 * 
 * WalletConnect Project ID: Get yours at https://cloud.walletconnect.com
 * 
 * IMPORTANT: This config is lazy-loaded to prevent SSR errors with indexedDB
 */
let configInstance: Config | null = null;

export function getConfig(): Config {
  // Only create config on client side to avoid indexedDB SSR errors
  if (typeof window === 'undefined') {
    // During SSR, return a minimal placeholder config
    // This won't actually be used since Providers component returns early during SSR
    try {
      return getDefaultConfig({
        appName: 'polyFielders',
        appDescription: 'Polymarket-style prediction markets',
        appUrl: 'https://polyfielders.com',
        appIcon: 'https://polyfielders.com/icon.png',
        projectId,
        chains: [polygon],
        transports: {
          [polygon.id]: http(),
        },
        ssr: true,
      });
    } catch (error) {
      // Suppress indexedDB errors during SSR - they're expected
      // Return a minimal config that won't be used anyway
      return {} as Config;
    }
  }

  // Create config only once on client side
  if (!configInstance) {
    try {
      configInstance = getDefaultConfig({
        appName: 'polyFielders',
        appDescription: 'Polymarket-style prediction markets',
        appUrl: window.location.origin,
        appIcon: `${window.location.origin}/icon.png`,
        projectId,
        chains: [polygon],
        transports: {
          [polygon.id]: http(),
        },
        ssr: true,
      });
    } catch (error) {
      // If config creation fails, log but don't crash
      console.warn('Failed to create wagmi config:', error);
      // Return a minimal config
      configInstance = {} as Config;
    }
  }

  return configInstance;
}

// Don't export config directly - only export getConfig() function
// This prevents WalletConnect initialization during SSR module loading
// The config will only be created when getConfig() is called (after client mount)

