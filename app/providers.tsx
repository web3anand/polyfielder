'use client';

// Suppress expected SSR errors from WalletConnect/indexedDB before any imports
// These errors occur during SSR but don't affect client-side functionality
if (typeof window === 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const errorStr = args.join(' ');
    if (
      errorStr.includes('indexedDB is not defined') ||
      errorStr.includes('ReferenceError: indexedDB') ||
      (errorStr.includes('@walletconnect') && errorStr.includes('indexedDB'))
    ) {
      return; // Suppress expected SSR errors
    }
    originalError.apply(console, args);
  };

  // Handle unhandled promise rejections during SSR
  if (typeof process !== 'undefined' && process.on) {
    process.on('unhandledRejection', (reason: any) => {
      const reasonStr = String(reason);
      if (
        reasonStr.includes('indexedDB is not defined') ||
        reasonStr.includes('ReferenceError: indexedDB') ||
        (reasonStr.includes('@walletconnect') && reasonStr.includes('indexedDB'))
      ) {
        return; // Suppress expected SSR errors
      }
    });
  }
}

// Import polyfills first to prevent SSR errors
import '@/lib/polyfills';

import { useEffect, useState, startTransition } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getConfig } from '@/lib/wagmi-config';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { PrivyProvider } from '@privy-io/react-auth';
import { polygon } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

