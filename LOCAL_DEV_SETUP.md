# Local Development Setup Guide

## Clerk Production Keys Error Fix

You're seeing this error because you're using **production Clerk keys** on localhost:

```
Error: Clerk: Production Keys are only allowed for domain "otaku-mori.com"
```

### Solution: Use Development Keys for Local Development

## Step 1: Create a Clerk Development Application

1. Go to https://dashboard.clerk.com
2. Click **"+ Create application"**
3. Name it something like "Otaku-mori Dev" or "Otaku-mori Local"
4. Select the same authentication methods as your production app
5. Click **Create application**

## Step 2: Get Your Development Keys

In your new development application dashboard:

1. Go to **"API Keys"** in the left sidebar
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## Step 3: Create `.env.local` File

Create a file named `.env.local` in your project root with these essential keys:

```bash
# === Core Application ===
NODE_ENV=development
DATABASE_URL=your_neon_dev_database_url
DIRECT_URL=your_neon_dev_direct_url

# === Clerk Authentication (DEVELOPMENT KEYS) ===
CLERK_SECRET_KEY=sk_test_YOUR_DEV_SECRET_KEY_HERE
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_DEV_PUBLISHABLE_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# === Site URLs (Local) ===
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CANONICAL_ORIGIN=http://localhost:3000

# === Inngest (Local) ===
INNGEST_EVENT_KEY=local_event_key_any_string
INNGEST_SIGNING_KEY=local_signing_key_any_string
INNGEST_SERVE_URL=http://localhost:3000/api/inngest
INNGEST_PROBE=off

# === Feature Flags (Enable all for dev) ===
NEXT_PUBLIC_FEATURE_HERO=1
NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE=1
NEXT_PUBLIC_FEATURE_SHOP=1
NEXT_PUBLIC_FEATURE_MINIGAMES=1
NEXT_PUBLIC_FEATURE_BLOG=1
NEXT_PUBLIC_FEATURE_SOAPSTONES=1
NEXT_PUBLIC_LIVE_DATA=1

# === App Environment ===
NEXT_PUBLIC_APP_ENV=development

# === Optional Services ===
# Add other service keys as needed (Stripe test keys, Printify, etc.)
```

## Step 4: Configure Clerk Development Instance

In your Clerk development dashboard:

1. Go to **"Paths"**:
   - Set Sign-in path: `/sign-in`
   - Set Sign-up path: `/sign-up`
   - Set Home URL: `http://localhost:3000`

2. Go to **"Domains"**:
   - Add `localhost` to allowed domains

3. Go to **"Sessions"**:
   - Configure session settings to match your production instance

## Step 5: Restart Development Server

```bash
# Stop the current dev server (Ctrl+C)
# Restart with new environment variables
npm run dev
```

## Important Notes

### Key Differences Between Dev and Production

| Environment | Clerk Keys Start With | Domain |
|-------------|----------------------|--------|
| Development | `pk_test_`, `sk_test_` | `localhost` |
| Production | `pk_live_`, `sk_live_` | `otaku-mori.com` |

### Database Considerations

You have two options for local development:

1. **Separate Dev Database** (Recommended):
   - Create a separate Neon database for development
   - Prevents accidental data corruption
   - Allows testing migrations safely

2. **Shared Database** (Not Recommended):
   - Use production database for local dev
   - Risky - can corrupt production data
   - Only if you're very careful

### Environment Variables Priority

Next.js loads environment variables in this order:
1. `.env.local` (highest priority, not committed to git)
2. `.env.development` or `.env.production`
3. `.env`

Always use `.env.local` for local development secrets.

## Testing the Fix

After setting up your development keys, you should:

1. See Clerk sign-in working on `localhost:3000`
2. No more domain errors in console
3. Able to sign in/sign up with test users

## Troubleshooting

### Still seeing domain errors?
- Make sure you copied the **test** keys (`pk_test_`, `sk_test_`)
- Check that `.env.local` is in your project root
- Restart your dev server after creating `.env.local`

### Can't sign in?
- Verify the Clerk development instance is set to "Development" mode
- Check that paths are configured correctly (`/sign-in`, `/sign-up`)
- Make sure `localhost` is in allowed domains

### Database connection errors?
- Update `DATABASE_URL` with your development database URL
- Run `npx prisma generate` to regenerate Prisma client
- Run `npx prisma db push` to sync schema to dev database

## Next Steps

Once you have local development working:

1. ✅ Test authentication flow
2. ✅ Test game features
3. ✅ Test petal collection
4. ✅ Make your code changes
5. ✅ Deploy to production (which uses production Clerk keys)

## Quick Reference

**Create `.env.local` with development keys → Restart dev server → Test**

That's it! Your local environment should now work properly with Clerk authentication.

