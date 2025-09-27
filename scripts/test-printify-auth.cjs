#!/usr/bin/env node

/**
 * Test script to verify Printify API credentials
 * Run with: node scripts/test-printify-auth.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const https = require('https');

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;

console.log('🔍 Testing Printify API Authentication...\n');

// Check if credentials are loaded
if (!PRINTIFY_API_KEY) {
  console.error('❌ PRINTIFY_API_KEY not found in environment variables');
  process.exit(1);
}

if (!PRINTIFY_SHOP_ID) {
  console.error('❌ PRINTIFY_SHOP_ID not found in environment variables');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📋 Shop ID: ${PRINTIFY_SHOP_ID}`);
console.log(`🔑 API Key: ${PRINTIFY_API_KEY.substring(0, 10)}...${PRINTIFY_API_KEY.slice(-4)}\n`);

// Test 1: Basic API connectivity
async function testBasicAuth() {
  console.log('🧪 Test 1: Basic API Authentication');

  try {
    const response = await fetch('https://api.printify.com/v1/shops.json', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Otakumori/1.0.0 (+https://otaku-mori.com)',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Basic authentication successful');
      console.log(`📊 Found ${data.length} shops`);

      // Find our specific shop
      const ourShop = data.find((shop) => shop.id.toString() === PRINTIFY_SHOP_ID);
      if (ourShop) {
        console.log(`✅ Shop found: ${ourShop.title} (ID: ${ourShop.id})`);
      } else {
        console.log(`⚠️  Shop ID ${PRINTIFY_SHOP_ID} not found in available shops`);
        console.log(
          'Available shops:',
          data.map((s) => `${s.title} (${s.id})`),
        );
      }
    } else {
      console.error('❌ Basic authentication failed');
      console.error(`Status: ${response.status}`);
      console.error('Response:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }

  return true;
}

// Test 2: Shop-specific products endpoint
async function testShopProducts() {
  console.log('\n🧪 Test 2: Shop Products Endpoint');

  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json?page=1&limit=5`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Otakumori/1.0.0 (+https://otaku-mori.com)',
        },
      },
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Shop products endpoint successful');
      console.log(`📦 Found ${data.data?.length || 0} products`);

      if (data.data && data.data.length > 0) {
        const product = data.data[0];
        console.log(`📝 Sample product: ${product.title} (ID: ${product.id})`);
      }
    } else {
      console.error('❌ Shop products endpoint failed');
      console.error(`Status: ${response.status}`);
      console.error('Response:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }

  return true;
}

// Run all tests
async function runTests() {
  const test1 = await testBasicAuth();

  if (test1) {
    const test2 = await testShopProducts();

    if (test2) {
      console.log('\n🎉 All tests passed! Printify API credentials are working correctly.');
      process.exit(0);
    }
  }

  console.log('\n❌ Some tests failed. Please check your Printify API credentials.');
  process.exit(1);
}

// Handle fetch polyfill for older Node versions
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

runTests().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
