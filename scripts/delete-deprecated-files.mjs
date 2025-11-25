#!/usr/bin/env node
/**
 * Script to safely delete deprecated files
 * Run: node scripts/delete-deprecated-files.mjs --dry-run (preview)
 * Run: node scripts/delete-deprecated-files.mjs --execute (delete)
 * 
 * This script:
 * 1. Reads audit and import reports
 * 2. Only deletes files with verified replacements and no active imports
 * 3. Creates a deletion log
 */

import { readFileSync, unlinkSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPORT_DIR = join(process.cwd(), 'reports');
const AUDIT_REPORT = join(REPORT_DIR, 'deprecated-files-audit.json');
const IMPORTS_REPORT = join(REPORT_DIR, 'deprecated-imports-check.json');

if (!existsSync(AUDIT_REPORT)) {
  console.error('❌ Audit report not found. Run scripts/audit-deprecated-files.mjs first.');
  process.exit(1);
}

if (!existsSync(IMPORTS_REPORT)) {
  console.error('❌ Import check report not found. Run scripts/check-deprecated-imports.mjs first.');
  process.exit(1);
}

const auditReport = JSON.parse(readFileSync(AUDIT_REPORT, 'utf8'));
const importsReport = JSON.parse(readFileSync(IMPORTS_REPORT, 'utf8'));

// Get set of deprecated files that are imported
const importedDeprecatedFiles = new Set(
  importsReport.imports.map(imp => imp.deprecatedFile)
);

// Only delete files that:
// 1. Have verified replacements
// 2. Are not imported anywhere
const safeToDelete = auditReport.safeToDelete.filter(deprecated => {
  const isImported = importedDeprecatedFiles.has(deprecated.file);
  return !isImported;
});

console.log(`\n🗑️  Safe to Delete: ${safeToDelete.length} files\n`);

if (safeToDelete.length === 0) {
  console.log('✅ No files are safe to delete (all are either imported or need review)');
  process.exit(0);
}

// Create backup list
const deletionLog = {
  timestamp: new Date().toISOString(),
  deleted: [],
  errors: [],
  skipped: [],
};

// Delete files (DRY RUN by default)
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE - No files will be deleted\n');
  console.log('Files that would be deleted:\n');
  safeToDelete.forEach(({ file, replacement }) => {
    console.log(`  ❌ ${file}`);
    console.log(`     → Replaced by: ${replacement}\n`);
  });
  console.log(`\nRun with --execute to actually delete these ${safeToDelete.length} files`);
} else {
  console.log('⚠️  EXECUTING DELETIONS\n');
  let deleted = 0;
  let errors = 0;
  let skipped = 0;
  
  safeToDelete.forEach(({ file, replacement }) => {
    try {
      if (existsSync(file)) {
        unlinkSync(file);
        console.log(`✅ Deleted: ${file}`);
        deletionLog.deleted.push({
          file,
          replacement,
          deletedAt: new Date().toISOString(),
        });
        deleted++;
      } else {
        console.log(`⚠️  Not found (already deleted?): ${file}`);
        deletionLog.skipped.push({
          file,
          reason: 'File not found',
        });
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error deleting ${file}:`, error.message);
      deletionLog.errors.push({
        file,
        error: error.message,
      });
      errors++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Deleted: ${deleted}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  
  // Save deletion log
  const logPath = join(REPORT_DIR, 'deprecated-files-deletion-log.json');
  writeFileSync(logPath, JSON.stringify(deletionLog, null, 2));
  console.log(`\n📄 Deletion log saved to: ${logPath}`);
}

