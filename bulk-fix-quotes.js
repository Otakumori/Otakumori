#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.nyc_output'];
const BACKUP_DIR = './backup-before-quote-fix';

// Patterns to fix (in order of specificity)
const PATTERNS = [
  // Most specific patterns first
  { from: /\{\"'\} /g, to: "'", name: 'corrupted single quotes with space' },
  { from: /\{\"'\}/g, to: "'", name: 'corrupted single quotes without space' },
  { from: /\{\"\}/g, to: '"', name: 'corrupted double quotes' },
  { from: /\{\"'\}"/g, to: "'", name: 'corrupted single quotes with trailing quote' },
];

// Create backup directory
function createBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
  }
}

// Get all files recursively
function getAllFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(file) && !file.startsWith('.')) {
          getAllFiles(filePath, fileList);
        }
      } else {
        const ext = path.extname(file);
        if (EXTENSIONS.includes(ext)) {
          fileList.push(filePath);
        }
      }
    });
  } catch (error) {
    console.warn(`⚠️  Warning: Could not read directory ${dir}: ${error.message}`);
  }

  return fileList;
}

// Backup a single file
function backupFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  const backupDir = path.dirname(backupPath);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  fs.copyFileSync(filePath, backupPath);
}

// Fix quotes in a single file
function fixQuotesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    let changesMade = false;

    // Apply each pattern
    PATTERNS.forEach((pattern) => {
      const before = fixedContent;
      fixedContent = fixedContent.replace(pattern.from, pattern.to);
      if (before !== fixedContent) {
        changesMade = true;
        console.log(`  🔧 Applied pattern: ${pattern.name}`);
      }
    });

    if (changesMade) {
      // Create backup before modifying
      backupFile(filePath);

      // Write the fixed content
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🚀 Starting bulk quote fix process...\n');

  // Create backup
  createBackup();

  // Get all files
  console.log('📁 Scanning for files...');
  const files = getAllFiles('.');
  console.log(`📊 Found ${files.length} files to process\n`);

  if (files.length === 0) {
    console.log('⚠️  No files found to process.');
    return;
  }

  // Process files
  let fixedCount = 0;
  let errorCount = 0;

  files.forEach((file, index) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`[${index + 1}/${files.length}] Processing: ${relativePath}`);

    try {
      if (fixQuotesInFile(file)) {
        fixedCount++;
        console.log(`  ✅ Fixed quotes in: ${relativePath}`);
      } else {
        console.log(`  ⏭️  No changes needed: ${relativePath}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error: ${error.message}`);
    }

    console.log(''); // Empty line for readability
  });

  // Summary
  console.log('📋 SUMMARY');
  console.log('='.repeat(50));
  console.log(`📁 Files processed: ${files.length}`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`💾 Backup created in: ${BACKUP_DIR}`);

  if (fixedCount > 0) {
    console.log('\n🎉 Quote fix completed successfully!');
    console.log('💡 Next steps:');
    console.log('   1. Run: npm run typecheck');
    console.log('   2. Run: npm run lint');
    console.log('   3. Run: npm run build');
  } else {
    console.log('\n⚠️  No files were modified. The corruption pattern might be different.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixQuotesInFile, getAllFiles, PATTERNS };
