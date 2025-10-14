#!/usr/bin/env tsx
/**
 * Asset Validation Script
 * Scans all project assets and generates optimization report
 */

import { validateAssetDirectory, generateOptimizationReport } from '../lib/assets/asset-optimizer';
import * as path from 'path';
import * as fs from 'fs/promises';

const ASSET_DIRECTORIES = ['public/assets', 'public/season', 'public/sounds', 'public/models'];

async function main() {
  console.log('🌸 Otaku-mori Asset Validation Pipeline\n');
  console.log('Scanning project assets...\n');

  const allResults = new Map();

  for (const dir of ASSET_DIRECTORIES) {
    const fullPath = path.join(process.cwd(), dir);

    try {
      await fs.access(fullPath);
      console.log(`📁 Scanning ${dir}...`);
      const results = await validateAssetDirectory(fullPath);

      for (const [file, result] of results.entries()) {
        allResults.set(path.join(dir, file), result);
      }
    } catch {
      console.log(`⚠️  Directory ${dir} not found, skipping...`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 ASSET VALIDATION REPORT');
  console.log('='.repeat(80) + '\n');

  const report = generateOptimizationReport(allResults);

  // Summary
  console.log('Summary:');
  console.log(`  Total Assets: ${report.summary.totalAssets}`);
  console.log(`  ✅ Valid: ${report.summary.validAssets}`);
  console.log(`  ⚠️  Warnings: ${report.summary.assetsWithWarnings}`);
  console.log(`  ❌ Errors: ${report.summary.assetsWithErrors}`);
  console.log(`  💾 Total Size: ${(report.summary.totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(
    `  💰 Potential Savings: ${(report.summary.potentialSavings / 1024 / 1024).toFixed(2)}MB`,
  );

  // Detailed issues
  const errorAssets = report.details.filter((d) => d.status === 'error');
  const warningAssets = report.details.filter((d) => d.status === 'warning');

  if (errorAssets.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ ERRORS (Must Fix):');
    console.log('='.repeat(80));
    for (const asset of errorAssets) {
      console.log(`\n${asset.file}:`);
      for (const issue of asset.issues) {
        console.log(`  - ${issue}`);
      }
    }
  }

  if (warningAssets.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('⚠️  WARNINGS (Should Fix):');
    console.log('='.repeat(80));
    for (const asset of warningAssets.slice(0, 10)) {
      // Show first 10
      console.log(`\n${asset.file}:`);
      for (const issue of asset.issues) {
        console.log(`  - ${issue}`);
      }
    }
    if (warningAssets.length > 10) {
      console.log(`\n... and ${warningAssets.length - 10} more warnings`);
    }
  }

  // Optimization suggestions
  const assetsWithOptimizations = report.details.filter((d) => d.optimizations.length > 0);
  if (assetsWithOptimizations.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('💡 OPTIMIZATION SUGGESTIONS:');
    console.log('='.repeat(80));

    const optimizationCounts = new Map<string, number>();
    for (const asset of assetsWithOptimizations) {
      for (const opt of asset.optimizations) {
        optimizationCounts.set(opt, (optimizationCounts.get(opt) || 0) + 1);
      }
    }

    for (const [optimization, count] of Array.from(optimizationCounts.entries()).sort(
      (a, b) => b[1] - a[1],
    )) {
      console.log(`  • ${optimization} (${count} assets)`);
    }
  }

  // Exit with error if there are blocking issues
  if (report.summary.assetsWithErrors > 0) {
    console.log('\n❌ Asset validation failed. Fix errors above before deploying.\n');
    process.exit(1);
  } else if (report.summary.assetsWithWarnings > 0) {
    console.log('\n⚠️  Asset validation passed with warnings. Consider optimizing.\n');
    process.exit(0);
  } else {
    console.log('\n✅ All assets validated successfully!\n');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
