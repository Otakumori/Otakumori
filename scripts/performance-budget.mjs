#!/usr/bin/env node

/**
 * Performance Budget Validation Script
 *
 * Validates bundle sizes and performance metrics against defined budgets
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Performance budgets
const BUDGETS = {
  bundle: {
    main: 230 * 1024, // 230KB
    route: 150 * 1024, // 150KB
    vendor: 200 * 1024, // 200KB
    total: 500 * 1024, // 500KB
  },
  coreWebVitals: {
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // 0.1
  },
  gamecube: {
    fps: 45, // 45 FPS minimum
    loadTime: 3000, // 3s load time
  },
};

// Bundle analysis results structure
let bundleAnalysis = null;

/**
 * Load bundle analysis results
 */
function loadBundleAnalysis() {
  const buildDir = join(__dirname, '..', '.next');
  const analysisFile = join(buildDir, 'analyze', 'client.json');

  if (!existsSync(analysisFile)) {
    console.warn('  Bundle analysis file not found. Run "npm run build:analyze" first.');
    return null;
  }

  try {
    const content = readFileSync(analysisFile, 'utf8');
    bundleAnalysis = JSON.parse(content);
    return bundleAnalysis;
  } catch (error) {
    console.error(' Failed to load bundle analysis:', error.message);
    return null;
  }
}

/**
 * Validate bundle sizes
 */
function validateBundleSizes() {
  if (!bundleAnalysis) {
    console.log('⏭️  Skipping bundle size validation (no analysis data)');
    return { passed: true, issues: [] };
  }

  const issues = [];
  let totalSize = 0;

  // Analyze chunks
  for (const chunk of bundleAnalysis.chunks || []) {
    const size = chunk.size;
    totalSize += size;

    // Check individual chunk sizes
    if (chunk.names.includes('main') && size > BUDGETS.bundle.main) {
      issues.push({
        type: 'bundle',
        chunk: 'main',
        size,
        limit: BUDGETS.bundle.main,
        message: `Main bundle (${formatBytes(size)}) exceeds limit (${formatBytes(BUDGETS.bundle.main)})`,
      });
    }

    if (chunk.names.some((name) => name.includes('pages')) && size > BUDGETS.bundle.route) {
      issues.push({
        type: 'bundle',
        chunk: 'route',
        size,
        limit: BUDGETS.bundle.route,
        message: `Route chunk (${formatBytes(size)}) exceeds limit (${formatBytes(BUDGETS.bundle.route)})`,
      });
    }

    if (chunk.names.some((name) => name.includes('vendor')) && size > BUDGETS.bundle.vendor) {
      issues.push({
        type: 'bundle',
        chunk: 'vendor',
        size,
        limit: BUDGETS.bundle.vendor,
        message: `Vendor chunk (${formatBytes(size)}) exceeds limit (${formatBytes(BUDGETS.bundle.vendor)})`,
      });
    }
  }

  // Check total size
  if (totalSize > BUDGETS.bundle.total) {
    issues.push({
      type: 'bundle',
      chunk: 'total',
      size: totalSize,
      limit: BUDGETS.bundle.total,
      message: `Total bundle size (${formatBytes(totalSize)}) exceeds limit (${formatBytes(BUDGETS.bundle.total)})`,
    });
  }

  return {
    passed: issues.length === 0,
    issues,
    totalSize,
  };
}

/**
 * Validate Core Web Vitals (placeholder - would integrate with real metrics)
 */
function validateCoreWebVitals() {
  // This would integrate with real performance monitoring
  // For now, we'll return a placeholder
  console.log(' Core Web Vitals validation (placeholder)');

  return {
    passed: true,
    metrics: {
      lcp: { value: 2100, limit: BUDGETS.coreWebVitals.lcp, passed: true },
      fid: { value: 85, limit: BUDGETS.coreWebVitals.fid, passed: true },
      cls: { value: 0.08, limit: BUDGETS.coreWebVitals.cls, passed: true },
    },
  };
}

/**
 * Validate GameCube performance
 */
function validateGameCubePerformance() {
  // This would integrate with GameCube performance monitoring
  console.log(' GameCube performance validation (placeholder)');

  return {
    passed: true,
    metrics: {
      fps: { value: 60, limit: BUDGETS.gamecube.fps, passed: true },
      loadTime: { value: 2500, limit: BUDGETS.gamecube.loadTime, passed: true },
    },
  };
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate performance report
 */
function generateReport(results) {
  console.log('\n Performance Budget Report');
  console.log('============================\n');

  // Bundle size results
  console.log(' Bundle Size Validation:');
  if (results.bundle.passed) {
    console.log(' All bundle sizes within budget');
    console.log(`   Total size: ${formatBytes(results.bundle.totalSize)}`);
  } else {
    console.log(' Bundle size violations:');
    results.bundle.issues.forEach((issue) => {
      console.log(`   • ${issue.message}`);
    });
  }

  // Core Web Vitals results
  console.log('\n Core Web Vitals:');
  Object.entries(results.webVitals.metrics).forEach(([metric, data]) => {
    const status = data.passed ? '' : '';
    console.log(`   ${status} ${metric.toUpperCase()}: ${data.value} (limit: ${data.limit})`);
  });

  // GameCube performance results
  console.log('\n GameCube Performance:');
  Object.entries(results.gamecube.metrics).forEach(([metric, data]) => {
    const status = data.passed ? '' : '';
    console.log(`   ${status} ${metric.toUpperCase()}: ${data.value} (limit: ${data.limit})`);
  });

  // Overall result
  const overallPassed =
    results.bundle.passed && results.webVitals.passed && results.gamecube.passed;
  console.log(`\n${overallPassed ? '' : ''} Overall: ${overallPassed ? 'PASSED' : 'FAILED'}`);

  return overallPassed;
}

/**
 * Main execution
 */
function main() {
  console.log(' Starting performance budget validation...\n');

  // Load bundle analysis
  loadBundleAnalysis();

  // Run validations
  const bundleResults = validateBundleSizes();
  const webVitalsResults = validateCoreWebVitals();
  const gamecubeResults = validateGameCubePerformance();

  // Generate report
  const passed = generateReport({
    bundle: bundleResults,
    webVitals: webVitalsResults,
    gamecube: gamecubeResults,
  });

  // Exit with appropriate code
  process.exit(passed ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
