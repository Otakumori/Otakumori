# Otakumori - Edge-Proof, Zero-Error, Fully Wired

A comprehensive Next.js application with production-grade features including Clerk authentication, Printify integration, interactive petals, secret runes, and Microsoft Edge compatibility.

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
PRINTIFY_API_KEY=...
PRINTIFY_SHOP_ID=...

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
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

GitHub Actions workflow includes:

1. Lint and type checking
2. Unit tests
3. Production build
4. Preflight checks with Puppeteer
5. Security scanning

## 📁 Project Structure

```
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

**Operations**
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

**CSP Violations in Edge**

- Check `next.config.mjs` CSP configuration
- Ensure all Clerk domains are whitelisted
- Verify no inline scripts are blocked

**Authentication Not Working**

- Verify Clerk keys are correct
- Check CSP allows Clerk domains
- Ensure cookies are set with proper SameSite

**Petals Not Persisting**

- Check database connection
- Verify API routes are accessible
- Check rate limiting isn't blocking requests

**Build Failures**

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
