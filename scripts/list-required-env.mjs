#!/usr/bin/env node
/**
 * Lists all required environment variables for Vercel
 */

console.log('=== REQUIRED Environment Variables for Vercel ===\n');
console.log('SERVER-SIDE (set for Production, Preview, Development):');
console.log('- CLERK_SECRET_KEY');
console.log('- STRIPE_SECRET_KEY');
console.log('- PRINTIFY_API_KEY');
console.log('- PRINTIFY_SHOP_ID');
console.log('- PRINTIFY_API_URL');
console.log('- UPSTASH_REDIS_REST_URL');
console.log('- UPSTASH_REDIS_REST_TOKEN');
console.log('- DATABASE_URL');
console.log('- DIRECT_URL');
console.log('\nCLIENT-SIDE (set for Production, Preview, Development):');
console.log('- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
console.log('- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
console.log('- NEXT_PUBLIC_FEATURE_MINIGAMES (set to: on)');
console.log('- NEXT_PUBLIC_FEATURE_RUNE (set to: off)');
console.log('- NEXT_PUBLIC_FEATURE_SOAPSTONE (set to: on)');
console.log('- NEXT_PUBLIC_FEATURE_PETALS (set to: on)');
console.log('- NEXT_PUBLIC_FEATURE_CURSOR_GLOW (set to: off)');
console.log('- NEXT_PUBLIC_FEATURE_STARFIELD (set to: on)');
console.log('\n=== How to Add in Vercel Dashboard ===');
console.log('1. Open your local .env file');
console.log('2. Copy each variable value');
console.log('3. Go to Vercel Dashboard → otakumori → Settings → Environment Variables');
console.log('4. Click "Add" and paste: KEY = VALUE');
console.log('5. Select all environments: Production ✓ Preview ✓ Development ✓');
console.log('6. Click "Save"');
console.log('\n⚠️  IMPORTANT: After adding all variables, go to Deployments tab and click "Redeploy"');

