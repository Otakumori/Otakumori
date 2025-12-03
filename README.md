# Otakumori - Edge-Proof, Zero-Error, Fully Wired

A comprehensive Next.js application with production-grade features including Clerk authentication, Printify integration, interactive petals, secret runes, and Microsoft Edge compatibility.

<!-- Deployment trigger -->

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Generate Prisma client
npm run prisma:generate

# Run development server
npm run dev
```

## 📋 Available Commands

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run clean` - Clean build artifacts

### Code Quality

- `npm run lint` - Run ESLint (must be 0 errors)
- `npm run typecheck` - Run TypeScript check (must be 0 errors)
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing & Validation

- `npm run test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage
- `npm run preflight` - Run pre-deployment checks
- `npm run verify` - Run all validation checks

---

Deployment note: Triggering a fresh Vercel build after fixing package.json encoding and pinning Node 20 via `engines.node`. Redeploy trigger.

### Database

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data

## 🏗️ Architecture

### Core Technologies

- **Framework**: Next.js 14 with App Router
- **Authentication**: Clerk
- **Database**: Prisma + Neon (PostgreSQL)
- **Storage**: Vercel Blob
- **Payments**: Stripe
- **Background Jobs**: Inngest
- **Data Fetching**: React Query (@tanstack/react-query)

### Key Features

#### 🔐 Production-Grade Authentication

- Clerk integration with secure cookies
- CSP-compliant for Microsoft Edge
- Sign in/out flows with proper redirects

#### 🌸 Interactive Petals System

- Clickable petals with gravitational physics
- Persistent storage (authenticated users + guest sessions)
- Debounced API calls to prevent spam
- Seasonal variants and burst modes

#### ⚡ Secret Runes System

- Hidden runes throughout the site
- Unlock mechanism with rate limiting
- Telemetry and logging
- Accessible via "boring pages" (FAQ, Terms, Privacy)

#### 🛍️ Printify Integration

- SSR-safe product rendering
- Suspense boundaries with skeletons
- Graceful fallbacks for API failures
- Stale-while-revalidate caching

#### 🛒 Printify Checkout Bridge

Otaku-mori maintains an internal checkout flow that bridges to Printify for production orders. Users never leave the domain during the shopping experience.

**Key Features:**

- Internal checkout with variant selection
- Server-side order submission to Printify API
- Order sync tracking with status monitoring
- Clean product/variant mapping with `skuCanonical` identifiers
- Automatic retry and error handling

**Environment Variables:**

- `PRINTIFY_API_URL` - Printify API base URL (default: `https://api.printify.com/v1`)
- `PRINTIFY_API_KEY` - API authentication token
- `PRINTIFY_SHOP_ID` - Your Printify shop ID
- `NEXT_PUBLIC_CHECKOUT_LINK_LABEL` - CTA button text (default: "Add to Bottomless Bag")

**Catalog Validation:**
Run the catalog validation script to ensure all variant mappings are valid:

```bash
node scripts/check-catalog.mjs
```

This script validates that all `ProductVariant` records with `printifyVariantId` values have corresponding valid entries in the Printify API. It should be run in CI before deployments.

**Order Submission:**
Orders are submitted via `POST /api/v1/checkout/order` and tracked in the `PrintifyOrderSync` table with statuses:

- `queued` - Order created locally, pending Printify submission
- `synced` - Successfully submitted to Printify
- `failed` - Submission failed (check `error` field for details)

**Database Schema:**

```prisma
model ProductVariant {
  skuCanonical String? // Internal canonical SKU (e.g., APP-TSHIRT-RED-L)
  // ... other fields
}

model PrintifyOrderSync {
  localOrderId    String   @unique
  printifyOrderId String?
  status          String   // queued | synced | failed
  lastSyncAt      DateTime?
  error           String?
}
```

#### 🌟 Purple Star Background

- CSS-based animation (no canvas blocking)
- Respects `prefers-reduced-motion`
- Fixed positioning with proper z-index layering

#### 🛡️ Microsoft Edge Hardening

- Comprehensive CSP headers
- Source maps for debugging
- Cookie security (SameSite=Lax, Secure in prod)
- Polyfills for older Edge versions

## 🔧 Configuration

### Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgresql://...

# Printify
PRINTIFY_API_URL=https://api.printify.com/v1
PRINTIFY_API_KEY=...
PRINTIFY_SHOP_ID=...

# Checkout
NEXT_PUBLIC_CHECKOUT_LINK_LABEL="Add to Bottomless Bag"

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Vercel Blob Storage (for avatar assets)
BLOB_READ_WRITE_TOKEN=...
BLOB_PUBLIC_BASE_URL=https://...
BLOB_BUCKET_PREFIX=om

