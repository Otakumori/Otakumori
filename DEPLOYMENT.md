# 🚀 Otakumori Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub** (if not already done):

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `Otakumori` repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

### Option 2: Deploy from CLI

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Deploy**:

   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Set project name: `otakumori`
   - Confirm deployment

## Environment Variables

Make sure these are set in your Vercel project settings:

### Required

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgresql://...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Optional

```env
# Printify Integration
PRINTIFY_API_KEY=...
PRINTIFY_SHOP_ID=...

# Sentry (Error Tracking)
SENTRY_DSN=...
```

## Build Settings

Vercel will automatically detect:

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Post-Deployment

1. **Test the application**:
   - Homepage loads correctly
   - Authentication works
   - Mini-games are functional
   - Shop pages render

2. **Monitor performance**:
   - Check Vercel Analytics
   - Monitor build times
   - Watch for any errors

3. **Set up monitoring** (optional):
   - Sentry for error tracking
   - Vercel Analytics
   - Custom health checks

## Troubleshooting

### Build Failures

- Check environment variables are set
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run type-check`

### Runtime Errors

- Check Vercel function logs
- Verify API routes are working
- Test database connections

### Performance Issues

- Enable Vercel Analytics
- Check bundle sizes
- Optimize images and assets

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally with `npm run build`
4. Check GitHub Issues for known problems

---

Happy Deploying! 🎮✨**
