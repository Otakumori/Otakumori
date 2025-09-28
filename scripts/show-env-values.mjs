#!/usr/bin/env node
/**
 * Quick script to show the actual environment variable values for copying to Vercel
 * This is a helper for the vercel-env-manager.mjs script
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables from local files
function loadLocalEnv() {
  const envFiles = ['.env.local', '.env', 'env.local.sample'];
  const env = {};

  for (const envFile of envFiles) {
    const envPath = join(process.cwd(), envFile);

    if (!existsSync(envPath)) continue;

    try {
      const content = readFileSync(envPath, 'utf8');
      const lines = content.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const cleanKey = key.trim();
            const cleanValue = valueParts
              .join('=')
              .trim()
              .replace(/^["']|["']$/g, '');

            if (
              !env[cleanKey] &&
              cleanValue &&
              !cleanValue.includes('your_') &&
              !cleanValue.includes('placeholder')
            ) {
              env[cleanKey] = cleanValue;
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Could not read ${envFile}: ${error.message}`);
    }
  }

  return env;
}

// Missing variables from the audit
const missingVars = {
  CLERK_WEBHOOK_SECRET: ['production', 'preview', 'development'],
  DATABASE_URL: ['preview'],
  PRINTIFY_SHOP_ID: ['preview', 'development'],
  PRINTIFY_API_KEY: ['production'], // This might be expired in production
  PRINTIFY_API_URL: ['production', 'preview', 'development'],
  PRINTIFY_WEBHOOK_SECRET: ['production', 'preview', 'development'],
};

console.log('🔑 ENVIRONMENT VARIABLE VALUES FOR VERCEL\n');
console.log('Copy these values when running the vercel env add commands:\n');

const localEnv = loadLocalEnv();

for (const [key, environments] of Object.entries(missingVars)) {
  console.log(`📋 ${key}:`);

  if (localEnv[key]) {
    console.log(`   Value: ${localEnv[key]}`);
  } else {
    console.log(
      `   ⚠️  Not found in local files - you'll need to get this from your service provider`,
    );
  }

  console.log(`   Environments: ${environments.join(', ')}`);
  console.log('');
}

console.log('🚀 COMMANDS TO RUN:');
console.log('');

for (const [key, environments] of Object.entries(missingVars)) {
  for (const env of environments) {
    console.log(`vercel env add ${key} ${env}`);
  }
}

console.log('\n💡 After adding all variables, redeploy your application!');
