// Polyfills for browser APIs that may not be available during SSR
// This prevents errors when using Web3 libraries in Next.js

// Only run polyfills on client side
if (typeof window !== 'undefined') {
  // Polyfill for globalThis if not available
  if (typeof globalThis === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).globalThis = window;
  }

  // Mock indexedDB for SSR safety (WalletConnect will use real one on client)
  // This prevents "indexedDB is not defined" errors during SSR
  if (typeof indexedDB === 'undefined') {
    // WalletConnect will handle this gracefully on client side
    // We don't need to polyfill it here as it's only needed client-side
  }
}

// Export empty object to make this a valid module
export {};

