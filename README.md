# polyFielders - All-Sports Prediction Markets

A full-stack decentralized sports betting application built on Next.js, Polygon, and Polymarket. Features LLM-powered odds analysis via Groq, real-time sports data, and unfiltered markets with >$10k liquidity.

## Features

- 🏀 **Multi-Sport Support**: NBA, NFL, Soccer, Tennis, Cricket, and more
- 🤖 **AI Odds Analysis**: Groq LLM analyzes historical data to find value bets
- 💰 **High Liquidity Markets**: Focus on markets with >$10k liquidity
- 🔄 **Real-Time Updates**: Live scores and market updates via Supabase Realtime
- 🔐 **Wallet Integration**: WalletConnect + SIWE authentication
- ⚡ **Polygon Network**: Fast, low-cost transactions on Polygon
- 🚀 **Gasless Transactions**: Polymarket Builder Program integration
- 📊 **Live Dashboard**: Real-time sports scores and betting markets

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Blockchain**: Polygon, Ethers.js, Wagmi, RainbowKit
- **Database**: Supabase (PostgreSQL + Realtime)
- **LLM**: Groq SDK (Llama3-70b)
- **APIs**: API-Sports (RapidAPI), Polymarket SDK
- **Builder Program**: @polymarket/builder-relayer-client (gasless transactions)
- **Deployment**: Vercel

## Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- Groq API key
- Alchemy API key (for Polygon RPC)
- WalletConnect Project ID
- Polymarket Builder API keys (optional, for gasless transactions)
- API-Sports key (optional, for live scores)

## Setup Instructions

### 1. Clone and Install

```bash
npm install
# or
yarn install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Groq LLM
GROQ_API_KEY=your-groq-api-key

# Alchemy Polygon RPC
ALCHEMY_API_KEY=your-alchemy-api-key
NEXT_PUBLIC_ALCHEMY_POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/your-key

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# API Sports (optional)
API_SPORTS_KEY=your-api-sports-key
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase-schema.sql`
3. Enable Realtime for the `live_events` table in Database > Replication

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Keys Setup

### Groq API Key
1. Sign up at [console.groq.com](https://console.groq.com)
2. Create an API key
3. Add to `.env.local` as `GROQ_API_KEY`

### Alchemy API Key
1. Sign up at [alchemy.com](https://www.alchemy.com)
2. Create a Polygon app
3. Get your API key from the dashboard
4. Add to `.env.local` as `ALCHEMY_API_KEY`

### WalletConnect Project ID
1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create a new project
3. Copy the Project ID
4. Add to `.env.local` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### API-Sports Key (Optional)
1. Sign up at [rapidapi.com](https://rapidapi.com)
2. Subscribe to API-Sports or API-Football
3. Get your API key
4. Add to `.env.local` as `API_SPORTS_KEY`

## Project Structure

```
sports-bet-dapp/
├── app/
│   ├── api/              # API routes
│   │   ├── verify-siwe/  # SIWE authentication
│   │   └── live/         # Live scores endpoint
│   ├── components/       # React components
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Main dashboard
├── lib/
│   ├── auth.ts           # SIWE authentication
│   ├── llm.ts            # Groq LLM integration
│   ├── pm.ts             # Polymarket SDK wrapper
│   ├── rpc.ts            # Alchemy RPC setup
│   ├── sports.ts         # Sports API integration
│   ├── supabase.ts       # Supabase client
│   └── wagmi-config.ts   # Wagmi/RainbowKit config
├── components/
│   ├── Header.tsx        # App header with wallet connect
│   ├── MarketCard.tsx    # Market card with LLM analysis
│   └── LiveScores.tsx    # Live scores component
└── supabase-schema.sql   # Database schema
```

## Usage

### Connect Wallet
1. Click "Connect Wallet" in the header
2. Select your wallet (MetaMask, WalletConnect, etc.)
3. Sign the SIWE message to authenticate

### Browse Markets
1. Select a sport from the filter buttons
2. View markets with >$10k liquidity
3. See current odds for YES/NO outcomes

### Get AI Analysis
1. Click "Get Edge (LLM Analysis)" on any market
2. Wait for Groq to analyze historical data
3. View recommended bet with EV calculation

### Place a Bet
1. After getting analysis, enter bet amount
2. Click "Place Bet"
3. Confirm transaction in your wallet
4. Track your bet status in real-time

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

The `vercel.json` is already configured for API route timeouts.

## Legal Compliance

⚠️ **Important**: This is a reference implementation. Before launching:

1. **Gambling Licenses**: Obtain necessary licenses (e.g., Curacao)
2. **Regulatory Compliance**: Ensure compliance with local gambling laws
3. **USDC Only**: Use USDC for payments to comply with regulations
4. **KYC/AML**: Implement Know Your Customer and Anti-Money Laundering procedures
5. **Terms of Service**: Create clear terms of service and user agreements

## Development Roadmap

- [x] Next.js setup with TypeScript
- [x] Polymarket SDK integration
- [x] Groq LLM analysis
- [x] Supabase database
- [x] WalletConnect + SIWE auth
- [x] Real-time sports data
- [ ] Socket.io server setup
- [ ] E2E testing with Cypress
- [ ] Mobile PWA support
- [ ] Advanced analytics dashboard

## Timeline

**MVP**: 4-6 weeks
- Week 1-2: Core infrastructure
- Week 3-4: UI/UX and integrations
- Week 5-6: Testing and deployment

## Support

For issues or questions:
- Check the [documentation](./docs)
- Open an issue on GitHub
- Contact: [your-contact]

## License

This project is for educational purposes. Ensure proper licensing before commercial use.
