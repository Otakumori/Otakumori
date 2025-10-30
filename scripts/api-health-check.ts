#!/usr/bin/env tsx

/**
 * Comprehensive API Health Check Suite
 * This script tests all critical API endpoints to ensure they're working correctly
 * Run this before deployments to catch issues early
 */


interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  statusCode?: number;
  responseTime?: number;
  error?: string;
  details?: any;
}

class APIHealthChecker {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  private async testEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    expectedStatus: number = 200,
    body?: any,
  ): Promise<TestResult> {
    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseTime = Date.now() - startTime;
      const isSuccess = response.status === expectedStatus;

      let details;
      try {
        // Clone the response to avoid "body already read" errors
        const clonedResponse = response.clone();
        details = await clonedResponse.json();
      } catch {
        try {
          const clonedResponse = response.clone();
          details = await clonedResponse.text();
        } catch {
          details = 'Unable to read response body';
        }
      }

      return {
        endpoint,
        method,
        status: isSuccess ? 'PASS' : 'FAIL',
        statusCode: response.status,
        responseTime,
        details,
      };
    } catch (error) {
      return {
        endpoint,
        method,
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async runAllTests(): Promise<void> {
    // '⌕ Starting Comprehensive API Health Check...\n'

    // Test 1: Health endpoints
    // ' Testing Health Endpoints...'
    this.results.push(await this.testEndpoint('/api/health'));
    this.results.push(await this.testEndpoint('/api/health/comprehensive'));

    // Test 2: Public shop endpoints
    // ' Testing Shop Endpoints...'
    this.results.push(await this.testEndpoint('/api/v1/shop/products?limit=3'));
    this.results.push(await this.testEndpoint('/api/shop/products?limit=3'));

    // Test 3: Authentication-required endpoints (should return 401)
    // ' Testing Protected Endpoints...'
    this.results.push(await this.testEndpoint('/api/gacha', 'POST', 401));
    this.results.push(await this.testEndpoint('/api/v1/petals/balance', 'GET', 401));
    this.results.push(await this.testEndpoint('/api/profile/me', 'GET', 401));

    // Test 4: Public game endpoints
    // ' Testing Game Endpoints...'
    this.results.push(await this.testEndpoint('/api/v1/games/stats', 'GET', 401)); // Should be protected
    this.results.push(await this.testEndpoint('/api/leaderboard/game', 'GET', 200)); // Should be public

    // Test 5: Blog and content endpoints
    // ' Testing Content Endpoints...'
    this.results.push(await this.testEndpoint('/api/blog/posts'));
    this.results.push(await this.testEndpoint('/api/community/posts', 'GET', 200));

    // Test 6: System endpoints
    // ' Testing System Endpoints...'
    this.results.push(await this.testEndpoint('/api/system-check'));
    this.results.push(await this.testEndpoint('/api/metrics'));

    this.printResults();
  }

  private printResults(): void {
    // '\n API Health Check Results:\n'

    const passed = this.results.filter((r) => r.status === 'PASS').length;
    const failed = this.results.filter((r) => r.status === 'FAIL').length;
    const total = this.results.length;

    // ` PASSED: ${passed}/${total}`
    // ` FAILED: ${failed}/${total}`
    // ` SUCCESS RATE: ${((passed / total * 100).toFixed(1)}%\n`);

    // Show failed tests
    const failedTests = this.results.filter((r) => r.status === 'FAIL');
    if (failedTests.length > 0) {
      // ' FAILED TESTS:'
      failedTests.forEach((test) => {
        // `  • ${test.method} ${test.endpoint}`
        // if (test.statusCode) `    Status: ${test.statusCode}`
        // if (test.error) `    Error: ${test.error}`
        // if (test.responseTime) `    Time: ${test.responseTime}ms`
      });
    }

    // Show passed tests
    const passedTests = this.results.filter((r) => r.status === 'PASS');
    if (passedTests.length > 0) {
      // '\n PASSED TESTS:'
      passedTests.forEach((test) => {
        // 
          `  • ${test.method} ${test.endpoint} (${test.statusCode} - ${test.responseTime}ms`,
        );
      });
    }

    // Recommendations
    if (failed > 0) {
      // '\n RECOMMENDATIONS:'
      // '  • Fix failed endpoints before deployment'
      // '  • Check database connections'
      // '  • Verify environment variables'
      // '  • Check Clerk authentication setup'
    } else {
      // '\n ALL TESTS PASSED! Ready for deployment.'
    }
  }
}

// Run the health check
async function main() {
  const checker = new APIHealthChecker();
  await checker.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { APIHealthChecker };
