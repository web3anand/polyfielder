# Polymarket Builder Program Integration

This dApp is integrated with the [Polymarket Builder Program](https://docs.polymarket.com/developers/builders/builder-intro), which enables:

## ✅ Benefits

1. **Gasless Transactions** - Polymarket pays for gas fees via their Polygon relayer
2. **Trading Attribution** - Orders are attributed to your builder account
3. **Builder Leaderboard** - Compete for grants based on trading volume
4. **Safe Wallets** - Deploy Safe Wallets for users without MATIC

## 🔑 Setup Instructions

### Step 1: Create Builder Profile

1. Go to [Polymarket Builders Program](https://docs.polymarket.com/developers/builders/builder-intro)
2. Register your platform
3. Generate Builder API keys (you'll get `apiKey`, `secret`, and `passphrase`)

### Step 2: Add Builder Keys to Environment

Add to `.env.local`:

```env
# Polymarket Builder Program
POLYMARKET_BUILDER_API_KEY=your-api-key
POLYMARKET_BUILDER_SECRET=your-secret
POLYMARKET_BUILDER_PASSPHRASE=your-passphrase
POLYMARKET_BUILDER_PRIVATE_KEY=your-private-key  # For signing orders
```

⚠️ **Important**: Keep these keys secure! Never commit them to git.

### Step 3: Configure Builder Client

The app automatically uses the Builder Program when keys are available. The `lib/pm-builder.ts` file handles:

- Initializing the Builder Relayer Client
- Placing gasless orders
- Order attribution
- Safe Wallet deployment

## 📝 Usage

### Place Gasless Bet

```typescript
import { initPMWithBuilder, placeBetWithBuilder } from '@/lib/pm-builder';

// Initialize with builder support
const { polymarket, relayerClient } = await initPMWithBuilder(signer);

// Place bet (gasless!)
const order = await placeBetWithBuilder(
  relayerClient,
  marketId,
  'YES', // or 'NO'
  '100', // amount in USDC
);
```

### Deploy Safe Wallet for User

```typescript
import { deploySafeWallet } from '@/lib/pm-builder';

// Deploy gasless wallet for user
const safeWallet = await deploySafeWallet(relayerClient, userAddress);
```

### Get Active Orders

```typescript
import { getActiveOrders } from '@/lib/pm-builder';

const orders = await getActiveOrders(relayerClient);
```

## 🔒 Security Best Practices

1. **Server-Side Signing** (Recommended)
   - Set up a signing server for builder headers
   - Keep private keys on the server
   - See: [Builder Signing Server](https://docs.polymarket.com/developers/builders/builder-signing-server)

2. **Environment Variables**
   - Use `.env.local` for local development
   - Use Vercel environment variables for production
   - Never expose keys in client-side code

3. **API Route for Signing**
   - Create `/api/sign-builder` route
   - Sign orders server-side
   - Return signed headers to client

## 📊 Order Attribution

Orders placed via the Builder Program are automatically attributed to your builder account. This enables:

- Tracking order volume
- Builder Leaderboard ranking
- Grant eligibility

## 🚀 Production Deployment

1. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all Builder Program keys
   - Mark as "Production" environment

2. **Set Up Signing Server**
   - Deploy a secure API endpoint
   - Use it to sign builder headers
   - Keep private keys secure

3. **Test Builder Integration**
   - Test on Polygon Mumbai testnet first
   - Verify gasless transactions work
   - Check order attribution

## 📚 Resources

- [Builder Program Docs](https://docs.polymarket.com/developers/builders/builder-intro)
- [Builder Profile & Keys](https://docs.polymarket.com/developers/builders/builder-profile-keys)
- [Order Attribution](https://docs.polymarket.com/developers/builders/order-attribution)
- [Relayer Client](https://docs.polymarket.com/developers/builders/relayer-client)
- [Builder Signing Server](https://docs.polymarket.com/developers/builders/builder-signing-server)
- [GitHub: builder-relayer-client](https://github.com/polymarket/builder-relayer-client)

## 🐛 Troubleshooting

### "Builder keys not found"
- Check `.env.local` has all required keys
- Verify key names match exactly
- Restart dev server after adding keys

### "Relayer error"
- Check network connection
- Verify Polygon RPC is working
- Check Builder API key is valid

### "Gasless transaction failed"
- Ensure user has Safe Wallet deployed
- Check relayer is operational
- Verify builder keys are valid

## 💡 Tips

- Start with testnet (Mumbai) before mainnet
- Monitor Builder Leaderboard for volume tracking
- Use Safe Wallets for better UX
- Implement server-side signing for production

