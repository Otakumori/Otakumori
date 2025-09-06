# Production Ready Checklist - Otaku-mori

## ✅ Completed Fixes

### 1. Clerk Configuration Fixed

- **Issue**: Custom domain `clerk.otaku-mori.com` was causing 404s and CSP violations
- **Fix**: Removed custom domain, using official Clerk SDK defaults
- **Files**: `app/layout.tsx`, `next.config.mjs`
- **Result**: Clerk should now load properly without cascade failures

### 2. CSP Headers Updated

- **Issue**: Content Security Policy was blocking official Clerk domains
- **Fix**: Updated CSP to allow `*.clerk.com`, `*.clerkstage.dev`, and other required domains
- **Files**: `next.config.mjs`
- **Result**: Third-party scripts and APIs should load without CSP violations

### 3. Global Background Component

- **Issue**: Tree background was mounted per-page causing floating artifacts
- **Fix**: Created `GlobalBackground` component mounted once in layout
- **Files**: `app/components/GlobalBackground.tsx`, `app/Providers.tsx`
- **Result**: Consistent background across all pages, no z-index conflicts

### 4. Printify API Route

- **Issue**: Mock data was being returned in production
- **Fix**: Created `/api/v1/printify/products` route with live Printify integration
- **Files**: `app/api/v1/printify/products/route.ts`
- **Result**: Real product data from Printify API with proper error handling

### 5. Soapstones API Fixed

- **Issue**: API was returning 500 errors causing cascading failures
- **Fix**: Graceful error handling, returns empty results instead of 500
- **Files**: `app/api/soapstones/route.ts`
- **Result**: Community features won't crash the app

### 6. Mini-Games Diagnostic Page

- **Issue**: WebGL rendering issues and SSR/hydration conflicts
- **Fix**: Created diagnostic page with minimal DiagCube component
- **Files**: `app/mini-games/page.tsx`, `app/mini-games/_components/DiagCube.tsx`
- **Result**: Isolated WebGL testing without provider conflicts

### 7. Error Boundaries

- **Issue**: No error isolation for failing components
- **Fix**: Added `DiagErrorBoundary` for mini-games section
- **Files**: `app/components/DiagErrorBoundary.tsx`
- **Result**: Failures are contained and logged properly

### 8. Environment Validation

- **Issue**: No validation of required environment variables
- **Fix**: Created schema validator and health check system
- **Files**: `app/lib/env-schema.ts`, `app/api/health/route.ts`
- **Result**: Early detection of configuration issues

### 9. Smoke Testing

- **Issue**: No automated testing of critical routes
- **Fix**: Created comprehensive smoke test script
- **Files**: `scripts/smoke.ts`
- **Result**: Can verify all routes work before deployment

## 🔧 Environment Variables Required

### Required (Production)

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_*** or pk_test_***
CLERK_SECRET_KEY=sk_live_*** or sk_test_***

# Database
DATABASE_URL=postgresql://...

# Printify Integration
PRINTIFY_API_KEY=your_api_key_here
PRINTIFY_SHOP_ID=your_shop_id_here

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_*** or sk_test_***
```

### Optional but Recommended

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://otaku-mori.com
NEXT_PUBLIC_SITE_URL=https://otaku-mori.com

# Webhooks
CLERK_WEBHOOK_SECRET=whsec_***
STRIPE_WEBHOOK_SECRET=whsec_***

# Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Email
RESEND_API_KEY=re_***
```

## 🚀 Deployment Steps

### 1. Environment Setup

```bash
# On Vercel dashboard or via CLI
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add DATABASE_URL
vercel env add PRINTIFY_API_KEY
vercel env add PRINTIFY_SHOP_ID
vercel env add STRIPE_SECRET_KEY
```

### 2. Database Migration

```bash
# Ensure latest schema is deployed
npx prisma migrate deploy
npx prisma generate
```

### 3. Pre-deployment Test

```bash
# Run smoke tests locally
npm run smoke

# Or against staging
BASE_URL=https://staging.otaku-mori.com npm run smoke
```

### 4. Deploy

```bash
# Deploy to Vercel
vercel --prod

# Or push to main branch if auto-deploy is enabled
git push origin main
```

### 5. Post-deployment Verification

```bash
# Test production endpoints
BASE_URL=https://otaku-mori.com npm run smoke

# Check health endpoint
curl https://otaku-mori.com/api/health
```

## 🧪 Testing Checklist

### Manual Testing

- [ ] Home page loads without errors
- [ ] Clerk authentication works (sign in/up)
- [ ] Mini-games page shows diagnostic cube
- [ ] Shop page loads (check Printify integration)
- [ ] Blog page renders
- [ ] Soapstones API returns data (or graceful empty state)
- [ ] Health endpoint shows all services as "up"

### Automated Testing

- [ ] `npm run smoke` passes locally
- [ ] `npm run smoke` passes against production
- [ ] `npm run lint` shows 0 errors
- [ ] `npm run build` completes successfully
- [ ] `npx tsc --noEmit` shows 0 errors

## 🚨 Known Issues & TODOs

### Immediate (Fix before production)

- [ ] Ensure tree background image exists at `/public/assets/images/tree-bg.png`
- [ ] Verify Printify API credentials are valid
- [ ] Test Clerk authentication flow end-to-end

### Short-term (Next sprint)

- [ ] Replace diagnostic cube with full GameCube UI
- [ ] Add proper error boundaries to all routes
- [ ] Implement proper loading states for async operations
- [ ] Add rate limiting to API endpoints

### Medium-term (Future releases)

- [ ] Add comprehensive unit tests
- [ ] Implement proper monitoring and alerting
- [ ] Add performance monitoring (Core Web Vitals)
- [ ] Implement proper caching strategy

## 📊 Performance Metrics

### Target Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Current Status

- [ ] Measure baseline performance
- [ ] Identify bottlenecks
- [ ] Implement optimizations
- [ ] Re-measure and document improvements

## 🔒 Security Checklist

- [ ] CSP headers properly configured
- [ ] Environment variables not exposed to client
- [ ] API rate limiting implemented
- [ ] Input validation with Zod schemas
- [ ] Proper error handling (no sensitive data leaks)
- [ ] HTTPS enforced
- [ ] Security headers set

## 📝 Notes

- The diagnostic mini-games page is temporary and should be replaced with the full GameCube UI once WebGL rendering is confirmed stable
- All API routes now return proper error responses instead of 500s
- The global background component ensures consistent visual experience across all pages
- Environment validation will prevent the app from starting with missing critical configuration

## 🎯 Success Criteria

The app is production-ready when:

1. All smoke tests pass
2. Clerk authentication works without errors
3. Printify integration returns live data (not mocks)
4. Mini-games page renders WebGL content
5. No 500 errors in critical user flows
6. Performance metrics meet targets
7. Security checklist is complete
