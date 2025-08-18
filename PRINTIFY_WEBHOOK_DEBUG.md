# Printify Webhook Debug Guide

## Issues Identified and Fixed

### 1. Missing Printify Webhook Route
**Problem**: The `/app/api/webhooks/printify/route.ts` file was missing entirely.
**Solution**: Created a proper Next.js 14 App Router webhook handler with:
- `export const runtime = "nodejs"` for Node.js APIs
- Proper error handling and logging
- Webhook signature verification (placeholder)
- Support for all Printify webhook types

### 2. Environment Variable Mismatch
**Problem**: Code was importing from `@/env` but the file was at `@/lib/env`.
**Solution**: Created `env.mjs` using `@t3-oss/env-nextjs` for proper environment validation.

### 3. Function Signature Mismatch
**Problem**: `printifyAPI.js` was calling `printify({ url, ...options })` but `printifyClient.ts` expected different parameters.
**Solution**: Fixed to use `printify.get(endpoint, options)` which matches the axios instance.

### 4. Missing Runtime Declaration
**Problem**: Webhooks need Node.js runtime for external API calls.
**Solution**: Added `export const runtime = "nodejs"` to all webhook routes.

### 5. Lack of Structured Logging
**Problem**: No way to track API failures or debug issues systematically.
**Solution**: Created comprehensive logging system in `app/lib/logger.ts`.

## New Files Created

### 1. `app/api/webhooks/printify/route.ts`
- Main Printify webhook handler
- Handles order:created, order:updated, order:shipped, order:delivered, order:cancelled
- Includes signature verification (placeholder)
- Comprehensive error handling and logging

### 2. `app/api/webhooks/printify/test/route.ts`
- Test endpoint for debugging webhook functionality
- Accepts POST requests with test data
- Returns detailed response for troubleshooting

### 3. `env.mjs`
- Proper environment variable validation using `@t3-oss/env-nextjs`
- Includes all required variables for Printify, Stripe, Clerk, Supabase, Redis
- Type-safe environment access

### 4. `app/lib/logger.ts`
- Structured logging system for all API routes
- Request/response tracking with unique IDs
- Webhook-specific logging methods
- External API call monitoring

### 5. `app/api/health/comprehensive/route.ts`
- Comprehensive health check for all integrations
- Tests Printify, Stripe, Supabase, Redis, Clerk
- Environment variable validation
- Response time monitoring

## Testing Your Webhook

### 1. Test the Health Check
```bash
curl https://your-domain.vercel.app/api/health/comprehensive
```

### 2. Test the Printify Webhook
```bash
curl -X POST https://your-domain.vercel.app/api/webhooks/printify/test \
  -H "Content-Type: application/json" \
  -d '{"type":"order:created","data":{"id":"test-123"}}'
```

### 3. Test the Main Webhook
```bash
curl -X POST https://your-domain.vercel.app/api/webhooks/printify \
  -H "Content-Type: application/json" \
  -d '{"type":"order:created","data":{"id":"test-123"}}'
```

## Environment Variables Required

Make sure these are set in your Vercel environment:

```bash
# Printify
PRINTIFY_API_KEY=your_api_key_here
PRINTIFY_SHOP_ID=your_shop_id_here

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Clerk
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=your_token_here

# General
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
DEBUG_MODE=true
```

## Debugging Steps

### 1. Check Environment Variables
Visit `/api/health/comprehensive` to see which services are failing.

### 2. Check Vercel Logs
Look for errors in your Vercel function logs, especially for the webhook routes.

### 3. Test Individual Services
- Printify: Check if API key and shop ID are correct
- Stripe: Verify webhook secret and endpoint
- Supabase: Confirm database connection
- Redis: Test Upstash connection

### 4. Monitor Webhook Calls
Use the logging system to track all webhook requests and responses.

## Common Issues and Solutions

### Issue: "Module not found: @/env"
**Solution**: The `env.mjs` file should be in your project root, not in `app/lib/`.

### Issue: "Runtime not supported"
**Solution**: Ensure all webhook routes have `export const runtime = "nodejs"`.

### Issue: "Invalid webhook signature"
**Solution**: Implement proper signature verification based on Printify's documentation.

### Issue: "Environment variable not found"
**Solution**: Check Vercel environment variables and ensure they're properly set.

## Next Steps

1. **Deploy the changes** to Vercel
2. **Test the health check** endpoint
3. **Verify environment variables** are set correctly
4. **Test the webhook** with Printify's test mode
5. **Monitor logs** for any remaining issues
6. **Implement database updates** in the webhook handlers

## Monitoring and Maintenance

- Use the comprehensive health check regularly
- Monitor Vercel function logs for errors
- Set up alerts for webhook failures
- Keep environment variables up to date
- Test webhook functionality after deployments

## Support

If you continue to have issues:
1. Check the health check endpoint for specific service failures
2. Review Vercel function logs for detailed error messages
3. Verify all environment variables are set correctly
4. Test individual service connections
5. Use the structured logging to track down specific failures