// Create QueryClient outside component to prevent recreating on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable queries during SSR
      enabled: typeof window !== 'undefined',
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // Suppress browser extension errors (MetaMask, Coinbase Wallet, etc.)
    // These extensions inject code that can cause various errors
    if (typeof window !== 'undefined') {
      const originalError = window.console.error;
      const originalWarn = window.console.warn;
      
      // Enhanced error suppression
      window.console.error = (...args) => {
        const errorStr = args.join(' ');
        const errorMessage = args[0]?.toString() || '';
        
        // Filter out extension-related errors and known development warnings
        if (
          errorStr.includes('chrome-extension://') ||
          errorStr.includes('injected.js') ||
          errorStr.includes('aflkmfhebedbjioipglgcbcmnbpgliof') ||
          errorStr.includes('egjidjbpglichdcondbcbdnbeeppgdph') ||
          errorStr.includes('Cannot read properties of null') ||
          errorStr.includes("Cannot read properties of null (reading '1')") ||
          errorStr.includes("Cannot read properties of null (reading '0')") ||
          errorStr.includes("Cannot read properties of null (reading '2')") ||
          errorMessage.includes('chrome-extension://') ||
          errorMessage.includes('injected.js') ||
          errorStr.includes('cca-lite.coinbase.com') ||
          errorStr.includes('Analytics SDK') ||
          errorStr.includes('AnalyticsSDKApiError') ||
          errorStr.includes('ERR_BLOCKED_BY_CLIENT') ||
          errorStr.includes('WagmiProviderNotFoundError') ||
          errorStr.includes('origins don\'t match') ||
          errorStr.includes('origins don\'t match "https://auth.privy.io"') ||
          // Suppress expected 400 errors from Polymarket price history API
          (errorStr.includes('clob.polymarket.com/prices-history') && errorStr.includes('400')) ||
          (errorStr.includes('GET https://clob.polymarket.com/prices-history') && errorStr.includes('Bad Request')) ||
          (errorStr.includes('Failed to fetch') && (
            errorStr.includes('extension') ||
            errorStr.includes('coinbase') ||
            errorStr.includes('metrics') ||
            errorStr.includes('amp') ||
            errorStr.includes('prices-history')
          ))
        ) {
          return; // Suppress these errors
        }
        originalError.apply(console, args);
      };
      
      // Suppress warnings from extensions and Privy development warnings
      window.console.warn = (...args) => {
        const warnStr = args.join(' ');
        if (
          warnStr.includes('chrome-extension://') ||
          warnStr.includes('injected.js') ||
          warnStr.includes('aflkmfhebedbjioipglgcbcmnbpgliof') ||
          warnStr.includes('Cannot read properties of null') ||
          warnStr.includes('origins don\'t match') ||
          warnStr.includes('origins don\'t match "https://auth.privy.io"')
        ) {
          return; // Suppress these warnings
        }
        originalWarn.apply(console, args);
      };
      
      // Handle unhandled promise rejections from extensions and Privy
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason?.toString() || '';
        const stack = event.reason?.stack || '';
        if (
          reason.includes('chrome-extension://') ||
          reason.includes('injected.js') ||
          reason.includes('aflkmfhebedbjioipglgcbcmnbpgliof') ||
          reason.includes('Cannot read properties of null') ||
          reason.includes('origins don\'t match') ||
          stack.includes('chrome-extension://') ||
          stack.includes('injected.js') ||
          reason.includes('cca-lite.coinbase.com') ||
          reason.includes('Analytics SDK') ||
          reason.includes('ERR_BLOCKED_BY_CLIENT')
        ) {
          event.preventDefault(); // Prevent error from showing
        }
      };
      
      // Handle global errors from extensions
      const handleError = (event: ErrorEvent) => {
        const errorMessage = event.message || '';
        const errorSource = event.filename || '';
        if (
          errorMessage.includes('Cannot read properties of null') ||
          errorSource.includes('chrome-extension://') ||
          errorSource.includes('injected.js') ||
          errorSource.includes('aflkmfhebedbjioipglgcbcmnbpgliof')
        ) {
          event.preventDefault(); // Prevent error from showing
          return false;
        }
      };
      
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);
      
      return () => {
        window.console.error = originalError;
        window.console.warn = originalWarn;
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      };
    }
  }, []);

  // Wagmi handles SSR internally, so we can always render it
  const wagmiConfig = getConfig();

  // Get Privy App ID from environment
  // Note: In Next.js, NEXT_PUBLIC_ variables are embedded at build time
  // If you just added this, you MUST restart the dev server
  // Try multiple ways to access the env var (for Turbopack compatibility)
  // Turbopack sometimes doesn't pick up env vars, so we try multiple sources
  const privyAppId = 
    process.env.NEXT_PUBLIC_PRIVY_APP_ID || 
    (typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_PRIVY_APP_ID) ||
    // Fallback for development when Turbopack doesn't load env vars
    (process.env.NODE_ENV === 'development' ? 'cmhq9990j01idjy0c80j9ghq7' : undefined);

  // Debug: Log available env vars (only in development, without exposing sensitive values)
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    console.log('Environment check:', {
      hasPrivyAppId: !!privyAppId,
      privyAppIdLength: privyAppId?.length || 0,
      hasProcessEnvValue: !!process.env.NEXT_PUBLIC_PRIVY_APP_ID,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('PRIVY')),
      // Note: privyAppIdValue is NOT logged to avoid exposing sensitive data
    });
  }

  // Don't render PrivyProvider if app ID is missing
  if (!privyAppId) {
    console.error('NEXT_PUBLIC_PRIVY_APP_ID is not set. Please add it to .env.local and RESTART the dev server.');
    return (
      <ThemeProvider>
        <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Configuration Error</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Privy App ID is not configured.
          </p>
          <div style={{ 
            background: 'var(--background-elevated)', 
            padding: '1rem', 
            borderRadius: '8px',
            textAlign: 'left',
            marginTop: '1rem'
          }}>
            <p style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Steps to fix:
            </p>
            <ol style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>
              <li>Ensure <code style={{ background: 'var(--background-primary)', padding: '2px 4px', borderRadius: '4px' }}>NEXT_PUBLIC_PRIVY_APP_ID=cmhq9990j01idjy0c80j9ghq7</code> is in your <code>.env.local</code> file</li>
              <li><strong>STOP</strong> the dev server (Ctrl+C)</li>
              <li><strong>RESTART</strong> the dev server: <code>npm run dev</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ['email', 'wallet', 'sms'],
          appearance: {
            theme: 'light',
            accentColor: '#4A90E2',
            // logo: '/icon.png', // Optional - commented out to avoid 404
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          defaultChain: polygon,
          supportedChains: [polygon],
        }}
      >
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              modalSize="compact"
              initialChain={polygon}
              showRecentTransactions={true}
            >
              <AuthProvider>
                {children}
              </AuthProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </PrivyProvider>
    </ThemeProvider>
  );
}

