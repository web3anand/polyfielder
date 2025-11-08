# Environment Variables Setup Guide

This guide will help you set up all required environment variables for polyFielders.

## Required Variables

### 1. Supabase Configuration

**NEXT_PUBLIC_SUPABASE_URL**
- Get from: [supabase.com](https://supabase.com) → Your Project → Settings → API
- Example: `https://xxxxx.supabase.co`

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Get from: Same location as above
- This is the `anon` `public` key (safe to expose in client-side code)

### 2. Groq LLM API

**GROQ_API_KEY**
- Sign up at: [console.groq.com](https://console.groq.com)
- Create an API key in the dashboard
- Free tier available with rate limits

### 3. Alchemy Polygon RPC

**ALCHEMY_API_KEY**
- Sign up at: [alchemy.com](https://www.alchemy.com)
- Create a new app → Select Polygon network
- Copy the API key from the dashboard
- Free tier: 300M compute units/month

**NEXT_PUBLIC_ALCHEMY_POLYGON_RPC**
- Format: `https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
- For testnet: `https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY`

### 4. Privy Authentication

**NEXT_PUBLIC_PRIVY_APP_ID**
- Go to: [privy.io](https://privy.io)
- Sign up and create a new app
- Copy the App ID from the dashboard
- Free tier available with generous limits
- Supports email, SMS, and wallet authentication
- Provides embedded wallets for users without wallets

### 5. WalletConnect

**NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID**
- Go to: [cloud.walletconnect.com](https://cloud.walletconnect.com)
- Create a new project
- Copy the Project ID
- Free tier available

### 6. Polymarket Builder Program (Optional - for gasless transactions)

**POLYMARKET_BUILDER_API_KEY**, **POLYMARKET_BUILDER_SECRET**, **POLYMARKET_BUILDER_PASSPHRASE**
- Register at: [Polymarket Builders Program](https://docs.polymarket.com/developers/builders/builder-intro)
- Create a builder profile and generate API keys
- You'll receive: `apiKey`, `secret`, and `passphrase`
- Enables gasless transactions (Polymarket pays gas fees)
- Enables order attribution for Builder Leaderboard
- See `BUILDER_PROGRAM.md` for detailed setup

### 7. API-Sports (Optional - for live scores)

**API_SPORTS_KEY**
- Sign up at: [rapidapi.com](https://rapidapi.com)
- Subscribe to "API-Football" or "API-Sports"
- Copy your RapidAPI key
- Free tier: 100 calls/day
- Paid: €19/month for all sports

## Complete .env.local Example

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Groq LLM
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Alchemy
ALCHEMY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_ALCHEMY_POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Polymarket Builder Program (Optional - for gasless transactions)
POLYMARKET_BUILDER_API_KEY=your-api-key
POLYMARKET_BUILDER_SECRET=your-secret
POLYMARKET_BUILDER_PASSPHRASE=your-passphrase

# API Sports (Optional)
API_SPORTS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Testing Without All Keys

The app will work with mock data if some keys are missing:
- **Without API-Sports**: Live scores will show "No live games"
- **Without Groq**: LLM analysis will show error message
- **Without Polymarket SDK**: Markets will use mock data
- **Without Builder Program**: Transactions require gas (user pays)
- **Without Supabase**: Real-time features disabled, bets stored locally

However, you need at least:
- **WalletConnect Project ID**: For wallet connection
- **Supabase URL/Key**: For database (can use free tier)

**Builder Program Benefits** (when configured):
- ✅ Gasless transactions (better UX)
- ✅ Order attribution (Builder Leaderboard)
- ✅ Potential grants from Polymarket

## Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Client-side variables** must start with `NEXT_PUBLIC_`
3. **Server-side variables** (without `NEXT_PUBLIC_`) are only available in API routes
4. **Production**: Set all variables in Vercel dashboard (Settings → Environment Variables)

## Troubleshooting

### "Missing environment variable" errors
- Ensure `.env.local` is in the project root (not in `app/` or `lib/`)
- Restart the dev server after adding variables
- Check for typos in variable names

### Wallet connection fails
- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Check that the project ID is correct (not the secret key)

### Supabase connection fails
- Verify both URL and ANON_KEY are set
- Check that the Supabase project is active
- Ensure the database schema is created (run `supabase-schema.sql`)

