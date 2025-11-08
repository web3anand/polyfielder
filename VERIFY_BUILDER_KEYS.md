# Verify Your Builder API Keys

## ✅ Quick Check

Since you already have the Builder API keys, let's verify they're set up correctly:

### 1. Check `.env.local` File

Open `.env.local` and verify you have these three keys:

```env
POLYMARKET_BUILDER_API_KEY=your-api-key-here
POLYMARKET_BUILDER_SECRET=your-secret-here
POLYMARKET_BUILDER_PASSPHRASE=your-passphrase-here
```

**Important**: 
- No quotes around the values
- No spaces before/after the `=`
- Keys are case-sensitive

### 2. Restart Dev Server

After adding/updating keys, **always restart** your dev server:

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 3. Test Gasless Transactions

1. **Connect wallet** via Privy
2. **Navigate** to a market
3. **Click** "Yes" or "No" button
4. **Enter** an amount (e.g., $10)
5. **Place bet**
6. **Check console** - you should see:
   ```
   ✅ Bet placed successfully via Builder Relayer (GASLESS)!
   ```

## 🔍 How to Verify It's Working

### In Browser Console

After placing a bet, check for:
- ✅ `"GASLESS"` message
- ✅ No gas fees charged
- ✅ Order ID returned

### In Network Tab

Check the network requests:
- Should see requests to `relayer-v2.polymarket.com`
- Orders should be attributed to your builder account

## 🐛 Common Issues

### "Builder keys not found"
- Keys not in `.env.local`
- Wrong key names (must match exactly)
- Server not restarted after adding keys

### "Failed to initialize relayer client"
- Check if keys are correct
- Verify package is installed: `npm list @polymarket/builder-relayer-client`
- Check console for detailed error

### "Module not found"
- Run: `npm install @polymarket/builder-relayer-client --legacy-peer-deps`
- Restart dev server

## 📦 Package Status

✅ `@polymarket/builder-relayer-client@0.0.6` - Installed

## 🎯 Next Steps

1. ✅ Package installed
2. ⏳ Verify keys in `.env.local`
3. ⏳ Restart dev server
4. ⏳ Test gasless transaction

## 💡 Optional: Builder Signing Server

For production, consider setting up a Builder Signing Server:
- Keeps keys secure on server-side
- Better security than client-side keys
- See: https://docs.polymarket.com/developers/builders/builder-signing-server

For now, local keys in `.env.local` work fine for development!

