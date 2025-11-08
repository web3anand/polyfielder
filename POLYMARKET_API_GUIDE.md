# Polymarket API Integration Guide

## 📚 Official Documentation
- **Main Docs**: https://docs.polymarket.com/quickstart/introduction/main
- **Gamma API**: https://docs.polymarket.com/developers/gamma-markets-api/fetch-markets-guide
- **CLOB API**: https://docs.polymarket.com/developers/CLOB/overview
- **Developer Resources**: https://docs.polymarket.com/developers

## 🔗 API Endpoints

### 1. Gamma API (Market Discovery)
**Base URL**: `https://gamma-api.polymarket.com`

#### Get Events (Recommended for fetching markets)
```
GET /events
```

**Query Parameters**:
- `closed` - Filter by closed/open events (default: `false`)
- `limit` - Number of results (default: `100`, max: `100`)
- `order` - Sort field: `id`, `liquidity`, `volume` (default: `id`)
- `ascending` - Sort order: `true` or `false` (default: `false`)
- `offset` - Pagination offset (default: `0`)

**Example**:
```bash
curl "https://gamma-api.polymarket.com/events?closed=false&limit=100&order=liquidity&ascending=false"
```

**Response Format**:
```json
[
  {
    "id": "0x123...",
    "slug": "market-slug",
    "question": "Will X happen?",
    "description": "...",
    "liquidity": "123456.78",
    "volume": "987654.32",
    "tags": ["sports", "nba"],
    "outcomes": [
      {
        "title": "Yes",
        "price": "0.55"
      },
      {
        "title": "No",
        "price": "0.45"
      }
    ],
    "endDate": "2024-12-31T23:59:59Z",
    "imageUrl": "https://..."
  }
]
```

#### Get Markets (Alternative)
```
GET /markets
```
Similar parameters to `/events` but may have different response structure.

#### Other Gamma Endpoints
- `GET /sports` - Get sports categories
- `GET /tags` - Get available tags
- `GET /series` - Get market series
- `GET /search` - Search markets

### 2. CLOB API (Order Management)
**Base URL**: `https://clob.polymarket.com`

Requires authentication for most operations.

**Key Endpoints**:
- `GET /orderbook` - Get order book for a market
- `POST /order` - Place an order (requires auth)
- `GET /orders` - Get user orders (requires auth)
- `DELETE /order` - Cancel order (requires auth)

### 3. Data API (User Data & Trades)
**Base URL**: `https://data-api.polymarket.com`

**Key Endpoints**:
- `GET /trades` - Get trade history
- `GET /user/:address` - Get user data

### 4. WebSocket (Real-time Updates)
**WSS URL**: `wss://ws-subscriptions-clob.polymarket.com/ws/`

Subscribe to real-time market updates, order book changes, etc.

### 5. Real-Time Data Stream (RTDS)
**WSS URL**: `wss://ws-live-data.polymarket.com`

For crypto prices, comments, and other live data.

## 🔧 Implementation in polyFielders

### Current Implementation

**File**: `sports-bet-dapp/app/api/markets/route.ts`

```typescript
// Correct endpoint usage
const apiUrl = `https://gamma-api.polymarket.com/events?closed=false&limit=100&order=liquidity&ascending=false`;

