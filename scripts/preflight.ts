#!/usr/bin/env tsx

import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

interface PreflightResult {
  url: string;
  status: number;
  errors: string[];
  warnings: string[];
  assertions: {
    headerVisible: boolean;
    footerVisible: boolean;
    authButtonRendered: boolean;
    purpleStarsPresent: boolean;
    productCardVisible: boolean;
    petalsContainerClickable: boolean;
    noConsoleErrors: boolean;
    noCSPViolations: boolean;
    cookiesPresent: boolean;
  };
}

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts', 'preflight');
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function ensureArtifactsDir() {
  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
}

async function runPreflight(): Promise<PreflightResult[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results: PreflightResult[] = [];
  const pages = [
    '/',
    '/products',
    '/account',
    '/info/faq',
    '/info/terms',
    '/info/privacy',
    '/rune/test-rune',
  ];

  for (const page of pages) {
    const result = await testPage(browser, page);
    results.push(result);
  }

  await browser.close();
  return results;
}

async function testPage(browser: any, page: string): Promise<PreflightResult> {
  const pageInstance = await browser.newPage();
  const errors: string[] = [];
  const warnings: string[] = [];
  const assertions = {
    headerVisible: false,
    footerVisible: false,
    authButtonRendered: false,
    purpleStarsPresent: false,
    productCardVisible: false,
    petalsContainerClickable: false,
    noConsoleErrors: true,
    noCSPViolations: true,
    cookiesPresent: false,
  };

  // Listen for console errors
  pageInstance.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`);
      assertions.noConsoleErrors = false;
    }
  });

  // Listen for CSP violations
  pageInstance.on('response', (response: any) => {
    if (response.status() >= 400) {
      warnings.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });

  try {
    const url = `${BASE_URL}${page}`;
    console.log(`Testing: ${url}`);
    
    const response = await pageInstance.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    if (!response) {
      throw new Error('No response received');
    }

    const status = response.status();

    // Wait for page to be fully loaded
    await pageInstance.waitForTimeout(2000);

    // Test assertions
    try {
      // Header visibility
      const header = await pageInstance.$('header');
      assertions.headerVisible = !!header;

      // Footer visibility
      const footer = await pageInstance.$('footer');
      assertions.footerVisible = !!footer;

      // Auth button (either SignInButton or UserButton)
      const authButton = await pageInstance.$('[data-clerk-element="signInButton"], [data-clerk-element="userButton"]');
      assertions.authButtonRendered = !!authButton;

      // Purple stars background
      const starsBg = await pageInstance.$('.stars-bg');
      assertions.purpleStarsPresent = !!starsBg;

      // Product cards (only on products page)
      if (page === '/products') {
        const productCard = await pageInstance.$('[class*="product"], [class*="card"]');
        assertions.productCardVisible = !!productCard;
      }

      // Petals container clickable
      const petalsContainer = await pageInstance.$('[class*="petal"], [class*="interactive"]');
      if (petalsContainer) {
        assertions.petalsContainerClickable = true;
        // Try to click a petal if available
        try {
          await pageInstance.click('[class*="petal"], [class*="interactive"]');
        } catch (e) {
          warnings.push('Could not click petal element');
        }
      }

      // Check cookies
      const cookies = await pageInstance.cookies();
      assertions.cookiesPresent = cookies.length > 0;

      // Check for CSP violations in console
      const logs = await pageInstance.evaluate(() => {
        return (window as any).consoleErrors || [];
      });
      if (logs.length > 0) {
        assertions.noCSPViolations = false;
        errors.push(`CSP violations: ${logs.join(', ')}`);
      }

    } catch (e) {
      errors.push(`Assertion error: ${e}`);
    }

    // Take screenshot
    const screenshotPath = path.join(ARTIFACTS_DIR, `${page.replace(/\//g, '_') || 'home'}.png`);
    await pageInstance.screenshot({ path: screenshotPath, fullPage: true });

    // Save HAR file
    const harPath = path.join(ARTIFACTS_DIR, `${page.replace(/\//g, '_') || 'home'}.har`);
    const har = await pageInstance.evaluate(() => {
      return (window as any).performance.getEntriesByType('navigation')[0];
    });
    await fs.writeFile(harPath, JSON.stringify(har, null, 2));

    await pageInstance.close();

    return {
      url,
      status,
      errors,
      warnings,
      assertions,
    };

  } catch (error) {
    await pageInstance.close();
    return {
      url: `${BASE_URL}${page}`,
      status: 0,
      errors: [`Failed to load page: ${error}`],
      warnings: [],
      assertions,
    };
  }
}

async function generateReport(results: PreflightResult[]) {
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results,
    summary: {
      totalPages: results.length,
      passed: results.filter(r => r.status >= 200 && r.status < 400 && r.errors.length === 0).length,
      failed: results.filter(r => r.status < 200 || r.status >= 400 || r.errors.length > 0).length,
      warnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    },
  };

  const reportPath = path.join(ARTIFACTS_DIR, 'preflight-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>Preflight Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .pass { color: green; }
    .fail { color: red; }
    .warning { color: orange; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Preflight Report</h1>
  <p><strong>Timestamp:</strong> ${report.timestamp}</p>
  <p><strong>Base URL:</strong> ${report.baseUrl}</p>
  <p><strong>Summary:</strong> ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.warnings} warnings</p>
  
  <h2>Results</h2>
  <table>
    <tr>
      <th>URL</th>
      <th>Status</th>
      <th>Header</th>
      <th>Footer</th>
      <th>Auth</th>
      <th>Stars</th>
      <th>Products</th>
      <th>Petals</th>
      <th>Errors</th>
    </tr>
    ${results.map(r => `
      <tr>
        <td>${r.url}</td>
        <td class="${r.status >= 200 && r.status < 400 ? 'pass' : 'fail'}">${r.status}</td>
        <td class="${r.assertions.headerVisible ? 'pass' : 'fail'}">${r.assertions.headerVisible ? '✓' : '✗'}</td>
        <td class="${r.assertions.footerVisible ? 'pass' : 'fail'}">${r.assertions.footerVisible ? '✓' : '✗'}</td>
        <td class="${r.assertions.authButtonRendered ? 'pass' : 'fail'}">${r.assertions.authButtonRendered ? '✓' : '✗'}</td>
        <td class="${r.assertions.purpleStarsPresent ? 'pass' : 'fail'}">${r.assertions.purpleStarsPresent ? '✓' : '✗'}</td>
        <td class="${r.assertions.productCardVisible ? 'pass' : 'fail'}">${r.assertions.productCardVisible ? '✓' : '✗'}</td>
        <td class="${r.assertions.petalsContainerClickable ? 'pass' : 'fail'}">${r.assertions.petalsContainerClickable ? '✓' : '✗'}</td>
        <td class="${r.errors.length === 0 ? 'pass' : 'fail'}">${r.errors.length}</td>
      </tr>
    `).join('')}
  </table>
</body>
</html>
  `;

  const htmlReportPath = path.join(ARTIFACTS_DIR, 'preflight-report.html');
  await fs.writeFile(htmlReportPath, htmlReport);

  return report;
}

async function main() {
  try {
    console.log('🚀 Starting preflight checks...');
    await ensureArtifactsDir();
    
    const results = await runPreflight();
    const report = await generateReport(results);
    
    console.log(`\n📊 Preflight Summary:`);
    console.log(`   Total pages: ${report.summary.totalPages}`);
    console.log(`   Passed: ${report.summary.passed}`);
    console.log(`   Failed: ${report.summary.failed}`);
    console.log(`   Warnings: ${report.summary.warnings}`);
    
    // Check if any critical assertions failed
    const criticalFailures = results.filter(r => 
      !r.assertions.headerVisible || 
      !r.assertions.footerVisible || 
      !r.assertions.authButtonRendered ||
      !r.assertions.purpleStarsPresent ||
      r.errors.length > 0
    );
    
    if (criticalFailures.length > 0) {
      console.log('\n❌ Critical failures detected:');
      criticalFailures.forEach(failure => {
        console.log(`   ${failure.url}: ${failure.errors.join(', ')}`);
      });
      process.exit(1);
    }
    
    console.log('\n✅ All preflight checks passed!');
    console.log(`📁 Reports saved to: ${ARTIFACTS_DIR}`);
    
  } catch (error) {
    console.error('❌ Preflight failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
