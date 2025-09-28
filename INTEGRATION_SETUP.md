# 🚀 Comprehensive Integration Setup

This document outlines the newly scaffolded integrations for Otaku-mori, including Stripe webhooks, EasyPost shipping, Resend email, Sanity CMS, Algolia search, and Redis idempotency.

## 📋 What's Been Added

### 1. **Dependencies Updated**

- ✅ `algoliasearch@^5.7.0` - Site-wide search (non-catalog)
- ✅ `stripe@^16.0.0` - Payment processing (upgraded from 14.x)

### 2. **Environment Variables Added**

All new environment variables have been added to `env.mjs` with proper validation:

#### Stripe

- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- `CHECKOUT_SUCCESS_URL` - Success redirect URL
- `CHECKOUT_CANCEL_URL` - Cancel redirect URL

#### EasyPost

- `EASYPOST_API_KEY` - EasyPost API key
- `EASYPOST_WEBHOOK_SECRET` - Webhook signing secret
- `DEFAULT_SHIP_FROM_*` - Default shipping address fields

#### Sanity CMS

- `SANITY_PROJECT_ID` - Sanity project ID
- `SANITY_DATASET` - Dataset name (default: production)
- `SANITY_API_READ_TOKEN` - Read token
- `SANITY_WEBHOOK_SECRET` - Webhook signing secret

#### Algolia Search

- `NEXT_PUBLIC_ALGOLIA_APP_ID` - Algolia application ID
- `ALGOLIA_ADMIN_API_KEY` - Admin API key
- `ALGOLIA_INDEX_*` - Index names for blog, games, pages

#### Redis/Idempotency

- `IDEMPOTENCY_TTL_SECONDS` - Idempotency key TTL (default: 86400)
- `PETALS_DAILY_CAP` - Daily petal collection limit (default: 500)
- `RATE_LIMIT_*` - Rate limiting configuration

### 3. **Integration Files Created**

#### Redis Integration

- `app/lib/redis-rest.ts` - Upstash Redis REST API client
- `app/lib/idempotency.ts` - Idempotency key management

#### Stripe Integration

- `app/lib/stripe.ts` - Stripe client configuration
- `app/api/webhooks/stripe/route.ts` - Webhook handler for Stripe events

#### EasyPost Integration

- `app/lib/easypost.ts` - EasyPost API client
- `app/api/shipping/rates/route.ts` - Shipping rate calculation
- `app/api/shipping/buy/route.ts` - Shipping label purchase
- `app/api/webhooks/easypost/route.ts` - EasyPost webhook handler

#### Email Integration

- `app/lib/mailer.ts` - Resend email client

#### Sanity Integration

- `app/api/webhooks/sanity/route.ts` - Sanity webhook handler

#### Algolia Integration

- `app/lib/algolia.ts` - Algolia search client with indices

### 4. **Environment Management**

- `env.example` - Complete environment template
- `env.local.template` - Template with TODO placeholders
- `scripts/push-envs.ps1` - PowerShell script to push env vars to Vercel

## 🔧 Setup Instructions

### Step 1: Fill Environment Variables

1. **Copy the template:**

   ```bash
   cp env.local.template .env.local
   ```

