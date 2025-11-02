#!/usr/bin/env node
// scripts/env-check.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const scriptLabel = path.relative(process.cwd(), __filename);

const argv = process.argv.slice(2);
let envFile = '.env.local';

for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--env-file' && argv[i + 1]) {
    envFile = argv[i + 1];
  }
}

const envPath = path.resolve(process.cwd(), envFile);
if (!fs.existsSync(envPath)) {
  console.warn(`[env:check] (${scriptLabel}) Warning: ${envFile} not found at ${envPath}`);
} else {
  const content = fs.readFileSync(envPath, 'utf-8');
  const parsed = dotenv.parse(content);
  Object.assign(process.env, parsed);
}

const required = [
  'DATABASE_URL',
  'BLOB_READ_WRITE_TOKEN',
  'BLOB_PUBLIC_BASE_URL',
  'BLOB_BUCKET_PREFIX',
];

const missing = required.filter((k) => !process.env[k]);

if (missing.length > 0) {
  console.error('Missing required environment variables (checked in ' + envFile + '):');
  missing.forEach((k) => {
    console.error('  - ' + k);
  });
  console.error('\nSuggested actions:');
  console.error(
    '1) Create ' + envFile + ' in repo root and add the missing keys with test values.',
  );
  console.error('   Example .env.test contents:');
  console.error('     DATABASE_URL=postgresql://postgres:password@localhost:5432/otakumori_test');
  console.error('     BLOB_READ_WRITE_TOKEN=test');
  console.error('     BLOB_PUBLIC_BASE_URL=http://localhost:3001');
  console.error('     BLOB_BUCKET_PREFIX=om');
  console.error('\n2) For Vercel, use: `vercel env add NAME` or set via dashboard.');
  process.exit(1);
} else {
  console.log('All required environment variables present (checked ' + envFile + ').');
  process.exit(0);
}

