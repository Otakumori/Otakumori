# Local Development Setup Guide

This guide will help you set up the Otakumori application for local development on `localhost:3000`.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL Database** (local or cloud)
3. **Clerk Account** (for authentication)
4. **Git** (already installed)

## Step 1: Environment Variables

Create a `.env.local` file in the root directory with the following content:

```bash
# Otakumori Local Development Environment

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (PostgreSQL) - Choose ONE option below:

# Option 1: Supabase PostgreSQL (if you have a Supabase project)
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Option 2: Neon (Free & Fast - Recommended for quick setup)
# DATABASE_URL=postgresql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require

# Option 3: Local PostgreSQL (if you have it installed)
# DATABASE_URL=postgresql://postgres:password@localhost:5432/otakumori_dev

# Placeholder - replace with your actual database URL
DATABASE_URL=postgresql://username:password@host:port/database

# Clerk Authentication (REQUIRED)
# Get these from https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Optional Supabase Features (only if you want to use Supabase for additional features)
# NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# Optional Services (can be filled later)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
PRINTIFY_API_KEY=your_printify_api_key_here
PRINTIFY_SHOP_ID=your_shop_id_here
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Security
PETAL_SALT=your_random_salt_here_32_chars_minimum
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max_old_space_size=4096
NODE_ENV=development
```

## Step 2: Database Setup

### Option A: Use Existing Supabase Project (Easiest)

If you already have a Supabase project:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to Settings → Database
3. Copy the connection string (it looks like: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)
4. Paste it as your `DATABASE_URL` in `.env.local`

### Option B: Quick Setup with Neon (Recommended for new projects)

1. Go to [Neon](https://neon.tech/)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string and paste it as your `DATABASE_URL`

### Option C: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database named `otakumori_dev`
3. Update the `DATABASE_URL` in your `.env.local`

## Step 3: Clerk Authentication Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up for a free account
3. Create a new application
4. In the API Keys section, copy:
   - Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret key → `CLERK_SECRET_KEY`
5. In the Webhooks section, create a webhook and copy the secret → `CLERK_WEBHOOK_SECRET`

## Step 4: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npm run db:seed
```

## Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 6: Test Authentication

1. Open `http://localhost:3000`
2. Click on the sign-in/sign-up button
3. Create your first user account
4. Test the authentication flow

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your `DATABASE_URL` is correct
   - Ensure the database is accessible
   - Check if the database exists

2. **Clerk Authentication Error**
   - Verify your Clerk keys are correct
   - Check that the domain is added to Clerk (localhost:3000 should work by default)
   - Ensure the webhook secret is set correctly

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript errors with `npm run typecheck`
   - Run linting with `npm run lint`

### Environment Variable Validation

The application uses strict environment variable validation. If you see validation errors, check that all required variables are set in your `.env.local` file.

## Next Steps

Once the application is running locally:

1. **Test User Registration** - Create your first user account
2. **Test Petal Collection** - Try the interactive petal collection feature
3. **Test Product Display** - Check if products are loading correctly
4. **Test API Routes** - Verify API endpoints are working

## Development Commands

```bash
# Start development server
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build

# Database operations
npx prisma studio          # Open database GUI
npx prisma db push         # Push schema changes
npx prisma generate        # Generate Prisma client
```

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check the database connection

The application is now ready for local development! 🎉