const response = await fetch(apiUrl, {
  headers: {
    'Accept': 'application/json',
  },
  next: { revalidate: 60 }, // Cache for 60 seconds
});
```

### Why We Use `/events` Instead of `/markets`

According to the [official Polymarket documentation](https://docs.polymarket.com/developers/gamma-markets-api/fetch-markets-guide), the `/events` endpoint is the recommended way to fetch active markets. It provides:

1. ✅ Better structured response
2. ✅ More reliable liquidity data
3. ✅ Consistent outcome pricing
4. ✅ Better filtering options

### Common Errors & Solutions

#### ❌ Error 422: Unprocessable Entity

**Causes**:
- Using `/markets` endpoint with incorrect parameters
- Missing required query parameters
- Invalid parameter values

**Solution**:
- Use `/events` endpoint instead
- Follow the exact parameter format from docs
- Remove unsupported parameters like `active=true`

**Before (Broken)**:
```typescript
// ❌ This causes 422 errors
const apiUrl = `https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=100&sort=liquidity&order=desc`;
```

**After (Fixed)**:
```typescript
// ✅ This works correctly
const apiUrl = `https://gamma-api.polymarket.com/events?closed=false&limit=100&order=liquidity&ascending=false`;
```

#### ❌ Error 429: Rate Limited

**Solution**:
- Implement caching (we use 60-second cache)
- Add exponential backoff
- Reduce request frequency

#### ❌ CORS Errors

**Solution**:
- Make API calls from server-side (Next.js API routes)
- Don't call Gamma API directly from browser

## 📊 Response Handling

### Handling Different Response Formats

```typescript
// Gamma API may return array directly or nested in object
const data = await response.json() as PolymarketMarket[] | { 
  data?: PolymarketMarket[]; 
  results?: PolymarketMarket[]; 
  markets?: PolymarketMarket[] 
};

// Safely extract array
const marketsArray = Array.isArray(data) 
  ? data 
  : (data.data || data.results || data.markets || []);
```

### Transforming Market Data

```typescript
const transformedMarket = {
  id: market.id || market.slug || market.conditionId || '',
  question: market.question || market.title || market.description || 'Market',
  liquidity: parseFloat(String(market.liquidity || '0')),
  odds: {
    yes: parseFloat(yesPrice),
    no: parseFloat(noPrice),
  },
  sport: detectedSport,
  market_id: market.id || '',
  resolutionSource: market.resolutionSource,
  endDate: market.endDate,
  imageUrl: market.imageUrl,
};
```

## 🔐 Authentication (For Order Placement)

For placing orders, you need to:

1. **Get API Keys**: Apply through Polymarket
2. **Sign Messages**: Use wallet to sign authentication messages
3. **Use Builder Program**: For gasless transactions

**Files**:
- `lib/auth.ts` - SIWE authentication
- `lib/pm-builder.ts` - Builder Program integration
- `lib/pm.ts` - Standard SDK integration

## 📈 Rate Limits

Based on [Polymarket API Rate Limits documentation](https://docs.polymarket.com/quickstart/introduction/main):

- **Gamma API**: ~100 requests/minute per IP
- **CLOB API**: Varies by endpoint
- **Data API**: ~60 requests/minute

**Our Strategy**:
- 60-second server-side caching
- Fallback to Supabase if API fails
- Silent error handling to prevent console spam

## 🧪 Testing API Endpoints

### Test with cURL

```bash
# Test events endpoint
curl "https://gamma-api.polymarket.com/events?closed=false&limit=10"

# Test sports endpoint
curl "https://gamma-api.polymarket.com/sports"

# Test specific market
curl "https://gamma-api.polymarket.com/events/{event_id}"
```

### Test in Browser Console

```javascript
fetch('https://gamma-api.polymarket.com/events?closed=false&limit=10')
  .then(r => r.json())
  .then(console.log);
```

## 🔄 Migration from Old API

If you're migrating from the old `/markets` endpoint:

1. Change URL from `/markets` to `/events`
2. Update query parameters:
   - Remove: `active=true`
   - Change: `sort=liquidity&order=desc` → `order=liquidity&ascending=false`
3. Handle response format differences
4. Test thoroughly

## 📚 Additional Resources

- **API Showcase**: https://docs.polymarket.com/quickstart/introduction/showcase
- **Developer Community**: https://docs.polymarket.com/
- **Changelog**: https://docs.polymarket.com/changelog
- **TypeScript SDK**: https://polymarket-data.com/

## ⚠️ Important Notes

1. **No Authentication Required**: Gamma API endpoints for reading market data are public
2. **Rate Limiting**: Implement caching and respect rate limits
3. **Data Structure**: Response format may vary, always handle multiple formats
4. **Error Handling**: Always implement fallback mechanisms
5. **Caching**: Use server-side caching to reduce API calls

---

**Last Updated**: November 2024  
**API Version**: v1 (Gamma API)  
**Status**: ✅ Working correctly with `/events` endpoint

