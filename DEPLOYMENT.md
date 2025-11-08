# Deployment Guide

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub

```bash
# Stage all files
git add .

# Commit changes
git commit -m "Initial commit: polyFielders sports betting dApp"

# Push to GitHub
git push -u origin master
```

### Step 2: Deploy on Vercel

1. **Go to [Vercel](https://vercel.com)**
   - Sign in with your GitHub account
   - Click "Add New Project"

2. **Import Repository**
   - Select `web3anand/polyfielder` from your GitHub repositories
   - Click "Import"

3. **Configure Environment Variables**
   
   Add all these variables in Vercel's environment variables section:

   **Required:**
   ```
   NEXT_PUBLIC_PRIVY_APP_ID=cmhq9990j01idjy0c80j9ghq7
   PRIVY_APP_ID=cmhq9990j01idjy0c80j9ghq7
   PRIVY_APP_SECRET=zBCRgabcVwQnZTm6QhCHuYBLfZFiENrMZikHKMBQ2d3L39MvLcFQkZm6dVsgTMKskyKUiftgsSNgaLDm5c3vcdh
   
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   NEXT_PUBLIC_ALCHEMY_POLYGON_RPC=your_alchemy_rpc_url
   ALCHEMY_API_KEY=your_alchemy_api_key
   
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

   **Optional (for Builder Program):**
   ```
   POLYMARKET_BUILDER_API_KEY=your_builder_api_key
   POLYMARKET_BUILDER_SECRET=your_builder_secret
   POLYMARKET_BUILDER_PASSPHRASE=your_builder_passphrase
   POLYMARKET_BUILDER_SIGNING_SERVER_URL=your_signing_server_url
   ```

   **Optional (for AI features):**
   ```
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Configure Build Settings**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Post-Deployment

1. **Update Privy Configuration**
   - Go to [Privy Dashboard](https://privy.io)
   - Add your Vercel domain to allowed redirect URIs:
     - `https://your-project.vercel.app`
     - `https://your-project.vercel.app/*`

2. **Update Supabase CORS**
   - Go to Supabase Dashboard → Settings → API
   - Add your Vercel domain to allowed origins

3. **Test the Deployment**
   - Visit your Vercel URL
   - Test authentication
   - Test wallet connection
   - Test betting functionality

## 🔒 Security Checklist

- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ All secrets are in Vercel environment variables
- ✅ `PRIVY_APP_SECRET` is server-side only
- ✅ No hardcoded API keys in code
- ✅ Sensitive values not logged in production

## 📝 Environment Variables Reference

See `ENV_SETUP.md` for complete list of required environment variables.

## 🐛 Troubleshooting

### Build Fails
- Check that all required environment variables are set in Vercel
- Check build logs for specific errors
- Ensure Node.js version is 20+ (Vercel default)

### Authentication Not Working
- Verify `NEXT_PUBLIC_PRIVY_APP_ID` is set in Vercel
- Check Privy dashboard for allowed redirect URIs
- Check browser console for errors

### API Routes Return 401
- Verify `PRIVY_APP_ID` and `PRIVY_APP_SECRET` are set in Vercel
- Check server logs in Vercel dashboard
- Ensure environment variables are set for "Production" environment

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Privy Documentation](https://docs.privy.io)
- [Polymarket Builder Program](https://docs.polymarket.com/developers/builders/builder-intro)

