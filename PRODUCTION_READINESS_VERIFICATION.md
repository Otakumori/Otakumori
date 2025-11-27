# 🌸 Production Readiness Verification Plan

Complete checklist and verification plan for ensuring Otakumori is production-ready.

---

## **Phase 1: Critical Fixes (Run First)**

### **1.1 Accessibility Fixes**

```bash
# Dry run first to see what will change
node scripts/fix-all-accessibility-warnings.mjs --dry-run

# Review the output, then execute
node scripts/fix-all-accessibility-warnings.mjs --execute

# Verify fixes
npm run lint
```

**Expected results:**
- ✅ All form inputs have associated labels
- ✅ Interactive elements are keyboard accessible
- ✅ ARIA labels added where needed
- ✅ 0 accessibility linting errors

---

### **1.2 Loading/Empty States Standardization**

```bash
# Dry run first
node scripts/standardize-loading-states.mjs --dry-run

# Review, then execute
node scripts/standardize-loading-states.mjs --execute

# Verify no broken imports
npm run typecheck
```

**Expected results:**
- ✅ All pages use `ShopGridSkeleton` or `ProductCardSkeleton`
- ✅ All empty states use standardized components
- ✅ Consistent UX across all pages

---

### **1.3 Console.log Cleanup**

```bash
# Dry run first
node scripts/fix-console-logs.mjs --dry-run

# Review, then execute
node scripts/fix-console-logs.mjs --execute

# Verify no console statements remain
grep -r "console\.log\|console\.warn\|console\.error" app --exclude-dir=node_modules | head -20
```

**Expected results:**
- ✅ All console statements replaced with `logger`
- ✅ Structured logging in place
- ✅ No console statements in production code

---

### **1.4 Metadata/SEO**

```bash
# Dry run first
node scripts/add-metadata.mjs --dry-run

# Review, then execute
node scripts/add-metadata.mjs --execute

# Verify metadata exports
grep -r "generateMetadata" app --include="*.tsx" | wc -l
```

**Expected results:**
- ✅ All route pages have `generateMetadata()` exports
- ✅ SEO metadata present on all pages
- ✅ Open Graph tags configured

---

### **1.5 Printify Webhook Registration**

```bash
# Dry run first (check what will be registered)
node scripts/setup-printify-webhooks.mjs --dry-run

# Review, then execute with your production URL
node scripts/setup-printify-webhooks.mjs --base-url=https://your-domain.com

# Or use environment variable
BASE_URL=https://your-domain.com node scripts/setup-printify-webhooks.mjs
```

**Expected results:**
- ✅ All required webhooks registered
- ✅ Webhook URLs point to production endpoint
- ✅ Webhooks configured for: order:created, order:sent_to_production, order:shipment_created, order:shipment_delivered, order:cancelled, product:updated, inventory:updated

---

## **Phase 2: Verification and Testing**

### **2.1 TypeScript and Linting**

```bash
# Type check
npm run typecheck

# Linting
npm run lint

# Build verification
npm run build
```

**Expected results:**
- ✅ 0 TypeScript errors
- ✅ 0 linting errors (warnings acceptable)
- ✅ Successful production build

---

### **2.2 Preflight Checks**

```bash
# Run comprehensive preflight
npx tsx scripts/preflight.ts

# Run accessibility preflight
npx tsx scripts/preflight-a11y.ts
```

**Expected results:**
- ✅ Header and footer visible
- ✅ Authentication buttons render
- ✅ Background elements present
- ✅ No console errors
- ✅ Accessibility checks pass

---

### **2.3 Critical Tests**

```bash
# Run critical test suite
node scripts/run-critical-tests.mjs

# Run unit tests
npm run test:unit

# Run E2E smoke tests
npm run test:e2e:smoke
```

**Expected results:**
- ✅ All critical tests pass
- ✅ Unit tests pass
- ✅ E2E smoke tests pass

---

### **2.4 Build and Performance Check**

```bash
# Check build
node scripts/check-build.mjs

# Performance budget check
npx tsx scripts/check-performance-budget.ts

# Link verification
node scripts/check-links.mjs
```

**Expected results:**
- ✅ Build successful
- ✅ Performance within budget
- ✅ No broken links

---

### **2.5 Quick Verification Script**

```bash
# Run all checks at once
chmod +x scripts/verify-production-ready.sh
./scripts/verify-production-ready.sh
```

**Or on Windows (PowerShell):**
```powershell
# Run individual checks
npm run typecheck
npm run lint
npm run build
```

---

## **Phase 3: Manual Verification**

### **3.1 Visual Checks**

