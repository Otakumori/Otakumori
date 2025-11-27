#!/usr/bin/env node

/**
 * Master script: Run all fixes and verifications
 * 
 * This script:
 * 1. Fixes console.log statements
 * 2. Adds metadata to pages
 * 3. Fixes accessibility issues
 * 4. Standardizes loading/empty states
 * 5. Verifies everything still works
 * 
 * Usage:
 *   node scripts/fix-and-verify-all.mjs --dry-run  # Preview changes
 *   node scripts/fix-and-verify-all.mjs --execute  # Apply all fixes
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');
const EXECUTE = process.argv.includes('--execute');

if (!DRY_RUN && !EXECUTE) {
  console.error('❌ Please specify --dry-run or --execute');
  process.exit(1);
}

const mode = DRY_RUN ? 'DRY RUN' : 'EXECUTE';
console.log(`\n🔧 Production Readiness Fix & Verify Script`);
console.log(`==========================================`);
console.log(`Mode: ${mode}\n`);

const results = {
  consoleLogs: { success: false, error: null },
  metadata: { success: false, error: null },
  accessibility: { success: false, error: null },
  loadingStates: { success: false, error: null },
  typecheck: { success: false, error: null },
  lint: { success: false, error: null },
  build: { success: false, error: null },
};

function runScript(scriptName, description) {
  console.log(`\n📝 ${description}...`);
  try {
    const flag = DRY_RUN ? '--dry-run' : '--execute';
    const output = execSync(`node ${scriptName} ${flag}`, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: join(__dirname, '..'),
    });
    console.log(`✅ ${description} completed`);
    if (output) {
      // Show summary if available
      const lines = output.split('\n');
      const summary = lines.filter(
        (line) =>
          line.includes('✅') ||
          line.includes('❌') ||
          line.includes('Found') ||
          line.includes('Fixed') ||
          line.includes('Updated'),
      );
      if (summary.length > 0) {
        console.log('   Summary:');
        summary.slice(0, 5).forEach((line) => console.log(`   ${line}`));
      }
    }
    return { success: true, error: null };
  } catch (error) {
    console.error(`❌ ${description} failed`);
    const errorMsg = error.message || String(error);
    console.error(`   Error: ${errorMsg.split('\n')[0]}`);
    return { success: false, error: errorMsg };
  }
}

function runCommand(command, description) {
  console.log(`\n🔍 ${description}...`);
  try {
    execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: join(__dirname, '..'),
    });
    console.log(`✅ ${description} passed`);
    return { success: true, error: null };
  } catch (error) {
    console.error(`❌ ${description} failed`);
    const errorMsg = error.message || String(error);
    // Extract relevant error lines
    const lines = errorMsg.split('\n');
    const relevant = lines.filter(
      (line) =>
        line.includes('error') ||
        line.includes('Error') ||
        line.includes('Failed') ||
        line.trim().startsWith('✖'),
    );
    if (relevant.length > 0) {
      console.error(`   ${relevant[0]}`);
    }
    return { success: false, error: errorMsg };
  }
}

// Phase 1: Run all fix scripts
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('PHASE 1: Running Fix Scripts');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

results.consoleLogs = runScript(
  'scripts/fix-console-logs.mjs',
  'Fixing console.log statements',
);

results.metadata = runScript('scripts/add-metadata.mjs', 'Adding metadata to pages');

results.accessibility = runScript(
  'scripts/fix-all-accessibility-warnings.mjs',
  'Fixing accessibility issues',
);

results.loadingStates = runScript(
  'scripts/standardize-loading-states.mjs',
  'Standardizing loading/empty states',
);

// Phase 2: Verification (only if executing)
if (EXECUTE) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PHASE 2: Verification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  results.typecheck = runCommand('npm run typecheck', 'TypeScript type checking');

  results.lint = runCommand('npm run lint', 'ESLint checking');

  // Only run build if typecheck and lint pass
  if (results.typecheck.success && results.lint.success) {
    results.build = runCommand('npm run build', 'Production build');
  } else {
    console.log('\n⚠️  Skipping build - fix typecheck/lint errors first');
    results.build = { success: false, error: 'Skipped due to previous errors' };
  }
} else {
  console.log('\n⚠️  Skipping verification (dry-run mode)');
  console.log('   Run with --execute to verify after fixes');
}

// Final Report
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('FINAL REPORT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const allFixes = [
  { name: 'Console.log cleanup', result: results.consoleLogs },
  { name: 'Metadata/SEO', result: results.metadata },
  { name: 'Accessibility fixes', result: results.accessibility },
  { name: 'Loading states', result: results.loadingStates },
];

const allVerifications = [
  { name: 'TypeScript check', result: results.typecheck },
  { name: 'ESLint check', result: results.lint },
  { name: 'Build check', result: results.build },
];

console.log('Fix Scripts:');
allFixes.forEach(({ name, result }) => {
  const icon = result.success ? '✅' : '❌';
  console.log(`  ${icon} ${name}`);
  if (!result.success && result.error) {
    console.log(`     ${result.error.split('\n')[0]}`);
  }
});

if (EXECUTE) {
  console.log('\nVerification:');
  allVerifications.forEach(({ name, result }) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`  ${icon} ${name}`);
    if (!result.success && result.error && !result.error.includes('Skipped')) {
      console.log(`     ${result.error.split('\n')[0]}`);
    }
  });
}

const fixesPassed = allFixes.every((f) => f.result.success);
const verificationsPassed = EXECUTE
  ? allVerifications.every((v) => v.result.success)
  : true;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (DRY_RUN) {
  console.log('✅ Dry run completed - review changes above');
  console.log('   Run with --execute to apply fixes');
} else if (fixesPassed && verificationsPassed) {
  console.log('✅ ALL CHECKS PASSED - Production Ready!');
  console.log('\nNext steps:');
  console.log('  1. Review the changes made');
  console.log('  2. Test manually in browser');
  console.log('  3. Run: npm run test:e2e:smoke');
  console.log('  4. Deploy when ready');
} else {
  console.log('⚠️  SOME CHECKS FAILED');
  console.log('\nPlease fix the errors above before deploying.');
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

