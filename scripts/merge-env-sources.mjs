#!/usr/bin/env node
/**
 * Merge environment variables from all sources
 * Collects variables from: process.env, .env, .env.local, .env.vercel
 * Creates/updates .env.local with all required variables
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import dotenv from 'dotenv';

const REQUIRED_VARS = [
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CLERK_SECRET_KEY',
  'PRINTIFY_API_KEY',
  'PRINTIFY_SHOP_ID',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }
  try {
    const content = readFileSync(filePath, 'utf8');
    return dotenv.parse(content);
  } catch (error) {
    console.warn(`Warning: Could not parse ${filePath}: ${error.message}`);
    return {};
  }
}

function parseVercelFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }
  try {
    const content = readFileSync(filePath, 'utf8');
    // Vercel env files have Windows line endings and quotes
    const lines = content.split('\n');
    const result = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        // Remove quotes and \r\n
        const cleanValue = value.replace(/^["']|["']\r?$/g, '').replace(/\r$/, '');
        result[key] = cleanValue;
      }
    }
    return result;
  } catch (error) {
    console.warn(`Warning: Could not parse ${filePath}: ${error.message}`);
    return {};
  }
}

function mergeSources() {
  const projectRoot = process.cwd();

  // Collect from all sources (priority: .env.local > .env > .env.vercel > process.env)
  const processEnv = Object.entries(process.env)
    .filter(([, value]) => typeof value === 'string' && value.trim())
    .reduce((acc, [key, value]) => {
      acc[key] = value.trim();
      return acc;
    }, {});

  const envFile = parseEnvFile(join(projectRoot, '.env'));
  const envLocalFile = parseEnvFile(join(projectRoot, '.env.local'));
  const vercelFile = parseVercelFile(join(projectRoot, '.env.vercel'));

  // Merge with priority (later sources override earlier ones)
  const merged = {
    ...processEnv,
    ...vercelFile,
    ...envFile,
    ...envLocalFile, // Highest priority
  };

  // Check which required variables are present
  const present = [];
  const missing = [];

  for (const key of REQUIRED_VARS) {
    if (merged[key] && merged[key].trim()) {
      present.push(key);
    } else {
      missing.push(key);
    }
  }

  return { merged, present, missing };
}

function updateEnvLocal(merged) {
  const projectRoot = process.cwd();
  const envLocalPath = join(projectRoot, '.env.local');

  // Read existing .env.local to preserve comments and other vars
  let existingContent = '';
  if (existsSync(envLocalPath)) {
    existingContent = readFileSync(envLocalPath, 'utf8');
  }

  // Parse existing to preserve non-required vars
  const existing = parseEnvFile(envLocalPath);

  // Merge with new merged values (preserve existing non-required vars)
  const final = {
    ...existing,
    ...merged,
  };

  // Write .env.local
  const lines = [];

  // Add header comment
  lines.push('# Environment variables merged from all sources');
  lines.push('# Sources: process.env, .env, .env.local, .env.vercel');
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push('');

  // Add required variables first
  lines.push('# === Required Server Variables ===');
  for (const key of REQUIRED_VARS) {
    if (final[key]) {
      lines.push(`${key}=${final[key]}`);
    }
  }

  lines.push('');
  lines.push('# === Additional Variables ===');

  // Add other variables (alphabetically sorted)
  const otherKeys = Object.keys(final)
    .filter((key) => !REQUIRED_VARS.includes(key))
    .sort();

  for (const key of otherKeys) {
    if (final[key]) {
      lines.push(`${key}=${final[key]}`);
    }
  }

  writeFileSync(envLocalPath, lines.join('\n') + '\n', 'utf8');
  console.log(`✅ Updated ${envLocalPath}`);
}

async function main() {
  console.log('🔄 Merging environment variables from all sources...\n');

  const { merged, present, missing } = mergeSources();

  console.log(`📊 Status:`);
  console.log(`   ✅ Present: ${present.length}/${REQUIRED_VARS.length}`);
  console.log(`   ❌ Missing: ${missing.length}/${REQUIRED_VARS.length}`);

  if (present.length > 0) {
    console.log(`\n✅ Found variables:`);
    present.forEach((key) => {
      const value = merged[key];
      const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;
      console.log(`   ${key}=${preview}`);
    });
  }

  if (missing.length > 0) {
    console.log(`\n❌ Missing variables:`);
    missing.forEach((key) => console.log(`   ${key}`));
    console.log(`\n⚠️  Please set these manually or pull from Vercel production environment.`);
  }

  // Update .env.local with what we have
  updateEnvLocal(merged);

  if (missing.length === 0) {
    console.log(`\n✅ All required variables are present!`);
    return 0;
  } else {
    console.log(`\n⚠️  Some required variables are still missing.`);
    return 1;
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
