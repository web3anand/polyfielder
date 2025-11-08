// Alchemy RPC setup - using direct RPC URLs instead of SDK
// The SDK is not installed, so we use fetch-based RPC calls

export const getPolygonRpcUrl = () => {
  // Use Alchemy RPC if API key is provided, otherwise use public RPC
  const alchemyKey = process.env.ALCHEMY_API_KEY || '19F42YMDT9vhaQcskQbPT';
  if (alchemyKey) {
    return `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`;
  }
  // Fallback to public RPC
  return 'https://polygon-rpc.com';
};

export const getProvider = () => {
  return getPolygonRpcUrl();
};

// RPC helper function for making JSON-RPC calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const rpcCall = async (method: string, params: any[] = []) => {
  const rpcUrl = getPolygonRpcUrl();
  
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: 1,
    }),
  });

  const data = await response.json();
  return data.result;
};
