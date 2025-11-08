# Vercel Environment Variables Setup

## Quick Fix for "Privy App ID is not configured" Error

Your app is deployed but missing the `NEXT_PUBLIC_PRIVY_APP_ID` environment variable in Vercel.

## Steps to Fix:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Sign in with your account
- Select your project: **polyfielder**

### 2. Add Environment Variables
1. Click on your project
2. Go to **Settings** → **Environment Variables**
3. Click **Add New**

### 3. Add Required Variables

Add these environment variables for **Production**, **Preview**, and **Development**:

#### Required for Privy:
```
NEXT_PUBLIC_PRIVY_APP_ID=cmhq9990j01idjy0c80j9ghq7
PRIVY_APP_ID=cmhq9990j01idjy0c80j9ghq7
PRIVY_APP_SECRET=zBCRgabcVwQnZTm6QhCHuYBLfZFiENrMZikHKMBQ2d3L39MvLcFQkZm6dVsgTMKskyKUiftgsSNgaLDm5c3vcdh
```

#### Other Required Variables (if you have them):
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Alchemy (Polygon RPC)
NEXT_PUBLIC_ALCHEMY_POLYGON_RPC=your_alchemy_rpc_url
ALCHEMY_API_KEY=your_alchemy_api_key

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Polymarket Builder Program (Optional)
POLYMARKET_BUILDER_API_KEY=your_builder_api_key
POLYMARKET_BUILDER_SECRET=your_builder_secret
POLYMARKET_BUILDER_PASSPHRASE=your_builder_passphrase
POLYMARKET_BUILDER_SIGNING_SERVER_URL=your_signing_server_url

# Groq (Optional - for AI features)
GROQ_API_KEY=your_groq_api_key
```

### 4. Redeploy
After adding the variables:
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic redeploy

### 5. Verify
- Wait for deployment to complete
- Visit your site: `https://polyfielder.vercel.app`
- The error should be gone!

## Important Notes:

- **NEXT_PUBLIC_*** variables are exposed to the browser (safe for public keys)
- **Without NEXT_PUBLIC_*** variables are server-side only (keep secrets safe)
- Make sure to select **Production**, **Preview**, and **Development** when adding variables
- After adding variables, you MUST redeploy for them to take effect

## Your Privy Credentials:

- **App ID**: `cmhq9990j01idjy0c80j9ghq7`
- **App Secret**: `zBCRgabcVwQnZTm6QhCHuYBLfZFiENrMZikHKMBQ2d3L39MvLcFQkZm6dVsgTMKskyKUiftgsSNgaLDm5c3vcdh`

Make sure both `NEXT_PUBLIC_PRIVY_APP_ID` and `PRIVY_APP_ID` are set to the same value.

