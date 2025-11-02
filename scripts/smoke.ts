#!/usr/bin/env tsx

/**
 * Smoke test script for Otaku-mori Next.js app
 * Tests critical routes and APIs to ensure production readiness
 */

import { env } from '@/env';

const BASE_URL = env.BASE_URL || 'http://localhost:3000';

interface TestResult {
  route: string;
  status: number;
  responseTime: number;
  error?: string;
  data?: any;
}

async function testRoute(route: string): Promise<TestResult> {
  const start = Date.now();
  const url = `${BASE_URL}${route}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Otaku-mori-Smoke-Test/1.0',
      },
    });

    const responseTime = Date.now() - start;
    let data;

    try {
      data = await response.json();
    } catch {
      // Not JSON response, that's fine for some routes
    }

    return {
      route,
      status: response.status,
      responseTime,
      data,
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    return {
      route,
      status: 0,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runSmokeTests() {
  // ' Starting Otaku-mori smoke tests...\n'

  const routes = [
    '/',
    '/shop',
    '/mini-games',
    '/blog',
    '/api/health',
    '/api/v1/printify/products',
    '/api/soapstones',
  ];

  const results: TestResult[] = [];

  for (const route of routes) {
    // `Testing ${route}...`
    const result = await testRoute(route);
    results.push(result);

    const statusIcon = result.status >= 200 && result.status < 300 ? '✅' : '❌';
    console.log(`  ${statusIcon} ${result.status} ${result.route} (${result.responseTime}ms)`);

    if (result.error) {
      console.error(`    Error: ${result.error}`);
    }

    // Add delay between requests to be respectful
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('\n Test Results Summary:');
  console.log('========================');

  const successful = results.filter((r) => r.status >= 200 && r.status < 300);
  const failed = results.filter((r) => r.status < 200 || r.status >= 300);

  console.log(` Successful: ${successful.length}/${results.length}`);
  console.log(` Failed: ${failed.length}/${results.length}`);

  if (failed.length > 0) {
    console.log('\n Failed Routes:');
    failed.forEach((result) => {
      console.log(`  ${result.route}: ${result.status} - ${result.error || 'HTTP Error'}`);
    });
  }

  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  console.log(`\n Average Response Time: ${avgResponseTime.toFixed(0)}ms`);

  // Check specific API responses
  const printifyResult = results.find((r) => r.route === '/api/v1/printify/products');
  if (printifyResult?.data) {
    const source = printifyResult.data.source;
    if (source === 'mock') {
      // '\n  WARNING: Printify API is returning mock data!'
      // '   Check environment variables: PRINTIFY_API_KEY, PRINTIFY_SHOP_ID'
    } else if (source === 'live') {
      // '\n Printify API is returning live data'
    }
  }

  const healthResult = results.find((r) => r.route === '/api/health');
  if (healthResult?.data) {
    // '\n Health Check Status:'
    // `   Overall: ${healthResult.data.status}`
    // `   Clerk: ${healthResult.data.services?.clerk}`
    // `   Database: ${healthResult.data.services?.database}`
    // `   Printify: ${healthResult.data.services?.printify}`
  }

  // '\n Next Steps:'
  if (failed.length === 0) {
    // '   All routes are working! Ready for production.'
  } else {
    // '   Fix failed routes before deploying.'
  }

  // '   Run with: npm run smoke'
  // '   Or: npx tsx scripts/smoke.ts'

  return failed.length === 0;
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSmokeTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Smoke test failed:', error);
      process.exit(1);
    });
}

export { runSmokeTests };
