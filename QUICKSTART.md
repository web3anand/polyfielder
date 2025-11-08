# Quick Start Guide

Get your polyFielders app running in 10 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create `.env.local` with at minimum:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

Get it from: https://cloud.walletconnect.com

## Step 3: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 4: Test Wallet Connection

1. Click "Connect Wallet" in the header
2. Select MetaMask or any WalletConnect-compatible wallet
3. Approve the connection

## Step 5: (Optional) Add Full Features

### For Supabase (Database + Realtime):
1. Create account at https://supabase.com
2. Create new project
3. Run `supabase-schema.sql` in SQL Editor
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

### For Groq LLM Analysis:
1. Sign up at https://console.groq.com
2. Get API key
3. Add to `.env.local`:
   ```env
   GROQ_API_KEY=your-key
   ```

### For Live Sports Scores:
1. Sign up at https://rapidapi.com
2. Subscribe to API-Football
3. Add to `.env.local`:
   ```env
   API_SPORTS_KEY=your-key
   ```

## What Works Without Full Setup?

✅ **Works Now:**
- Wallet connection
- UI and navigation
- Mock market data display
- Basic betting interface

⚠️ **Needs Keys:**
- LLM analysis (needs Groq)
- Live scores (needs API-Sports)
- Database persistence (needs Supabase)
- Real Polymarket integration (needs Alchemy + Polymarket SDK)

## Next Steps

1. See `README.md` for full documentation
2. See `ENV_SETUP.md` for detailed API key setup
3. Deploy to Vercel when ready

## Troubleshooting

**Wallet won't connect?**
- Check `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Make sure you have a wallet extension installed (MetaMask, etc.)

**Build errors?**
- Run `npm install` again
- Check Node.js version: `node -v` (needs 20+)

**Can't see markets?**
- That's normal! Markets come from Supabase or Polymarket
- Add mock data or connect to Supabase

