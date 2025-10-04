#!/usr/bin/env node

/**
 * Lighthouse Performance Monitoring Script
 *
 * Runs Lighthouse audits and validates against performance budgets
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Performance budgets
const BUDGETS = {
  performance: 90, // 90/100
  accessibility: 90, // 90/100
  bestPractices: 90, // 90/100
  seo: 90, // 90/100

  // Core Web Vitals
  lcp: 2500, // 2.5s
  fid: 100, // 100ms
  cls: 0.1, // 0.1
  fcp: 2000, // 2s
  tbt: 300, // 300ms

  // Bundle sizes
  totalJS: 500, // 500KB
  totalCSS: 100, // 100KB
  totalImages: 500, // 500KB
  totalSize: 1000, // 1MB
};

/**
 * Run Lighthouse audit
 */
function runLighthouse(url) {
  return new Promise((resolve, reject) => {
    const lighthouse = spawn(
      'npx',
      [
        'lighthouse',
        url,
        '--output=json',
        '--output-path=./lighthouse-results.json',
        '--chrome-flags=--headless',
        '--only-categories=performance,accessibility,best-practices,seo',
      ],
      {
        stdio: 'pipe',
      },
    );

    let stdout = '';
    let stderr = '';

    lighthouse.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    lighthouse.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    lighthouse.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Lighthouse exited with code ${code}: ${stderr}`));
      }
    });
  });
}

/**
 * Parse Lighthouse results
 */
function parseLighthouseResults() {
  const resultsFile = join(__dirname, '..', 'lighthouse-results.json');

  if (!existsSync(resultsFile)) {
    throw new Error('Lighthouse results file not found');
  }

  const results = JSON.parse(require('fs').readFileSync(resultsFile, 'utf8'));
  return results;
}

/**
 * Validate performance budgets
 */
function validateBudgets(results) {
  const issues = [];

  // Category scores
  const categories = results.categories;
  if (categories.performance.score * 100 < BUDGETS.performance) {
    issues.push({
      type: 'score',
      category: 'performance',
      score: categories.performance.score * 100,
      threshold: BUDGETS.performance,
      message: `Performance score ${Math.round(categories.performance.score * 100)} below threshold ${BUDGETS.performance}`,
    });
  }

  if (categories.accessibility.score * 100 < BUDGETS.accessibility) {
    issues.push({
      type: 'score',
      category: 'accessibility',
      score: categories.accessibility.score * 100,
      threshold: BUDGETS.accessibility,
      message: `Accessibility score ${Math.round(categories.accessibility.score * 100)} below threshold ${BUDGETS.accessibility}`,
    });
  }

  if (categories['best-practices'].score * 100 < BUDGETS.bestPractices) {
    issues.push({
      type: 'score',
      category: 'best-practices',
      score: categories['best-practices'].score * 100,
      threshold: BUDGETS.bestPractices,
      message: `Best practices score ${Math.round(categories['best-practices'].score * 100)} below threshold ${BUDGETS.bestPractices}`,
    });
  }

  if (categories.seo.score * 100 < BUDGETS.seo) {
    issues.push({
      type: 'score',
      category: 'seo',
      score: categories.seo.score * 100,
      threshold: BUDGETS.seo,
      message: `SEO score ${Math.round(categories.seo.score * 100)} below threshold ${BUDGETS.seo}`,
    });
  }

  // Core Web Vitals
  const audits = results.audits;

  if (audits['largest-contentful-paint']?.numericValue > BUDGETS.lcp) {
    issues.push({
      type: 'metric',
      metric: 'LCP',
      value: audits['largest-contentful-paint'].numericValue,
      threshold: BUDGETS.lcp,
      message: `LCP ${Math.round(audits['largest-contentful-paint'].numericValue)}ms exceeds threshold ${BUDGETS.lcp}ms`,
    });
  }

  if (audits['first-contentful-paint']?.numericValue > BUDGETS.fcp) {
    issues.push({
      type: 'metric',
      metric: 'FCP',
      value: audits['first-contentful-paint'].numericValue,
      threshold: BUDGETS.fcp,
      message: `FCP ${Math.round(audits['first-contentful-paint'].numericValue)}ms exceeds threshold ${BUDGETS.fcp}ms`,
    });
  }

  if (audits['cumulative-layout-shift']?.numericValue > BUDGETS.cls) {
    issues.push({
      type: 'metric',
      metric: 'CLS',
      value: audits['cumulative-layout-shift'].numericValue,
      threshold: BUDGETS.cls,
      message: `CLS ${audits['cumulative-layout-shift'].numericValue} exceeds threshold ${BUDGETS.cls}`,
    });
  }

  if (audits['total-blocking-time']?.numericValue > BUDGETS.tbt) {
    issues.push({
      type: 'metric',
      metric: 'TBT',
      value: audits['total-blocking-time'].numericValue,
      threshold: BUDGETS.tbt,
      message: `TBT ${Math.round(audits['total-blocking-time'].numericValue)}ms exceeds threshold ${BUDGETS.tbt}ms`,
    });
  }

  // Resource budgets
  const resources = results.audits['resource-summary']?.details?.items || [];
  let totalJS = 0,
    totalCSS = 0,
    totalImages = 0,
    totalSize = 0;

  resources.forEach((resource) => {
    const size = resource.transferSize || 0;
    totalSize += size;

    if (resource.mimeType?.includes('javascript')) {
      totalJS += size;
    } else if (resource.mimeType?.includes('css')) {
      totalCSS += size;
    } else if (resource.mimeType?.includes('image')) {
      totalImages += size;
    }
  });

  if (totalJS > BUDGETS.totalJS * 1024) {
    issues.push({
      type: 'budget',
      resource: 'JavaScript',
      size: totalJS,
      threshold: BUDGETS.totalJS * 1024,
      message: `JavaScript bundle ${Math.round(totalJS / 1024)}KB exceeds threshold ${BUDGETS.totalJS}KB`,
    });
  }

  if (totalCSS > BUDGETS.totalCSS * 1024) {
    issues.push({
      type: 'budget',
      resource: 'CSS',
      size: totalCSS,
      threshold: BUDGETS.totalCSS * 1024,
      message: `CSS bundle ${Math.round(totalCSS / 1024)}KB exceeds threshold ${BUDGETS.totalCSS}KB`,
    });
  }

  if (totalImages > BUDGETS.totalImages * 1024) {
    issues.push({
      type: 'budget',
      resource: 'Images',
      size: totalImages,
      threshold: BUDGETS.totalImages * 1024,
      message: `Images ${Math.round(totalImages / 1024)}KB exceeds threshold ${BUDGETS.totalImages}KB`,
    });
  }

  if (totalSize > BUDGETS.totalSize * 1024) {
    issues.push({
      type: 'budget',
      resource: 'Total',
      size: totalSize,
      threshold: BUDGETS.totalSize * 1024,
      message: `Total page size ${Math.round(totalSize / 1024)}KB exceeds threshold ${BUDGETS.totalSize}KB`,
    });
  }

  return {
    passed: issues.length === 0,
    issues,
    metrics: {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
      lcp: audits['largest-contentful-paint']?.numericValue,
      fcp: audits['first-contentful-paint']?.numericValue,
      cls: audits['cumulative-layout-shift']?.numericValue,
      tbt: audits['total-blocking-time']?.numericValue,
      totalJS: Math.round(totalJS / 1024),
      totalCSS: Math.round(totalCSS / 1024),
      totalImages: Math.round(totalImages / 1024),
      totalSize: Math.round(totalSize / 1024),
    },
  };
}

/**
 * Generate performance report
 */
function generateReport(validation) {
  console.log('\n Lighthouse Performance Report');
  console.log('=================================\n');

  // Scores
  console.log(' Category Scores:');
  console.log(`   Performance: ${validation.metrics.performance}/100`);
  console.log(`   Accessibility: ${validation.metrics.accessibility}/100`);
  console.log(`   Best Practices: ${validation.metrics.bestPractices}/100`);
  console.log(`   SEO: ${validation.metrics.seo}/100`);

  // Core Web Vitals
  console.log('\n Core Web Vitals:');
  console.log(`   LCP: ${Math.round(validation.metrics.lcp)}ms`);
  console.log(`   FCP: ${Math.round(validation.metrics.fcp)}ms`);
  console.log(`   CLS: ${validation.metrics.cls}`);
  console.log(`   TBT: ${Math.round(validation.metrics.tbt)}ms`);

  // Resource sizes
  console.log('\n Resource Sizes:');
  console.log(`   JavaScript: ${validation.metrics.totalJS}KB`);
  console.log(`   CSS: ${validation.metrics.totalCSS}KB`);
  console.log(`   Images: ${validation.metrics.totalImages}KB`);
  console.log(`   Total: ${validation.metrics.totalSize}KB`);

  // Issues
  if (validation.passed) {
    console.log('\n All performance budgets met!');
  } else {
    console.log('\n Performance budget violations:');
    validation.issues.forEach((issue) => {
      console.log(`   • ${issue.message}`);
    });
  }

  return validation.passed;
}

/**
 * Main execution
 */
async function main() {
  const url = process.argv[2] || 'http://localhost:3000';

  console.log(`⌕ Running Lighthouse audit on ${url}...\n`);

  try {
    // Run Lighthouse
    await runLighthouse(url);

    // Parse and validate results
    const results = parseLighthouseResults();
    const validation = validateBudgets(results);

    // Generate report
    const passed = generateReport(validation);

    // Exit with appropriate code
    process.exit(passed ? 0 : 1);
  } catch (error) {
    console.error(' Lighthouse audit failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
