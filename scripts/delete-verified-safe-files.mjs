#!/usr/bin/env node
/**
 * Delete only replacements verified as safe by replacement-verification.json
 *
 * Usage:
 *   node scripts/delete-verified-safe-files.mjs --dry-run   # preview
 *   node scripts/delete-verified-safe-files.mjs --execute   # actually delete
 */

import { readFileSync, existsSync, unlinkSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPORT_DIR = join(process.cwd(), 'reports');
const VERIFICATION_REPORT = join(REPORT_DIR, 'replacement-verification.json');

if (!existsSync(VERIFICATION_REPORT)) {
  console.error('❌ replacement-verification.json not found. Run scripts/verify-replacements.mjs first.');
  process.exit(1);
}

const verification = JSON.parse(readFileSync(VERIFICATION_REPORT, 'utf8'));

if (!verification.safe || !Array.isArray(verification.safe)) {
  console.error('❌ Invalid verification report format. Expected `safe` array.');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

// Only consider files explicitly marked safe AND whose deprecated file still exists on disk
const candidates = verification.safe.filter((entry) => {
  const file = entry.deprecatedFile;
  return entry.safe === true && file && existsSync(file);
});

if (candidates.length === 0) {
  console.log('✅ No verified-safe deprecated files found to delete.');
  process.exit(0);
}

console.log(`\n🗑️  Verified-safe files to delete: ${candidates.length}\n`);

if (DRY_RUN) {
  console.log('🔍 DRY RUN - no files will be deleted.\n');
  candidates.forEach(({ deprecatedFile, replacementFile }) => {
    console.log(`  ❌ ${deprecatedFile}`);
    console.log(`     → Replacement: ${replacementFile}`);
  });
  console.log('\nRun with --execute to actually delete these files.');
  process.exit(0);
}

// EXECUTION
const deleted = [];
const errors = [];

console.log('⚠️  EXECUTING VERIFIED-SAFE DELETIONS\n');

for (const { deprecatedFile, replacementFile } of candidates) {
  try {
    if (existsSync(deprecatedFile)) {
      unlinkSync(deprecatedFile);
      console.log(`✅ Deleted: ${deprecatedFile}`);
      deleted.push({ file: deprecatedFile, replacement: replacementFile });
    } else {
      console.log(`⚠️  Skipped (not found): ${deprecatedFile}`);
    }
  } catch (err) {
    console.error(`❌ Error deleting ${deprecatedFile}:`, err.message);
    errors.push({ file: deprecatedFile, error: err.message });
  }
}

const log = {
  timestamp: new Date().toISOString(),
  deleted,
  errors,
};

const logPath = join(REPORT_DIR, 'verified-safe-deletion-log.json');
writeFileSync(logPath, JSON.stringify(log, null, 2));

console.log('\n📊 Deletion summary:');
console.log(`   ✅ Deleted: ${deleted.length}`);
console.log(`   ❌ Errors: ${errors.length}`);
console.log(`\n📄 Log written to: ${logPath}`);

{
  "cells": [],
  "metadata": {
    "language_info": {
      "name": "python"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 2
}