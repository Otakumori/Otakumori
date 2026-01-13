# Integration Testing Guide

**Purpose**: Test all external service integrations to ensure production readiness

---

## Quick Health Check

### Comprehensive Health Check Endpoint

```bash
# Test all integrations at once (requires dev server running)
curl http://localhost:3000/api/health/comprehensive

# Or visit in browser:
# http://localhost:3000/api/health/comprehensive
```

**What it tests:**
- ✅ Environment variables
- ✅ Database (Prisma) connection
- ✅ Stripe API connection
- ✅ Printify API connection
- ✅ Redis/Upstash connection

### Validate Services Script

```bash
# Run service validation script
npm run validate:services
# Or directly:
npx tsx scripts/validate-services.ts
```

This script tests each service individually and provides detailed results.

---

## Individual Integration Tests

### 1. Stripe Integration Test

**Test Script:**
```bash
npx tsx scripts/validate-services.ts
# Look for [Stripe] section in output
```

**Manual Test:**
```bash
# Check if Stripe client initializes
curl http://localhost:3000/api/health/comprehensive | jq '.stripe'
```

**Expected Result:**
- `ok: true`
- Response time < 1000ms
- No errors

**What it tests:**
- API key is valid
- Can list prices (lightweight API call)
- API version compatibility

---

### 2. Clerk Integration Test

**Test Script:**
```bash
npx tsx scripts/validate-services.ts
# Look for [Clerk] section in output
```

**Manual Test:**
```bash
# Check Clerk configuration
curl http://localhost:3000/api/diagnostic | jq '.clerk'
```

**Expected Result:**
- `CLERK_SECRET_KEY`: `true` (present)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `true` (present)
- Keys are valid (not expired)

**What it tests:**
- Keys are present in environment
- Keys are not empty strings
- Keys have correct format (starts with `sk_live_` or `sk_test_` for secret, `pk_live_` or `pk_test_` for publishable)

**Note**: Full Clerk authentication test requires:
1. Dev server running
2. Visit sign-in page
3. Attempt to sign in
4. Verify redirect works

---

### 3. Printify Integration Test

**Test Endpoint:**
```bash
# Test Printify connection
curl http://localhost:3000/api/v1/printify/health

# Or comprehensive:
curl http://localhost:3000/api/health/comprehensive | jq '.printify'
```

**Test Script:**
```bash
npx tsx scripts/validate-services.ts
# Look for [Printify] section in output
```

**Expected Result:**
- `ok: true`
- `shopId` is returned (matches `PRINTIFY_SHOP_ID`)
- Response time < 2000ms
- No errors

**What it tests:**
- API key is valid
- Shop ID exists and is accessible
- Can fetch shop information
- API connectivity

---

### 4. Redis/Upstash Integration Test

**Test Endpoint:**
```bash
# Test Redis connection
curl http://localhost:3000/api/health/comprehensive | jq '.redis'
```

**Test Script:**
```bash
npx tsx scripts/validate-services.ts
# Look for [Redis] section in output
```

**Manual Test:**
```bash
# Direct Upstash REST API ping
curl "${UPSTASH_REDIS_REST_URL}/ping" \
  -H "Authorization: Bearer ${UPSTASH_REDIS_REST_TOKEN}"
```

**Expected Result:**
- `ok: true`
- Response time < 500ms
- PING returns `PONG`
- No connection errors

**What it tests:**
- REST URL is valid
- Token is valid
- Network connectivity to Upstash
- Redis instance is accessible

---

## Testing Checklist

### Before Running Tests

- [ ] Dev server is running (`npm run dev`)
- [ ] All environment variables are set in `.env.local`
- [ ] No network restrictions blocking API calls

### Running Tests

- [ ] **Environment Variables**: `pnpm env:verify` passes ✅
- [ ] **Stripe Integration**: Test passes ✅
- [ ] **Clerk Integration**: Test passes ✅
- [ ] **Printify Integration**: Test passes ✅
- [ ] **Redis/Upstash**: Test passes ✅

### Troubleshooting Failed Tests

#### Stripe Test Fails

**Common Issues:**
1. Invalid API key
   - **Solution**: Verify key in Stripe Dashboard → Developers → API keys
   - **Check**: Key starts with `sk_live_` (production) or `sk_test_` (test)

2. API version mismatch
   - **Solution**: Check `app/api/health/comprehensive/route.ts` for API version
   - **Update**: Use compatible Stripe SDK version

3. Network/rate limiting
   - **Solution**: Wait a few minutes, retry
   - **Check**: Stripe status page: https://status.stripe.com

#### Clerk Test Fails

**Common Issues:**
1. Missing environment variables
   - **Solution**: Verify `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` are set

2. Invalid key format
   - **Solution**: Keys should start with `sk_` (secret) or `pk_` (publishable)
   - **Check**: No trailing whitespace or quotes

3. Key mismatch (test vs live)
   - **Solution**: Ensure test keys for dev, live keys for production
   - **Warning**: Never use live keys in development

#### Printify Test Fails

**Common Issues:**
1. Invalid API key
   - **Solution**: Regenerate key in Printify Dashboard → Account → API
   - **Note**: Keys are JWT tokens, not simple strings

2. Invalid shop ID
   - **Solution**: Verify `PRINTIFY_SHOP_ID` is numeric and matches your shop
   - **Check**: Printify Dashboard → Shops → Your Shop ID

3. API connectivity
   - **Solution**: Check Printify status: https://status.printify.com
   - **Verify**: No firewall blocking `api.printify.com`

#### Redis/Upstash Test Fails

**Common Issues:**
1. Invalid REST URL
   - **Solution**: Verify URL format: `https://xxx.upstash.io`
   - **Check**: Upstash Dashboard → Your Database → REST API

2. Invalid token
   - **Solution**: Regenerate token in Upstash Dashboard
   - **Note**: Tokens are long strings starting with `AX`

3. Network connectivity
   - **Solution**: Check if Upstash region is accessible
   - **Verify**: No corporate firewall blocking

---

## Production Verification

### Vercel Production Health Check

After deploying to production:

```bash
# Test production health endpoint
curl https://your-domain.vercel.app/api/health/comprehensive

# Or visit:
# https://your-domain.vercel.app/api/health/comprehensive
```

**Note**: Some tests may take longer in production due to cold starts.

---

## Next Steps

After all integration tests pass:

1. ✅ Mark Section 2.3-2.6 complete in `PRODUCTION_READINESS_CHECKLIST.md`
2. ✅ Proceed to Section 3 (Database Migrations)
3. ✅ Document any known issues or limitations

---

**Last Updated**: 2025-01-14







