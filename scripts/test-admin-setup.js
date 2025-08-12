#!/usr/bin/env node

/**
 * Test script for Admin Dashboard & Resend setup
 * Run with: node scripts/test-admin-setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Admin Dashboard & Resend Setup...\n');

// Check environment variables
console.log('1. Checking environment variables...');
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'SUPABASE_SERVICE_ROLE_KEY',
    'PRINTIFY_API_KEY',
    'PRINTIFY_SHOP_ID'
  ];
  
  const missing = requiredVars.filter(varName => !envContent.includes(varName));
  if (missing.length === 0) {
    console.log('✅ All required environment variables found');
  } else {
    console.log('❌ Missing environment variables:', missing.join(', '));
  }
} else {
  console.log('❌ .env.local file not found');
}

// Check if dependencies are installed
console.log('\n2. Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['resend', '@uiw/react-md-editor', '@uiw/react-markdown-preview'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    console.log('✅ All required dependencies installed');
  } else {
    console.log('❌ Missing dependencies:', missingDeps.join(', '));
    console.log('Run: npm install ' + missingDeps.join(' '));
  }
} catch (err) {
  console.log('❌ Error reading package.json:', err.message);
}

// Check if admin files exist
console.log('\n3. Checking admin files...');
const adminFiles = [
  'lib/email/mailer.ts',
  'lib/supabaseAdmin.ts',
  'lib/adminGuard.ts',
  'app/admin/layout.tsx',
  'app/admin/page.tsx',
  'app/admin/pages/page.tsx',
  'app/admin/posts/page.tsx',
  'app/admin/minigames/page.tsx',
  'app/admin/soapstones/page.tsx',
  'app/admin/products/page.tsx',
  'app/api/admin/printify-sync/route.ts'
];

adminFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - missing`);
  }
});

// Check if migration file exists
console.log('\n4. Checking database migration...');
const migrationFile = 'supabase/migrations/20241201000000_admin_tables.sql';
if (fs.existsSync(migrationFile)) {
  console.log('✅ Database migration file exists');
  console.log('   Run this SQL in your Supabase SQL editor');
} else {
  console.log('❌ Database migration file missing');
}

// Check Stripe webhook
console.log('\n5. Checking Stripe webhook...');
const webhookFile = 'app/api/webhooks/stripe/route.ts';
if (fs.existsSync(webhookFile)) {
  const content = fs.readFileSync(webhookFile, 'utf8');
  if (content.includes('sendOrderConfirmation') && content.includes('createPrintifyOrder')) {
    console.log('✅ Stripe webhook updated with Resend integration');
  } else {
    console.log('❌ Stripe webhook needs Resend integration');
  }
} else {
  console.log('❌ Stripe webhook file not found');
}

console.log('\n🎯 Next Steps:');
console.log('1. Add missing environment variables to .env.local');
console.log('2. Run the database migration in Supabase');
console.log('3. Set your Clerk user role to "admin"');
console.log('4. Test the admin dashboard at /admin');
console.log('5. Test email sending with a Stripe webhook');

console.log('\n📚 See ADMIN_SETUP.md for detailed instructions');
