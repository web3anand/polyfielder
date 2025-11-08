# Console Errors Guide - How to Fix Runtime Warnings

## 🎯 Current Console Warnings (Not Code Bugs!)

All the console warnings you're seeing are **configuration issues**, not code errors. The app is working correctly but needs API keys and database setup.

---

## ❌ Error 1: Supabase Table Not Found

```
GET https://kswxelkbyjasefmoaquv.supabase.co/rest/v1/markets?select=*&liquidity=gt.10000&order=liquidity.desc 404 (Not Found)

Error: {code: 'PGRST205', message: "Could not find the table 'public.markets' in the schema cache"}
```

### **What it means:**
The Supabase database table `markets` doesn't exist yet.

### **Fix:**
1. Go to your Supabase project: https://supabase.com
2. Open **SQL Editor**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and **Execute**

**Result:** Creates all required tables (markets, bets, live_events, users)

---

## ❌ Error 2: API-Sports 401 Unauthorized

```
GET https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all 401 (Unauthorized)

API key invalid or missing for soccer live scores
```

### **What it means:**
No valid RapidAPI key for live sports scores.

### **Fix:**
1. Sign up at https://rapidapi.com
2. Subscribe to "API-Football" (free tier available)
3. Copy your RapidAPI key
4. Add to `.env.local`:
```env
API_SPORTS_KEY=your_rapidapi_key_here
NEXT_PUBLIC_API_SPORTS_KEY=your_rapidapi_key_here
```

**Note:** Without this, live scores won't show, but betting still works.

---

## ❌ Error 3: API-Sports 429 Too Many Requests

```
GET https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all 429 (Too Many Requests)

Rate limit exceeded for soccer live scores
```

### **What it means:**
Free tier API limit reached (100 calls/day).

### **Fix Options:**
1. **Wait**: Limit resets daily
2. **Upgrade**: Pay for higher limits (~€19/month)
3. **Optimize**: Increase polling interval in `components/LiveScores.tsx`:
```typescript
// Change from 30s to 60s
const interval = setInterval(fetchScores, 60000); // Was 30000
```

---

## ⚠️ Warning: Lit Dev Mode

```
Lit is in dev mode. Not recommended for production!
```

### **What it means:**
RainbowKit/WalletConnect uses Lit library in development mode.

### **Fix:**
This automatically disappears in production build:
```bash
npm run build
npm run start
```

**In dev**: Safe to ignore.

---

## ⚠️ Warning: Coinbase Analytics Blocked

```
POST https://cca-lite.coinbase.com/amp net::ERR_BLOCKED_BY_CLIENT
POST https://cca-lite.coinbase.com/metrics net::ERR_BLOCKED_BY_CLIENT

Analytics SDK: TypeError: Failed to fetch
```

### **What it means:**
Browser extension (ad blocker) is blocking analytics.

### **Fix:**
None needed! This doesn't affect functionality. It's just Coinbase Wallet trying to send analytics.

**To remove warning**: Disable ad blocker or whitelist the site.

---

## ✅ Clean Console Checklist

Follow these steps to have a completely clean console:

### 1. Setup Supabase Database
```sql
-- Run in Supabase SQL Editor
-- Copy from supabase-schema.sql
CREATE TABLE markets (...);
CREATE TABLE bets (...);
CREATE TABLE live_events (...);
CREATE TABLE users (...);
```

### 2. Configure .env.local
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
GROQ_API_KEY=gsk_your_key

# Optional (removes 401/429 errors)
API_SPORTS_KEY=your_rapidapi_key
NEXT_PUBLIC_API_SPORTS_KEY=your_rapidapi_key
```

### 3. Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 4. Verify Clean Console
- ✅ No Supabase 404 errors
- ✅ No API-Sports 401/429 errors
- ⚠️ Lit dev mode (normal in dev)
- ⚠️ Coinbase analytics (safe to ignore)

---

## 🔍 How to Check Each Error is Fixed

### Supabase Fixed?
Open browser console and look for:
- ✅ **Before**: `404 (Not Found)` + `PGRST205`
- ✅ **After**: Markets load successfully

### API-Sports Fixed?
- ✅ **Before**: `401 (Unauthorized)` or `429 (Too Many Requests)`
- ✅ **After**: Live scores appear in right panel

---

## 🚀 Quick Fix Script

Create `.env.local` with minimum required keys:

```bash
# Copy .env.example
cp .env.example .env.local

# Edit .env.local with your keys
# Then restart:
npm run dev
```

---

## 📊 Error Priority

| Priority | Error | Impact | Required? |
|----------|-------|--------|-----------|
| 🔴 HIGH | Supabase 404 | Betting won't work | YES |
| 🟡 MEDIUM | API-Sports 401 | No live scores | NO |
| 🟢 LOW | Lit dev mode | None (dev only) | NO |
| 🟢 LOW | Analytics blocked | None | NO |

---

## ❓ Still Seeing Errors?

### Clear Browser Cache
```
Ctrl + Shift + Delete
Clear cache and reload
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### Verify .env.local Location
Should be: `C:\app\sports-bet-dapp\.env.local`
NOT: `C:\app\sports-bet-dapp\app\.env.local`

---

## ✅ Expected Clean Console

After setup, you should only see:
```
✅ Polymarket WebSocket connected
📡 Subscribed to public markets
[Fast Refresh] done in XXXms
```

All errors gone! 🎉

---

## 📞 Still Need Help?

Check these files:
- `ENV_SETUP.md` - Detailed environment setup
- `PROJECT_STATUS.md` - Overall project status
- `ERROR_FIXES_SUMMARY.md` - Code fixes applied
- `README.md` - Main documentation

