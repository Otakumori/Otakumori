#!/usr/bin/env node

/**
 * Test script to check Vercel environment variables
 * Usage: node scripts/test-vercel-env.mjs [your-preview-url]
 */

const VERCEL_URL = process.argv[2] || 'https://otaku-mori-mamd260cs-otaku-mori-babe.vercel.app';

console.log('🔍 Testing Vercel Environment Variables...\n');

async function testVercelEnv() {
  try {
    console.log(`🌐 Testing: ${VERCEL_URL}/api/debug-env`);

    const response = await fetch(`${VERCEL_URL}/api/debug-env`, {
      headers: {
        'User-Agent': 'Otakumori Test Script',
      },
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      console.log('✅ Debug endpoint accessible\n');

      console.log('📊 Environment Status:');
      Object.entries(data.data.envStatus).forEach(([key, value]) => {
        const status = value === 'Set' ? '✅' : value === 'Missing' ? '❌' : '⚠️';
        console.log(`  ${status} ${key}: ${value}`);
      });

      console.log('\n🌍 Domain Info:');
      console.log(`  Current Domain: ${data.data.domainInfo.currentDomain}`);
      console.log(
        `  Using Production Clerk: ${data.data.domainInfo.isProductionClerk ? 'Yes' : 'No'}`,
      );
      console.log(`  Recommendation: ${data.data.domainInfo.recommendedAction}`);

      // Check for missing critical vars
      const missing = Object.entries(data.data.envStatus)
        .filter(([key, value]) => value === 'Missing')
        .map(([key]) => key);

      if (missing.length > 0) {
        console.log('\n❌ Missing Environment Variables:');
        missing.forEach((key) => console.log(`  - ${key}`));
        console.log('\n💡 Add these to your Vercel project settings under Environment Variables');
      } else {
        console.log('\n🎉 All critical environment variables are configured!');
      }
    } else {
      console.error('❌ Debug endpoint failed');
      console.error('Status:', response.status);
      console.error('Response:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Test Printify API specifically
async function testPrintifyAPI() {
  console.log('\n🧪 Testing Printify API on Vercel...');

  try {
    const response = await fetch(`${VERCEL_URL}/api/v1/printify/products`, {
      headers: {
        'User-Agent': 'Otakumori Test Script',
      },
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      console.log('✅ Printify API working on Vercel');
      console.log(`📦 Found ${data.data.length} products`);
    } else {
      console.error('❌ Printify API failed on Vercel');
      console.error('Error:', data.error);
      if (data.details) {
        console.error('Details:', data.details);
      }
    }
  } catch (error) {
    console.error('❌ Printify API test error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testVercelEnv();
  await testPrintifyAPI();
}

runTests().catch(console.error);