# NSFW Policy Override (server-side, for testing only)
NSFW_GLOBAL=off
```

### Vercel Blob Storage Setup

Otaku-mori uses Vercel Blob for storing avatar assets with age-gated NSFW content protection.

**Getting Started:**

1. In Vercel Console, go to **Storage → Blob → Create Token**
2. Select **Read-Write** access
3. Copy the token to `BLOB_READ_WRITE_TOKEN`
4. Copy the public base URL to `BLOB_PUBLIC_BASE_URL`
5. Optionally set `BLOB_BUCKET_PREFIX` (defaults to "om")

**Asset Pipeline Workflow:**

```bash
# 1. Scan assets from /public/assets
pnpm assets:scan

# 2. Curate registry and generate thumbnails
pnpm assets:curate

# 3. Upload to Vercel Blob
pnpm assets:upload

# Or run all steps together:
pnpm assets:build
```

**How It Works:**

- **Safe assets** (NSFW: false) → Public access with direct CDN URLs
- **NSFW assets** (NSFW: true) → Private access through policy-checked proxy
- Age verification uses HTTP-only `om_age_ok` cookie (tamper-resistant)
- Policy checks: Cookie OR Clerk `adultVerified` metadata OR `NSFW_GLOBAL=on`

**Registry Structure:**

Assets are registered in `app/lib/assets/registry.json`:

```json
{
  "version": 1,
  "assets": {
    "asset_id": {
      "id": "asset_id",
      "slot": "Head",
      "nsfw": false,
      "url": "https://cdn.vercel-blob.com/...",
      "host": "vercel-blob",
      "hash": "abc123...",
      "coverage": "standard"
    }
  },
  "fallbacks": {
    "Head": "default_head",
    "Torso": "default_torso"
  }
}
```

**Using Assets in Code:**

```typescript
import { resolveAssetUrl } from '@/app/lib/assets/resolve';

// Resolve asset URL (works for both public CDN and private proxy URLs)
const url = resolveAssetUrl('head_001');

// In renderer/loader - just use the URL, no policy logic needed
const model = await loader.load(url);
```

**NSFW Proxy Route:**

Private NSFW assets are served through `/api/blob/read?key=...` which:

1. Checks user's age verification policy
2. Returns 403 if NSFW access denied
3. Streams asset bytes from Vercel Blob if allowed
4. Never exposes the RW token to client

**Age Verification API:**

```typescript
// Set age verification (sets HTTP-only cookie)
await fetch('/api/policy/age', { method: 'POST' });

// Clear age verification
await fetch('/api/policy/age', { method: 'DELETE' });
```

### TypeScript Configuration

- Strict mode enabled
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`
- `exactOptionalPropertyTypes: true`

### ESLint Rules

- `no-unused-vars`: Error (with `_` prefix exception)
- `@typescript-eslint/consistent-type-imports`: Error
- `@next/next/no-img-element`: Warning

## 🧪 Testing & Quality Assurance

### Preflight Checks

The preflight script (`scripts/preflight.ts`) performs comprehensive checks:

- ✅ Header and footer visibility
- ✅ Authentication buttons rendered
- ✅ Purple stars background present
- ✅ Product cards visible (on products page)
- ✅ Petals container clickable
- ✅ No console errors
- ✅ No CSP violations
- ✅ Proper cookies set

### CI Pipeline

The CI pipeline enforces strict quality gates to catch regressions early:

**Automated Checks (`.github/workflows/ci.yml`)**:

1. **Lint** - ESLint with zero warnings/errors tolerance
2. **Type Check** - TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters`
3. **Unit Tests** - Vitest test suite
4. **Build** - Full production build verification
5. **E2E Tests** - Playwright smoke tests and accessibility checks
6. **Performance** - Headless NPC spawn benchmark (budget: <16.6ms mean frame time)
7. **Unused Exports** - `ts-prune` check to prevent dead code
8. **Link Check** - Verify internal/external links aren't broken

**Running Tests Locally**:

```bash
# Run all quality checks (like CI)
pnpm lint && pnpm typecheck && pnpm test:unit && pnpm build

# Run E2E tests
pnpm test:e2e

# Run specific E2E suites
pnpm exec playwright test --grep @perf          # Performance tests only
pnpm exec playwright test tests/e2e/accessibility.spec.ts  # A11y tests

# Run with UI mode for debugging
pnpm test:e2e:ui

# Check for unused exports
pnpm ts-prune

