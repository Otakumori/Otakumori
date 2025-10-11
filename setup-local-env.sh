#!/bin/bash

# Otakumori Local Environment Setup Script
# This script creates a .env.local file with the correct structure
# You'll need to fill in actual values from Vercel Dashboard

echo "Creating .env.local file for local development..."

cat > .env.local << 'EOF'
# ============================================
# LOCAL DEVELOPMENT ENVIRONMENT VARIABLES  
# ============================================
# Get actual values from: Vercel Dashboard → Settings → Environment Variables
# ============================================

NODE_ENV=development

# === Inngest (REQUIRED) ===
INNGEST_EVENT_KEY=your_inngest_event_key_from_dashboard
INNGEST_SIGNING_KEY=your_inngest_signing_key_from_dashboard
INNGEST_SERVE_URL=http://localhost:8288/api/inngest
INNGEST_PROBE=off

# === Printify (REQUIRED) ===
PRINTIFY_API_KEY=your_printify_api_key_here
PRINTIFY_SHOP_ID=your_printify_shop_id_here
PRINTIFY_API_URL=https://api.printify.com/v1
PRINTIFY_WEBHOOK_SECRET=your_printify_webhook_secret_here

# === Database (REQUIRED) ===
DATABASE_URL=postgresql://user:password@host/database
DIRECT_URL=postgresql://user:password@host/database

# === Clerk (REQUIRED) ===
CLERK_SECRET_KEY=sk_test_your_key
CLERK_ENCRYPTION_KEY=your_32_char_encryption_key
CLERK_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_PROXY_URL=https://otaku-mori.com

# === Stripe (REQUIRED) ===
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# === Redis (REQUIRED) ===
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# === Vercel Blob (REQUIRED) ===
BLOB_READ_WRITE_TOKEN=your_blob_token

# === Security Keys ===
API_KEY=your_api_key
CRON_SECRET=your_cron_secret
PETAL_SALT=your_petal_salt
GAME_HMAC_SECRET=your_32_byte_secret

# === Site URLs ===
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CANONICAL_ORIGIN=http://localhost:3000

# === Feature Flags ===
NEXT_PUBLIC_FEATURE_PETALS=true
NEXT_PUBLIC_FEATURE_GAMES=true
NEXT_PUBLIC_FEATURE_SHOP=1
NEXT_PUBLIC_FEATURE_MINIGAMES=1
NEXT_PUBLIC_FEATURE_BLOG=1
NEXT_PUBLIC_FEATURE_SOAPSTONES=1

# === Optional (can leave empty) ===
RESEND_API_KEY=
EMAIL_FROM=no-reply@otaku-mori.com
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
OTEL_SDK_DISABLED=true
EOF

echo "✅ .env.local file created!"
echo ""
echo "⚠️  IMPORTANT: Edit .env.local and replace placeholder values with actual keys from:"
echo "   📍 Vercel Dashboard → Your Project → Settings → Environment Variables"
echo ""
echo "📋 Required keys to update:"
echo "   - INNGEST_EVENT_KEY"
echo "   - INNGEST_SIGNING_KEY"
echo "   - PRINTIFY_API_KEY"
echo "   - PRINTIFY_SHOP_ID"
echo "   - DATABASE_URL"
echo "   - CLERK_SECRET_KEY"
echo "   - All other keys marked as REQUIRED"
echo ""
echo "🚀 After updating keys, restart your dev server: npm run dev"

