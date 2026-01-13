# Required Environment Variables

**Last Updated**: 2025-01-14  
**Purpose**: Complete list of required environment variables for Otakumori production

---

## 🔴 Required Server Variables

These MUST be set in production (Vercel environment variables):

| Variable | Description | Example | Source |
|----------|-------------|---------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (client-exposed) | `pk_live_...` | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Clerk secret key for server-side auth | `sk_live_...` | Clerk Dashboard |
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | Neon Dashboard |
| `STRIPE_SECRET_KEY` | Stripe secret API key | `sk_live_...` | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` | Stripe Webhooks |
| `PRINTIFY_API_KEY` | Printify JWT token | `Bearer ...` | Printify Dashboard |
| `PRINTIFY_SHOP_ID` | Printify shop ID (numeric) | `12345678` | Printify Dashboard |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint | `https://xxx.upstash.io` | Upstash Dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token | `AXxxx...` | Upstash Dashboard |

**Total Required Server Variables: 9**

**Note**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is technically a client variable but is required server-side for validation.

---

## 🔴 Required Client Variables

These MUST be set (exposed to browser via `NEXT_PUBLIC_*`):

| Variable | Description | Example | Source |
|----------|-------------|---------|--------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` | Stripe Dashboard |

**Total Required Client Variables: 1** (excluding `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` which is validated server-side)

---

## 📋 Recommended Variables (Not Required but Recommended)

| Variable | Description | Impact if Missing |
|----------|-------------|-------------------|
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | User sync may fail |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | File uploads won't work |
| `SENTRY_DSN` | Sentry error tracking | Errors won't be tracked |
| `RESEND_API_KEY` | Email sending API key | Emails won't send |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | SEO/OG tags may be incorrect |
| `NEXT_PUBLIC_APP_URL` | Application URL | Link generation may fail |

---

## 🧪 Testing & Verification

### Local Verification

```bash
# Run the env verification script
pnpm env:verify

# Or using npm
npm run env:verify
```

This script checks:
- ✅ All required variables are present
- ✅ Schema validation (Zod)
- ✅ Value mismatches between sources
- ⚠️ Sanity integration (if using blog/community)

### Vercel Production Verification

**Manual Steps:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all required variables are set for **Production** environment
3. Verify values are correct (especially `DATABASE_URL`, Stripe/Clerk keys)
4. Redeploy after adding/updating variables

**Automated Verification (if `VERCEL_TOKEN` is set):**
```bash
# Run Vercel audit script (if available)
VERCEL_TOKEN=xxx node scripts/audit-vercel-env.ts
```

---

## 🔐 Security Notes

1. **Never commit `.env.local`** - It contains secrets
2. **Use Vercel Environment Variables** - Don't hardcode secrets
3. **Rotate keys regularly** - Especially after team member changes
4. **Use different keys for dev/staging/prod** - Never share keys across environments
5. **Test keys in preview** - Use test/dev keys for preview deployments

---

## 📝 Verification Checklist

- [ ] All 8 required server variables are set in Vercel production
- [ ] All 2 required client variables are set in Vercel production
- [ ] `DATABASE_URL` points to production database (not dev/test)
- [ ] Stripe keys are live keys (`sk_live_*`, `pk_live_*`) in production
- [ ] Clerk keys are live keys (`sk_live_*`, `pk_live_*`) in production
- [ ] `PRINTIFY_SHOP_ID` is numeric and matches production shop
- [ ] `pnpm env:verify` passes locally (with `.env.local` present)
- [ ] All recommended variables are set (if features are used)

---

## 🚨 Common Issues

### Issue: "Environment validation failed"

**Solution**: 
1. Check that all required variables are set
2. Verify variable names match exactly (case-sensitive)
3. Ensure values are not empty strings
4. Check for trailing whitespace (trim values)

### Issue: "Schema validation failed"

**Solution**:
1. Verify URL format for `DATABASE_URL`, `UPSTASH_REDIS_REST_URL`
2. Ensure `PRINTIFY_SHOP_ID` is numeric
3. Check that keys match expected prefixes (e.g., `sk_live_` for Stripe)

### Issue: "Missing keys detected"

**Solution**:
1. Add missing variables to `.env.local` (local) or Vercel (production)
2. Restart dev server or redeploy after adding variables
3. Verify variable names match exactly

---

**Next Steps**: After verifying all variables, proceed to Section 2.2 (Run `pnpm env:verify` locally)

