#!/usr/bin/env node
/**
 * Test script to verify that env.mjs can actually access environment variables
 * when they are loaded from .env.local into process.env
 */

import { existsSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const dotEnvLocalPath = path.join(process.cwd(), '.env.local');

console.log('🔄 Testing environment variable loading...\n');

console.log('1. Loading .env.local into process.env...');
if (existsSync(dotEnvLocalPath)) {
  const result = dotenv.config({ path: dotEnvLocalPath });
  if (result.error) {
    console.error('❌ Error loading .env.local:', result.error.message);
    process.exit(1);
  }
  console.log('   ✅ .env.local loaded');
} else {
  console.error('❌ .env.local not found');
  process.exit(1);
}

console.log('\n2. Checking if keys exist in process.env...');
const requiredKeys = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'PRINTIFY_API_KEY',
  'PRINTIFY_SHOP_ID',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
];

const inProcessEnv = requiredKeys.filter(key => process.env[key]);
console.log(`   ✅ ${inProcessEnv.length}/${requiredKeys.length} keys in process.env`);

console.log('\n3. Importing env.mjs (which validates process.env)...');
try {
  const { env } = await import('../env.mjs');
  
  console.log('\n4. Checking if env.mjs can access the keys:');
  const accessible = [];
  const missing = [];
  
  for (const key of requiredKeys) {
    const value = env[key];
    if (value) {
      accessible.push(key);
      const preview = value.length > 40 ? value.substring(0, 40) + '...' : value;
      console.log(`   ✅ ${key}: LOADED (${preview})`);
    } else {
      missing.push(key);
      console.log(`   ❌ ${key}: MISSING`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Accessible via env.mjs: ${accessible.length}/${requiredKeys.length}`);
  console.log(`   ❌ Missing from env.mjs: ${missing.length}/${requiredKeys.length}`);
  
  if (missing.length === 0) {
    console.log('\n✅ SUCCESS: All keys are properly loaded and accessible!');
    console.log('   The verify-env script ACTUALLY loads the keys, not just checks files.');
    process.exit(0);
  } else {
    console.log('\n❌ FAILURE: Some keys are missing from env.mjs');
    console.log('   The script may only be checking file existence, not actual loading.');
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Error importing env.mjs:', error.message);
  if (error.message.includes('Invalid environment variables')) {
    console.error('\n   This means env.mjs validation failed because keys are missing from process.env');
    console.error('   The verify-env script needs to load .env.local BEFORE importing env.mjs');
  }
  process.exit(1);
}