- [ ] Homepage loads with starfield background
- [ ] Cherry blossom tree displays correctly
- [ ] Petals are clickable and collectible
- [ ] Header navigation works
- [ ] Footer displays correctly
- [ ] Mobile responsive design works

---

### **3.2 Authentication Flow**

- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Protected routes redirect correctly
- [ ] Modal intercept works for gated actions
- [ ] User profile displays correctly

---

### **3.3 Shop Functionality**

- [ ] Shop page loads products
- [ ] Product filtering works
- [ ] Product details page works
- [ ] Add to cart works
- [ ] Checkout flow works
- [ ] No placeholder products visible

---

### **3.4 Mini-Games**

- [ ] GameCube hub loads
- [ ] Games start correctly
- [ ] Visual effects render properly
- [ ] HUD displays correctly
- [ ] Score tracking works
- [ ] Reduced motion respected

---

### **3.5 Accessibility**

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Forms have proper labels
- [ ] Interactive elements accessible

---

### **3.6 Printify Integration**

- [ ] Products sync from Printify
- [ ] Webhooks receive events
- [ ] Product updates trigger syncs
- [ ] Order creation works
- [ ] Order status updates correctly

---

## **Phase 4: Final Verification**

### **4.1 Production Build Test**

```bash
# Full production build
npm run build

# Start production server locally
npm start

# Test in browser
# Navigate to http://localhost:3000
```

**Check:**
- [ ] All pages load
- [ ] No console errors
- [ ] No hydration errors
- [ ] Performance is good

---

### **4.2 API Health Check**

```bash
# Check API health
npx tsx scripts/check-health.ts

# Or manually test
curl http://localhost:3000/api/health
```

**Expected:**
- ✅ All services show "up"
- ✅ Database connected
- ✅ Printify API accessible
- ✅ Clerk configured

---

### **4.3 Smoke Test**

```bash
# Run smoke tests
npm run smoke

# Or with custom URL
BASE_URL=http://localhost:3000 npm run smoke
```

**Expected:**
- ✅ All smoke tests pass
- ✅ Critical paths work
- ✅ No errors in logs

---

## **Phase 5: Deployment Verification**

### **5.1 Pre-Deployment**

```bash
# Final type check
npm run typecheck

# Final lint
npm run lint

# Final build
npm run build

# Verify no secrets in code
grep -r "sk_live\|pk_live\|secret" app --exclude-dir=node_modules

# Register webhooks for production
node scripts/setup-printify-webhooks.mjs --base-url=https://your-domain.com
```

---

### **5.2 Post-Deployment**

```bash
# Test production URL
BASE_URL=https://your-domain.com npm run smoke

# Check health endpoint
curl https://your-domain.com/api/health

# Verify environment
curl https://your-domain.com/api/diagnostic

# Verify webhooks are registered
node scripts/setup-printify-webhooks.mjs --base-url=https://your-domain.com --dry-run
```

---

## **Summary Checklist**

### **Must Complete Before Launch:**

- [ ] Run accessibility fixes script
- [ ] Run loading states standardization
- [ ] Run console.log cleanup
- [ ] Run metadata/SEO script
- [ ] Register Printify webhooks
- [ ] Pass TypeScript check
- [ ] Pass linting check
- [ ] Pass build check
- [ ] Pass unit tests
- [ ] Pass E2E smoke tests
- [ ] Manual visual verification
- [ ] Manual authentication flow test
- [ ] Manual shop functionality test
- [ ] Manual mini-games test
- [ ] Production build test
- [ ] API health check

### **Nice to Have:**

- [ ] Performance optimization pass
- [ ] Bundle size optimization
- [ ] Additional E2E test coverage
- [ ] Load testing
- [ ] Security audit

---

## **Expected Timeline**

- Phase 1 (Fixes): ~30-60 minutes
- Phase 2 (Verification): ~15-30 minutes
- Phase 3 (Manual): ~30-60 minutes
- Phase 4 (Final): ~15 minutes
- Phase 5 (Deployment): ~15 minutes

**Total: ~2-3 hours for complete verification**

---

## **Troubleshooting**

### **If webhook registration fails:**
- Check `PRINTIFY_API_KEY` is set
- Check `PRINTIFY_SHOP_ID` is set
- Verify webhook URL is publicly accessible
- Check Printify API rate limits

### **If build fails:**
- Run `npm run typecheck` to see TypeScript errors
- Run `npm run lint` to see linting errors
- Check for missing environment variables
- Verify all dependencies are installed

### **If tests fail:**
- Check test database is configured
- Verify test environment variables
- Review test output for specific failures
- Check for flaky tests that need fixing

---

Run these in order. If any step fails, fix the issue before proceeding. After all checks pass, the site should be production-ready.

