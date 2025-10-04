#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create .env.local with basic configuration
const envContent = `# Otakumori Environment Configuration
# This is a development setup - replace with your actual values

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Replace with your actual database URL)
# For development, you can use a local PostgreSQL or a free service like Neon
DATABASE_URL="postgresql://username:password@localhost:5432/otakumori"

# Clerk Authentication (Replace with your actual keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
CLERK_SECRET_KEY="sk_test_your_secret_key_here"
CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Stripe Payments (Optional for now)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Printify Integration (Optional for now)
PRINTIFY_API_KEY="your_printify_api_key_here"
PRINTIFY_SHOP_ID="your_shop_id_here"

# Upstash Redis (Optional for now)
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_token_here"

# Supabase (Optional for now)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key_here"

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Security & Performance
PETAL_SALT="your_random_salt_here"
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max_old_space_size=4096

# Deployment
VERCEL=1
AUTHORIZED_PARTIES=localhost:3000
`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log(' Created .env.local file with basic configuration');
  console.log('  Please update the values with your actual API keys and database URL');
} else {
  console.log('  .env.local already exists - not overwriting');
}

console.log('\n Next steps:');
console.log('1. Update DATABASE_URL with your actual database connection string');
console.log('2. Add your Clerk authentication keys');
console.log('3. Optionally add Stripe, Printify, and other service keys');
console.log('4. Run: npm run dev');