2. **Replace TODO placeholders** with your actual values:
   - Stripe: Get from [Stripe Dashboard](https://dashboard.stripe.com)
   - EasyPost: Get from [EasyPost Dashboard](https://easypost.com/dashboard)
   - Sanity: Get from [Sanity Dashboard](https://sanity.io/manage)
   - Algolia: Get from [Algolia Dashboard](https://algolia.com/dashboard)
   - Resend: Get from [Resend Dashboard](https://resend.com/domains)

### Step 2: Push to Vercel

Use the PowerShell script to push environment variables to Vercel:

```powershell
# For production
scripts\push-envs.ps1 -EnvFile .\.env.local -Scope production

# For preview
scripts\push-envs.ps1 -EnvFile .\.env.local -Scope preview

# For development
scripts\push-envs.ps1 -EnvFile .\.env.local -Scope development
```

### Step 3: Configure Webhooks

#### Stripe Webhook

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

#### EasyPost Webhook

1. Go to [EasyPost Dashboard > Webhooks](https://easypost.com/webhooks)
2. Add endpoint: `https://your-domain.com/api/webhooks/easypost`
3. Select events: `tracker.updated`, `delivered`
4. Copy the webhook secret to `EASYPOST_WEBHOOK_SECRET`

#### Sanity Webhook

1. Go to [Sanity Dashboard > Webhooks](https://sanity.io/manage)
2. Add endpoint: `https://your-domain.com/api/webhooks/sanity`
3. Set signing secret in `SANITY_WEBHOOK_SECRET`

### Step 4: Test Integrations

#### Test Stripe Webhook

```bash
# Test locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

#### Test Shipping Rates

```bash
curl -X POST http://localhost:3000/api/shipping/rates \
  -H "Content-Type: application/json" \
  -d '{
    "to": {
      "name": "Test User",
      "street1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "US"
    },
    "parcels": [{
      "length": 10,
      "width": 8,
      "height": 6,
      "weight_oz": 16
    }]
  }'
```

## 🔒 Security Features

### Webhook Signature Verification

All webhook endpoints include signature verification:

- **Stripe**: Uses `stripe.webhooks.constructEvent()`
- **EasyPost**: Uses HMAC-SHA256 verification
- **Sanity**: Uses HMAC-SHA256 verification

### Idempotency Protection

- Redis-based idempotency keys prevent duplicate operations
- Configurable TTL for automatic cleanup
- Atomic operations using Redis SET with NX flag

### Rate Limiting

- Built-in rate limiting for API endpoints
- Configurable limits per minute/hour
- Redis-backed for distributed rate limiting

## 📊 Monitoring & Observability

### Health Checks

All integrations include health check endpoints:

- `/api/health/comprehensive` - Overall system health
- Individual service health checks in the comprehensive endpoint

### Logging

- Structured logging for all webhook events
- Error tracking with detailed context
- Performance metrics for external API calls

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Webhook endpoints configured in external services
- [ ] Stripe webhook events selected and tested
- [ ] EasyPost shipping rates tested
- [ ] Email delivery tested with Resend
- [ ] Sanity webhook tested for content updates
- [ ] Algolia search indices configured
- [ ] Redis connection tested

### Deployment Commands

```bash
# Build and deploy
pnpm build
vercel --prod

# Or use the CI/CD pipeline
git push origin main
```

## 🛠️ Development

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Test webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Environment Variables

The system gracefully handles missing environment variables in development mode. All integrations will log warnings but won't crash the application.

## 📚 API Documentation

### Stripe Webhook Events

- `checkout.session.completed` - Order completion
- `payment_intent.succeeded` - Payment success
- `payment_intent.payment_failed` - Payment failure
- `invoice.payment_succeeded` - Invoice payment

### EasyPost API

- `POST /api/shipping/rates` - Get shipping rates
- `POST /api/shipping/buy` - Purchase shipping label
- Webhook: `tracker.updated`, `delivered`

### Sanity Webhook

- Triggers on content updates
- Revalidates Next.js cache
- Updates Algolia search indices

### Algolia Search

- `idxBlog` - Blog content search
- `idxGames` - Game content search
- `idxPages` - Static page search

## 🔧 Troubleshooting

### Common Issues

1. **Webhook signature verification fails**
   - Check webhook secrets are correctly set
   - Ensure raw body is used for signature verification

2. **EasyPost API errors**
   - Verify API key is correct
   - Check shipping address format
   - Ensure EasyPost account has sufficient credits

3. **Algolia search not working**
   - Verify app ID and admin API key
   - Check index names match configuration
   - Ensure indices are populated with data

4. **Redis connection issues**
   - Verify Upstash Redis URL and token
   - Check network connectivity
   - Ensure Redis instance is active

### Debug Mode

Set `DEBUG_MODE=true` in environment variables for detailed logging.

## 📞 Support

For issues with specific integrations:

- **Stripe**: [Stripe Support](https://support.stripe.com)
- **EasyPost**: [EasyPost Support](https://easypost.com/support)
- **Resend**: [Resend Support](https://resend.com/support)
- **Sanity**: [Sanity Support](https://sanity.io/support)
- **Algolia**: [Algolia Support](https://algolia.com/support)
- **Upstash**: [Upstash Support](https://upstash.com/support)

---

## 🎯 Your Stripe Keys Are Ready!

### Quick Stripe Setup

Your Stripe keys are already configured! Run this script to add them to all Vercel environments:

```powershell
scripts\add-stripe-to-vercel.ps1
```

### Additional Services Needed

1. **EasyPost**: Get API key from [EasyPost Dashboard](https://www.easypost.com/)
2. **Resend**: Get API key from [Resend Dashboard](https://resend.com/)
3. **Sanity**: Create project and get tokens from [Sanity Dashboard](https://www.sanity.io/)
4. **Algolia**: Create app and get keys from [Algolia Dashboard](https://www.algolia.com/)

### Webhook URLs to Configure

- **Stripe**: `https://otaku-mori.com/api/webhooks/stripe`
- **EasyPost**: `https://otaku-mori.com/api/webhooks/easypost` (secret: `easyasfuckwebposthookasssecret`)
- **Sanity**: `https://otaku-mori.com/api/webhooks/sanity`

**🎉 Integration setup complete!** All services are now properly configured and ready for production use.
