#!/usr/bin/env node

/**
 * Critical Test Runner
 *
 * Runs comprehensive tests for payment and authentication flows
 * to ensure production readiness.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const TEST_PATTERNS = [
  '__tests__/api/adults/purchase.test.ts',
  '__tests__/api/v1/avatar/save.test.ts',
  '__tests__/auth/integration.test.ts',
  '__tests__/e2e/payment-flows.test.ts',
];

const CRITICAL_TEST_SUITES = [
  'Payment System Tests',
  'Avatar Verification Tests',
  'Authentication Integration Tests',
  'End-to-End Payment Flows',
];

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m', // Reset
  };

  console.log(`${colors[type]}${message}${colors.reset}`);
}

function checkTestFile(filePath) {
  const fullPath = join(process.cwd(), filePath);
  if (!existsSync(fullPath)) {
    log(` Test file not found: ${filePath}`, 'error');
    return false;
  }
  log(` Test file found: ${filePath}`, 'success');
  return true;
}

function runTestSuite(testFile, suiteName) {
  log(`\n Running ${suiteName}...`, 'info');
  log(` Test file: ${testFile}`, 'info');

  try {
    const command = `npx vitest run ${testFile} --reporter=verbose`;
    log(` Command: ${command}`, 'info');

    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' },
    });

    log(` ${suiteName} passed!`, 'success');
    return true;
  } catch (error) {
    log(` ${suiteName} failed!`, 'error');
    log(`Error: ${error.message}`, 'error');
    return false;
  }
}

function runAllTests() {
  log(`\n Starting Critical Test Suite`, 'info');
  log(` Running ${TEST_PATTERNS.length} test suites...`, 'info');

  const results = [];

  for (let i = 0; i < TEST_PATTERNS.length; i++) {
    const testFile = TEST_PATTERNS[i];
    const suiteName = CRITICAL_TEST_SUITES[i];

    // Check if test file exists
    if (!checkTestFile(testFile)) {
      results.push({ suite: suiteName, passed: false, error: 'File not found' });
      continue;
    }

    // Run the test suite
    const passed = runTestSuite(testFile, suiteName);
    results.push({ suite: suiteName, passed });
  }

  return results;
}

function generateReport(results) {
  log(`\n Test Results Summary`, 'info');
  log(`========================`, 'info');

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const failed = total - passed;

  results.forEach((result) => {
    const status = result.passed ? '' : '';
    const message = result.passed ? 'PASSED' : 'FAILED';
    const color = result.passed ? 'success' : 'error';

    log(`${status} ${result.suite}: ${message}`, color);

    if (!result.passed && result.error) {
      log(`   └─ Error: ${result.error}`, 'error');
    }
  });

  log(`\n Overall Results:`, 'info');
  log(`   Total Suites: ${total}`, 'info');
  log(`   Passed: ${passed}`, passed > 0 ? 'success' : 'warning');
  log(`   Failed: ${failed}`, failed > 0 ? 'error' : 'success');
  log(
    `   Success Rate: ${((passed / total) * 100).toFixed(1)}%`,
    passed === total ? 'success' : 'warning',
  );

  if (failed > 0) {
    log(`\n  Some tests failed. Please review the errors above.`, 'warning');
    log(` Run individual tests with: npx vitest run <test-file>`, 'info');
    process.exit(1);
  } else {
    log(`\n All critical tests passed!`, 'success');
    log(` System is ready for production deployment.`, 'success');
  }
}

function main() {
  try {
    log(`⌕ Otaku-mori Critical Test Runner`, 'info');
    log(`===================================`, 'info');

    // Check if we're in the right directory
    if (!existsSync('package.json')) {
      log(' Not in project root directory. Please run from project root.', 'error');
      process.exit(1);
    }

    // Check if vitest is available
    try {
      execSync('npx vitest --version', { stdio: 'pipe' });
    } catch (error) {
      log(' Vitest not found. Please install dependencies: npm install', 'error');
      process.exit(1);
    }

    // Run all critical tests
    const results = runAllTests();

    // Generate and display report
    generateReport(results);
  } catch (error) {
    log(` Test runner failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the test suite
main();
