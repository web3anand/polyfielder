# Polymarket Integration Guide

This guide explains how the application integrates with Polymarket's APIs for fetching markets and trading shares with live prices and limit orderbooks.

## Documentation References

- **Main Documentation**: [https://docs.polymarket.com/quickstart/introduction/main](https://docs.polymarket.com/quickstart/introduction/main)
- **Gamma API**: [https://docs.polymarket.com/developers/gamma/overview](https://docs.polymarket.com/developers/gamma/overview)
- **CLOB API**: [https://docs.polymarket.com/developers/CLOB/introduction](https://docs.polymarket.com/developers/CLOB/introduction)

## Architecture Overview

The application uses a three-tier architecture:

1. **Gamma API** - For fetching market data and events
2. **CLOB API** - For orderbook data, live prices, and order placement
3. **WebSocket** - For real-time market updates (optional)

## Core Components

### 1. CLOB Client (`lib/clob-client.ts`)

The CLOB (Central Limit Order Book) client provides methods to interact with Polymarket's trading infrastructure:

```typescript
import { ClobClient } from '@/lib/clob-client';

// Initialize client
const client = new ClobClient(apiKey);
await client.initialize(signer);

// Get orderbook
const orderbook = await client.getOrderbook(tokenId);

// Get live price
const price = await client.getPrice(tokenId, 'BUY');

// Place limit order
const order = await client.placeOrder({
  market: marketId,
  asset_id: tokenId,
  side: 'BUY',
  size: '100',
  price: '0.55',
  owner: userAddress,
});
```

### 2. API Routes

#### `/api/markets` - Fetch Markets
Fetches markets from Polymarket Gamma API with pagination support:

```
GET /api/markets?sport=nba&minLiquidity=10000&limit=100&offset=0
```

**Response**:
```json
{
  "success": true,
  "markets": [...],
  "count": 100,
  "hasMore": true,
  "nextOffset": 100
}
```

#### `/api/orderbook` - Get Orderbook
Fetches orderbook data for a specific token:

```
GET /api/orderbook?tokenId=<token_id>
```

**Response**:
```json
{
  "success": true,
  "orderbook": {
    "bids": [{"price": "0.55", "size": "100"}],
    "asks": [{"price": "0.56", "size": "150"}]
  },
  "metrics": {
    "bestBid": 0.55,
    "bestAsk": 0.56,
    "spread": 0.01,
    "midPrice": 0.555
  }
}
```

#### `/api/price` - Get Live Price
Fetches current market price:

```
GET /api/price?tokenId=<token_id>&side=BUY
```

**Response**:
```json
{
  "success": true,
  "price": {
    "price": "0.555",
    "side": "BUY"
  }
}
```

#### `/api/trades` - Get Recent Trades
Fetches recent trade history:

```
GET /api/trades?tokenId=<token_id>&limit=20
```

### 3. UI Components

#### `<Orderbook>` Component
Displays the orderbook with bids, asks, and spread:

```tsx
import { Orderbook } from '@/components/Orderbook';

<Orderbook 
  tokenId={market.token_id}
  onPriceSelect={(price, side) => {
    // Handle price selection
  }}
/>
```

**Features**:
- Real-time orderbook updates (refreshes every 5 seconds)
- Clickable price levels for quick order placement
- Visual depth display with gradients
- Spread and mid-price calculations

#### `<OrderForm>` Component
Comprehensive order placement form with market and limit orders:

```tsx
import { OrderForm } from '@/components/OrderForm';

<OrderForm
  marketId={market.id}
  tokenId={market.token_id}
  outcome="YES"
  currentPrice={market.odds.yes}
  onPlaceOrder={async (params) => {
    // Handle order placement
  }}
  onCancel={() => {
    // Handle cancel
  }}
/>
```

**Features**:
- Market orders (instant execution at current price)
- Limit orders (custom price point)
- Live price updates every 3 seconds
- Integrated orderbook for limit orders
- Order cost calculator
- Profit/loss estimator

## Trading Flow

### 1. Market Order Flow

```
User clicks "Buy YES" → 
OrderForm opens (market mode) → 
Fetch live price from CLOB API → 
User enters amount → 
Calculate cost and potential profit → 
Place order via CLOB API → 
Order executed at market price
```

### 2. Limit Order Flow

```
User clicks "Buy YES" → 
OrderForm opens (limit mode) → 
Display orderbook → 
User selects price from orderbook OR enters custom price → 
User enters amount → 
Calculate cost and potential profit → 
Place limit order via CLOB API → 
Order sits in orderbook until matched
```

## Key Concepts

### Token IDs vs Market IDs

- **Market ID**: Unique identifier for the market (e.g., "will-trump-win-2024")
- **Token ID**: Unique identifier for each outcome token (YES or NO)
- Each market has 2 tokens: one for YES, one for NO

### Pricing

- Prices range from $0.001 to $0.999 per share
- Each share pays out $1.00 if the outcome is correct
- Price represents the market's probability of that outcome

Example:
- YES token at $0.65 = Market thinks there's a 65% chance of YES
- NO token at $0.35 = Market thinks there's a 35% chance of NO
- YES + NO = $1.00 (always)

### Order Types

#### Market Order
- Executes immediately at current best price
- Guaranteed execution
- Price may vary slightly from displayed price (slippage)

#### Limit Order
- Executes only at specified price or better
- May not execute if price doesn't reach limit
- Sits in orderbook until matched
- No slippage

### Fees

- Trading fees: Typically 2% (200 basis points)
- Builder program: Can offer reduced or zero fees
- Gas fees: Covered by relayer for gasless transactions

## Authentication & Security

### Wallet Connection

```typescript
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

const { address, isConnected } = useAccount();

if (isConnected && address) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // Initialize CLOB client
  const client = new ClobClient();
  await client.initialize(signer);
}
```

### Order Signing

Orders must be cryptographically signed before submission:

```typescript
// 1. Create order payload
const order = {
  market: marketId,
  asset_id: tokenId,
  side: 'BUY',
  size: '100',
  price: '0.55',
  owner: userAddress,
  nonce: Date.now().toString(),
  expiration: (Date.now() + 86400).toString(),
};

// 2. Hash order
const orderHash = hashOrder(order);

// 3. Sign with wallet
const signature = await signer.signMessage(ethers.getBytes(orderHash));

// 4. Submit to CLOB
await fetch('/api/clob/order', {
  method: 'POST',
  body: JSON.stringify({ order, signature }),
});
```

## Real-Time Updates

### Live Price Updates

The application polls for price updates every 3 seconds:

```typescript
useEffect(() => {
  const fetchPrice = async () => {
    const response = await fetch(`/api/price?tokenId=${tokenId}&side=BUY`);
    const data = await response.json();
    setPrice(data.price.price);
  };
  
  fetchPrice();
  const interval = setInterval(fetchPrice, 3000);
  return () => clearInterval(interval);
}, [tokenId]);
```

### WebSocket Integration (Optional)

For lower latency updates, use WebSocket:

```typescript
import { useLiveMarkets } from '@/lib/use-live-markets';

const { markets, isConnected } = useLiveMarkets();

// Automatically updates market prices in real-time
```

## Best Practices

### 1. Error Handling

Always implement proper error handling for API calls:

```typescript
try {
  const orderbook = await client.getOrderbook(tokenId);
} catch (error) {
  if (error.message.includes('404')) {
    // Handle market not found
  } else if (error.message.includes('429')) {
    // Handle rate limit
  } else {
    // Handle other errors
  }
}
```

### 2. Rate Limiting

Respect API rate limits:
- Gamma API: 100 requests per minute
- CLOB API: 200 requests per minute
- Use caching when possible
- Implement exponential backoff for retries

### 3. Price Validation

Always validate prices before placing orders:

```typescript
const validatePrice = (price: number): boolean => {
  return price > 0 && price < 1 && !isNaN(price);
};

const validateOrderSize = (size: number): boolean => {
  return size > 0 && !isNaN(size);
};
```

### 4. Slippage Protection

For market orders, implement slippage protection:

```typescript
const maxSlippage = 0.02; // 2%
const expectedPrice = 0.55;
const maxPrice = expectedPrice * (1 + maxSlippage);

// Check execution price
if (actualPrice > maxPrice) {
  throw new Error('Slippage too high');
}
```

## Testing

### Test with Small Amounts

Always test with small amounts first:

```typescript
const TEST_AMOUNT = '1'; // $1 USD
const TEST_PRICE = '0.50';

await client.placeOrder({
  market: marketId,
  asset_id: tokenId,
  side: 'BUY',
  size: TEST_AMOUNT,
  price: TEST_PRICE,
  owner: address,
});
```

### Monitor Orders

Track order status:

```typescript
const orders = await client.getActiveOrders();
orders.forEach(order => {
  console.log(`Order ${order.orderId}: ${order.status}`);
});
```

## Troubleshooting

### Common Issues

1. **"Failed to fetch orderbook"**
   - Check if tokenId is correct
   - Verify CLOB API is accessible
   - Check network connection

2. **"Order placement failed"**
   - Ensure wallet is connected
   - Check if user has sufficient balance
   - Verify order parameters are valid

3. **"Price not updating"**
   - Check if polling interval is active
   - Verify API endpoint is responding
   - Check browser console for errors

4. **"Orderbook empty"**
   - Market may have low liquidity
   - Check if market is active
   - Try different token/market

## Performance Optimization

### 1. Caching

Implement intelligent caching:

```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds

async function getCachedOrderbook(tokenId: string) {
  const cached = cache.get(tokenId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchOrderbook(tokenId);
  cache.set(tokenId, { data, timestamp: Date.now() });
  return data;
}
```

### 2. Debouncing

Debounce user inputs:

```typescript
import { useMemo, useCallback } from 'react';
import debounce from 'lodash/debounce';

const debouncedFetch = useMemo(
  () => debounce((tokenId) => fetchPrice(tokenId), 500),
  []
);
```

### 3. Lazy Loading

Load orderbooks only when needed:

```typescript
const [showOrderbook, setShowOrderbook] = useState(false);

{showOrderbook && (
  <Orderbook tokenId={tokenId} />
)}
```

## Security Considerations

1. **Never expose private keys** in client-side code
2. **Validate all user inputs** before sending to API
3. **Use HTTPS** for all API calls
4. **Implement rate limiting** to prevent abuse
5. **Sanitize data** from external APIs before displaying

## Support

For issues or questions:
- Polymarket Discord: [https://discord.gg/polymarket](https://discord.gg/polymarket)
- Documentation: [https://docs.polymarket.com](https://docs.polymarket.com)
- GitHub: [https://github.com/Polymarket](https://github.com/Polymarket)

