#!/usr/bin/env node
/**
 * Environment Verification Script
 * Checks that all required environment variables are set
 */

const required = {
  clerk: [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY'
  ],
  database: [
    'DATABASE_URL'
  ],
  features: [
    'FEATURE_AVATARS'
  ]
};

const warnings = [];
const errors = [];

console.log('🔍 Verifying environment configuration...\n');

// Check each category
Object.entries(required).forEach(([category, vars]) => {
  console.log(`\n📦 ${category.toUpperCase()}`);
  vars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      errors.push(`❌ ${varName} is not set`);
      console.log(`  ❌ ${varName}: NOT SET`);
    } else if (value.includes('your_') || value.includes('test_')) {
      warnings.push(`⚠️  ${varName} appears to be a placeholder`);
      console.log(`  ⚠️  ${varName}: SET (but may be placeholder)`);
    } else {
      console.log(`  ✅ ${varName}: SET`);
    }
  });
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All required environment variables are configured!\n');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(err => console.log(`   ${err}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(warn => console.log(`   ${warn}`));
    console.log('');
  }
  
  console.log('📝 To fix:');
  console.log('   1. Copy env.example to .env.local');
  console.log('   2. Add your Clerk keys from https://dashboard.clerk.com');
  console.log('   3. Add your database URL');
  console.log('   4. Run: npm run verify-env\n');
  
  process.exit(errors.length > 0 ? 1 : 0);
}