# Verify links
node scripts/check-links.mjs
```

**Accessibility Tests**:

Axe-core checks run on critical routes (`/`, `/products/*`, `/arcade`, `/age-check`). Tests fail on `serious` or `critical` violations.

**Performance Benchmarks**:

The headless performance test spawns 80 mock NPCs and measures update loop performance over 1000 frames. Budget enforcement ensures the game engine maintains 60 FPS under load.

- Route: `/perf-headless`
- GPU detection: Skips if WebGL unavailable in CI
- Override: Set `CI_HAS_GPU=true` to force run

**Troubleshooting CI Failures**:

- **Lint errors**: Run `pnpm lint` locally. Fix accessibility violations in JSX.
- **Type errors**: Run `pnpm typecheck`. Enable strict null checks.
- **Build failures**: Check for dynamic imports or missing dependencies.
- **E2E failures**: Download Playwright artifacts from GitHub Actions to inspect traces.
- **Performance failures**: Check if CI runner is under load. May need GPU-enabled runner.
- **ts-prune failures**: Remove unused exports or add to `.ts-prunerc` ignore list.

## 📁 Project Structure

```text
app/
├── api/v1/           # Versioned API routes
├── components/       # Reusable components
├── (shop)/          # Shop-related pages
├── (info)/          # Information pages (FAQ, Terms, etc.)
├── runes/           # Secret rune pages
└── layout.tsx       # Root layout with Header/Main/Footer

lib/
├── contracts.ts     # Zod validation schemas
├── http.ts          # HTTP wrapper utilities
├── db.ts            # Database singleton
└── microcopy.ts     # Internationalization

scripts/
├── preflight.ts     # Pre-deployment checks
└── seed-*.ts        # Database seeding scripts
```

## 🚀 Deployment

### Automated Deployment

```bash
npm run deploy
```

This script will:

1. Check git status and commit changes
2. Run build verification
3. Deploy to your configured platform (Vercel/Netlify)
4. Push to remote repository

### Manual Deployment

"Operations"

- Health check: `curl http://localhost:3000/api/health` (expects JSON with db, clerk, stripe, printify, env)
- Seed (db + app data): `npm run seed` • Unseed: `npm run unseed`
- Smoke test (routes/APIs): `npm run smoke`
- Migrations (deploy): `npm run prisma:deploy` • Studio: `npm run prisma:studio`
- Deploy helper: `npm run deploy` (build verification + deploy)
- Rollback hint: revert to previous Vercel deployment or `git revert <commit>` then redeploy

1. **Build the application**: `npm run build`
2. **Push to repository**: `git push origin main`
3. **Deploy via platform**: Use your deployment platform's interface
4. **Configure environment variables** in your deployment platform

### Platform-Specific Setup

#### Vercel

```bash
npm i -g vercel
vercel --prod
```

#### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Production Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Clerk production keys configured
- [ ] CSP headers tested in Edge
- [ ] Preflight checks passing
- [ ] No TypeScript errors
- [ ] No ESLint errors

### Commands for Production

```bash
# Full validation
npm run verify

# Pre-deployment checks
npm run preflight

# Production build
npm run build

# Deploy
npm run deploy
```

## 🐛 Troubleshooting

### Common Issues

#### CSP Violations in Edge

- Check `next.config.mjs` CSP configuration
- Ensure all Clerk domains are whitelisted
- Verify no inline scripts are blocked

#### Authentication Not Working

- Verify Clerk keys are correct
- Check CSP allows Clerk domains
- Ensure cookies are set with proper SameSite

#### Petals Not Persisting

- Check database connection
- Verify API routes are accessible
- Check rate limiting isn't blocking requests

#### Build Failures

- Run `npm run typecheck` to identify TypeScript errors
- Run `npm run lint` to identify ESLint errors
- Check for missing environment variables

## 📊 Monitoring

### Health Endpoints

- `/api/health` - Basic health check
- `/api/health/clerk` - Clerk configuration check
- `/api/printify/health` - Printify API status

### Logging

- Structured logging with request IDs
- Error tracking with Sentry
- Performance monitoring

## 🤝 Contributing

1. Follow the established patterns
2. Ensure all tests pass
3. Run preflight checks before submitting
4. Maintain zero TypeScript/ESLint errors
5. Update documentation as needed

## 📄 License

Private - All rights reserved.

## Mini-Games Console Card (In-Progress)

- Scope: Console card lives exclusively under /mini-games and child routes; Nav/Footer remain visible.
- Boot: Plays a short boot the first time per session and persists gc_boot in localStorage.
- Deep links: Planned ?face= query sync and alias routes (/mini-games/achievements, /mini-games/trade) to map to faces.
- Runes: Owned runes grid is available on /mini-games home, showing user-owned runes with tooltips.
- APIs (typed, thin):
  - GET /api/petals/balance ? { ok, balance }
  - GET /api/trade/inventory ? { ok, items: { canonicalId, displayName, glyph, quantity }[] }
  - POST /api/trade/fuse ? validates input and ownership, returns { ok:false, code:'DISABLED' } in MVP
  - GET /api/trade/offers ? { ok, items: [] } (stub)
  - POST /api/trade/propose ? { ok:false, code:'DISABLED' } (stub)
- Test IDs: data-testid="runes-grid" on the Owned Runes grid for smoke tests.
- Telemetry: Server routes log errors to server console; Sentry breadcrumbs to be added alongside face transitions in the card.
