#!/usr/bin/env node
/**
 * Script to audit all deprecated files in the codebase
 * Run: node scripts/audit-deprecated-files.mjs
 * 
 * This script:
 * 1. Scans for files with DEPRECATED comments
 * 2. Extracts replacement paths
 * 3. Verifies replacements exist
 * 4. Categorizes files as safe to delete or needs review
 */

import { readFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, extname, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEPRECATED_PATTERN = /DEPRECATED.*Use\s+([^\s]+)/i;
const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', '.cache', 'coverage'];
const REPORT_DIR = join(process.cwd(), 'reports');

// Ensure reports directory exists
if (!existsSync(REPORT_DIR)) {
  mkdirSync(REPORT_DIR, { recursive: true });
}

function findDeprecatedFiles(dir, fileList = []) {
  if (!existsSync(dir)) {
    return fileList;
  }

  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    
    try {
      const stat = statSync(filePath);
      
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findDeprecatedFiles(filePath, fileList);
      } else if (stat.isFile() && ['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(file))) {
        try {
          const content = readFileSync(filePath, 'utf8');
          const match = content.match(DEPRECATED_PATTERN);
          
          if (match) {
            const replacement = match[1].trim();
            const firstLine = content.split('\n').find(line => line.includes('DEPRECATED')) || '';
            fileList.push({
              file: filePath,
              replacement: replacement,
              firstLine: firstLine.trim(),
            });
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }
    } catch (e) {
      // Skip files/dirs that can't be accessed
    }
  });
  
  return fileList;
}

function verifyReplacement(filePath, replacementPath) {
  // Normalize paths
  const normalizedReplacement = replacementPath.replace(/\\/g, '/');
  
  // Check if replacement exists as absolute path
  if (existsSync(normalizedReplacement)) {
    return { exists: true, path: normalizedReplacement };
  }
  
  // Try relative path from deprecated file
  const dir = dirname(filePath);
  const relativePath = join(dir, normalizedReplacement);
  if (existsSync(relativePath)) {
    return { exists: true, path: relativePath };
  }
  
  // Try from app root
  const rootPath = resolve(process.cwd(), normalizedReplacement);
  if (existsSync(rootPath)) {
    return { exists: true, path: rootPath };
  }
  
  // Try from project root
  const projectRoot = resolve(process.cwd());
  const projectPath = join(projectRoot, normalizedReplacement);
  if (existsSync(projectPath)) {
    return { exists: true, path: projectPath };
  }
  
  return { exists: false, attempted: [normalizedReplacement, relativePath, rootPath, projectPath] };
}

// Main execution
console.log('🔍 Scanning for deprecated files...\n');

const deprecatedFiles = findDeprecatedFiles('./app');
const deprecatedComponents = findDeprecatedFiles('./components');
const deprecatedLib = findDeprecatedFiles('./lib');
const allDeprecated = [...deprecatedFiles, ...deprecatedComponents, ...deprecatedLib];

console.log(`Found ${allDeprecated.length} files with DEPRECATED comments\n`);

// Verify replacements
console.log('🔎 Verifying replacements...\n');
const verified = allDeprecated.map(item => {
  const verification = verifyReplacement(item.file, item.replacement);
  return {
    ...item,
    replacementExists: verification.exists,
    replacementPath: verification.path || verification.attempted,
  };
});

// Categorize
const safeToDelete = verified.filter(f => f.replacementExists);
const needsReview = verified.filter(f => !f.replacementExists);
const suspicious = verified.filter(f => 
  f.replacement.includes('stripe/route.ts') && 
  !f.file.includes('stripe') ||
  f.replacement.includes('sign-in') && 
  !f.file.includes('sign-in')
);

// Generate report
const report = {
  summary: {
    total: allDeprecated.length,
    safeToDelete: safeToDelete.length,
    needsReview: needsReview.length,
    suspicious: suspicious.length,
    timestamp: new Date().toISOString(),
  },
  safeToDelete: safeToDelete.map(f => ({
    file: f.file,
    replacement: f.replacementPath,
    originalReplacement: f.replacement,
  })),
  needsReview: needsReview.map(f => ({
    file: f.file,
    claimedReplacement: f.replacement,
    attemptedPaths: f.replacementPath,
    firstLine: f.firstLine,
  })),
  suspicious: suspicious.map(f => ({
    file: f.file,
    replacement: f.replacement,
    note: 'Replacement path seems incorrect - verify manually',
    firstLine: f.firstLine,
  })),
};

const reportPath = join(REPORT_DIR, 'deprecated-files-audit.json');
const fs = await import('fs');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('📊 Deprecated Files Audit Report');
console.log('================================');
console.log(`Total deprecated files: ${report.summary.total}`);
console.log(`✅ Safe to delete: ${report.summary.safeToDelete}`);
console.log(`⚠️  Needs review: ${report.summary.needsReview}`);
console.log(`🔍 Suspicious replacements: ${report.summary.suspicious}`);
console.log(`\n📄 Full report saved to: ${reportPath}\n`);

if (suspicious.length > 0) {
  console.log('⚠️  Suspicious replacements found:');
  suspicious.forEach(f => {
    console.log(`  ${f.file}`);
    console.log(`    Claims: ${f.replacement}`);
    console.log(`    Note: ${f.note}\n`);
  });
}

