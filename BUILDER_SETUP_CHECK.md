# Builder Program Setup Verification

## ✅ Steps to Verify Your Builder API Keys

### 1. Check if keys are in `.env.local`

Your `.env.local` file should contain:

```env
POLYMARKET_BUILDER_API_KEY=your-api-key-here
POLYMARKET_BUILDER_SECRET=your-secret-here
POLYMARKET_BUILDER_PASSPHRASE=your-passphrase-here
```

### 2. Verify Package Installation

The `@polymarket/builder-relayer-client` package should be installed. Run:

```bash
npm list @polymarket/builder-relayer-client
```

### 3. Restart Dev Server

After adding keys to `.env.local`, **restart your dev server**:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Test Gasless Transactions

1. Connect your wallet via Privy
2. Navigate to a market
3. Click "Yes" or "No"
4. Enter an amount
5. Place bet
6. Check console for "GASLESS" message

## 🔍 How to Check if Builder Program is Active

### In Browser Console

After connecting wallet and placing a bet, you should see:
- `✅ Bet placed successfully via Builder Relayer (GASLESS)!`

### In Code

The Dashboard component checks for `relayerClient`:
- If `relayerClient` exists → Uses gasless transactions
- If not → Falls back to standard transactions

## 🐛 Troubleshooting

### "Builder keys not found"
- Check `.env.local` has all three keys
- Verify key names match exactly (case-sensitive)
- Restart dev server after adding keys

### "Failed to initialize relayer client"
- Check if `@polymarket/builder-relayer-client` is installed
- Verify keys are correct
- Check network connection

### "Module not found: @polymarket/builder-relayer-client"
- Run: `npm install @polymarket/builder-relayer-client --legacy-peer-deps`

## 📝 Current Status

- ✅ Builder Program code integrated
- ✅ Dashboard uses Builder when available
- ⏳ Package installation (in progress)
- ⏳ Keys verification (check your .env.local)

