#!/usr/bin/env node
/**
 * Script to fix incorrect DEPRECATED comments
 * Run: node scripts/fix-incorrect-deprecated-comments.mjs --dry-run (preview)
 * Run: node scripts/fix-incorrect-deprecated-comments.mjs --execute (fix)
 * 
 * This script:
 * 1. Identifies files with suspicious DEPRECATED comments
 * 2. Removes incorrect DEPRECATED comments
 * 3. Creates a report of changes
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEPRECATED_PATTERN = /^\/\/\s*DEPRECATED.*$/m;
const SUSPICIOUS_PATTERNS = [
  /DEPRECATED.*stripe\/route\.ts/i,
  /DEPRECATED.*sign-in.*page\.tsx/i,
];

// Files that should NOT have DEPRECATED comments (they're active)
const ACTIVE_FILES = [
  'app/orders/page.tsx',
  'app/thank-you/page.tsx',
  'app/wishlist/page.tsx',
  'app/api/admin/backup/route.ts',
  'app/api/admin/blog/route.ts',
  'app/api/admin/dashboard/route.ts',
  'app/api/account/display-name/route.ts',
];

function findFilesWithDeprecated(dir, fileList = []) {
  if (!existsSync(dir)) {
    return fileList;
  }

  const files = readdirSync(dir);
  const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', '.cache', 'coverage', 'reports'];
  
  files.forEach(file => {
    const filePath = join(dir, file);
    
    try {
      const stat = statSync(filePath);
      
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findFilesWithDeprecated(filePath, fileList);
      } else if (stat.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(extname(file))) {
        try {
          const content = readFileSync(filePath, 'utf8');
          const match = content.match(DEPRECATED_PATTERN);
          
          if (match) {
            // Check if it's suspicious
            const isSuspicious = SUSPICIOUS_PATTERNS.some(pattern => 
              match[0].match(pattern)
            );
            
            // Check if it's in the active files list
            const normalizedPath = filePath.replace(/\\/g, '/');
            const isActive = ACTIVE_FILES.some(active => 
              normalizedPath.includes(active)
            );
            
            if (isSuspicious || isActive) {
              fileList.push({
                file: filePath,
                deprecatedLine: match[0],
                isSuspicious,
                isActive,
              });
            }
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

// Main execution
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

console.log('🔍 Scanning for incorrect DEPRECATED comments...\n');

const filesToFix = findFilesWithDeprecated('./app');
const componentsToFix = findFilesWithDeprecated('./components');

const allFilesToFix = [...filesToFix, ...componentsToFix];

console.log(`Found ${allFilesToFix.length} files with suspicious/incorrect DEPRECATED comments\n`);

if (allFilesToFix.length === 0) {
  console.log('✅ No files need fixing');
  process.exit(0);
}

const changes = [];

if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
  allFilesToFix.forEach(({ file, deprecatedLine, isSuspicious, isActive }) => {
    console.log(`📄 ${file}`);
    console.log(`   Current: ${deprecatedLine}`);
    console.log(`   Reason: ${isActive ? 'Active file' : 'Suspicious replacement'}\n`);
    changes.push({
      file,
      action: 'remove',
      deprecatedLine,
      reason: isActive ? 'Active file' : 'Suspicious replacement',
    });
  });
  console.log(`\nRun with --execute to remove these ${allFilesToFix.length} DEPRECATED comments`);
} else {
  console.log('⚠️  EXECUTING FIXES\n');
  let fixed = 0;
  let errors = 0;
  
  allFilesToFix.forEach(({ file, deprecatedLine, isSuspicious, isActive }) => {
    try {
      let content = readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Remove the DEPRECATED comment line
      content = content.replace(DEPRECATED_PATTERN, '');
      
      // Remove trailing empty line if created
      content = content.replace(/^\n\n/, '\n');
      
      if (content !== originalContent) {
        writeFileSync(file, content);
        console.log(`✅ Fixed: ${file}`);
        fixed++;
        changes.push({
          file,
          action: 'removed',
          deprecatedLine,
          reason: isActive ? 'Active file' : 'Suspicious replacement',
        });
      }
    } catch (error) {
      console.error(`❌ Error fixing ${file}:`, error.message);
      errors++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Fixed: ${fixed}`);
  console.log(`   ❌ Errors: ${errors}`);
  
  // Save change log
  const logPath = join(process.cwd(), 'reports', 'deprecated-comments-fix-log.json');
  const fs = await import('fs');
  if (!existsSync(join(process.cwd(), 'reports'))) {
    fs.mkdirSync(join(process.cwd(), 'reports'), { recursive: true });
  }
  fs.writeFileSync(logPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    changes,
  }, null, 2));
  console.log(`\n📄 Change log saved to: ${logPath}`);
}

