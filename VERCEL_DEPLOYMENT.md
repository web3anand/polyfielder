# Vercel Deployment Checklist

## ✅ Code is on GitHub

Your code has been successfully pushed to: **https://github.com/web3anand/polyfielder.git**

## 🚀 Quick Deploy Steps

### 1. Go to Vercel
- Visit: https://vercel.com
- Sign in with GitHub
- Click **"Add New Project"**

### 2. Import Repository
- Find **`web3anand/polyfielder`** in the list
- Click **"Import"**

### 3. Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

### 4. Add Environment Variables

Click **"Environment Variables"** and add these:

#### Required Variables:

```env
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=cmhq9990j01idjy0c80j9ghq7
PRIVY_APP_ID=cmhq9990j01idjy0c80j9ghq7
PRIVY_APP_SECRET=zBCRgabcVwQnZTm6QhCHuYBLfZFiENrMZikHKMBQ2d3L39MvLcFQkZm6dVsgTMKskyKUiftgsSNgaLDm5c3vcdh

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Alchemy (Polygon RPC)
NEXT_PUBLIC_ALCHEMY_POLYGON_RPC=your_alchemy_rpc_url
ALCHEMY_API_KEY=your_alchemy_api_key

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

#### Optional Variables (if you have them):

```env
# Polymarket Builder Program (for gasless transactions)
POLYMARKET_BUILDER_API_KEY=your_builder_api_key
POLYMARKET_BUILDER_SECRET=your_builder_secret
POLYMARKET_BUILDER_PASSPHRASE=your_builder_passphrase
POLYMARKET_BUILDER_SIGNING_SERVER_URL=your_signing_server_url

# Groq (for AI features)
GROQ_API_KEY=your_groq_api_key
```

**Important**: 
- Set these for **Production**, **Preview**, and **Development** environments
- Click **"Save"** after adding each variable

### 5. Deploy
- Click **"Deploy"**
- Wait 2-3 minutes for build to complete
- Your app will be live! 🎉

## 🔧 Post-Deployment Configuration

### Update Privy Redirect URIs

1. Go to [Privy Dashboard](https://privy.io/dashboard)
2. Select your app
3. Go to **Settings** → **Redirect URIs**
4. Add your Vercel domain:
   - `https://your-project.vercel.app`
   - `https://your-project.vercel.app/*`

### Update Supabase CORS

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Add your Vercel domain to **Allowed Origins**

## 🧪 Test Your Deployment

1. Visit your Vercel URL
2. Test authentication (Privy login)
3. Test wallet connection
4. Test API routes (check browser console)
5. Test betting functionality

## 📊 Monitor Your Deployment

- **Vercel Dashboard**: View build logs, deployments, analytics
- **Function Logs**: Check server-side logs for API routes
- **Real-time Logs**: Monitor live requests

## 🔄 Updating Your Deployment

After making changes:

```bash
git add .
git commit -m "Your commit message"
git push origin master
```

Vercel will automatically:
- Detect the push
- Build the new version
- Deploy it (if build succeeds)

## 🐛 Common Issues

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check for TypeScript errors

### 401 Errors After Deployment
- Verify `PRIVY_APP_ID` and `PRIVY_APP_SECRET` are set in Vercel
- Check that environment variables are set for **Production** environment
- Check Vercel function logs for detailed errors

### Environment Variables Not Working
- Make sure variables are set for the correct environment (Production/Preview/Development)
- Restart the deployment after adding variables
- Check variable names match exactly (case-sensitive)

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

## 🎯 Your Repository

**GitHub**: https://github.com/web3anand/polyfielder.git

**Vercel Project**: Will be created at `https://your-project.vercel.app`

Good luck with your deployment! 🚀

