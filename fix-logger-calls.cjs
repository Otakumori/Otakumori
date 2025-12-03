#!/usr/bin/env node
/**
 * Fix logger calls to match correct TypeScript signatures
 * 
 * Fixes patterns:
 * 1. logger.error('msg', error) → logger.error('msg', undefined, undefined, error instanceof Error ? error : new Error(String(error)))
 * 2. logger.warn('msg', 'string') → logger.warn('msg', undefined, { value: 'string' })
 * 3. logger.warn('msg', variable) → logger.warn('msg', undefined, { value: variable })
 * 4. logger.warn('msg', { ... }) → logger.warn('msg', undefined, { ... })
 * 5. logger.error('msg', { ... }) → logger.error('msg', undefined, { ... }, undefined)
 * 6. logger.error('msg', zodError.error) → logger.error('msg', undefined, { error: zodError.error }, undefined)
 * 7. logger.error('msg', number, string) → logger.error('msg', undefined, { status: number, text: string }, undefined)
 * 8. logger.error('msg', 'string') → logger.error('msg', undefined, { value: 'string' }, undefined)
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-d');
const BACKUP_DIR = '.backup-logger-fixes-js';

// Directories to scan - scan entire app directory
const SCAN_DIRS = [
  'app',
];

function findTsFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function fixLoggerCalls(content) {
  let fixed = content;
  let replacements = 0;
  
  // Pattern 1: logger.error('msg', error) → logger.error('msg', undefined, undefined, error instanceof Error ? error : new Error(String(error)))
  // Also handle logger.error('msg', Error) where Error is a type
  // Handle both single quotes and template literals
  // Match any word character sequence (including error, err, unknown, etc.)
  const pattern1 = /logger\.error\((`[^`]*`|'[^']*'),\s*(\w+)\);/g;
  fixed = fixed.replace(pattern1, (match, msg, errorVar) => {
    // Skip if already fixed
    if (match.includes('undefined,') || match.includes('instanceof Error')) {
      return match;
    }
    // Skip if it's Error type (will be handled by pattern 1b)
    if (errorVar === 'Error') {
      return match;
    }
    replacements++;
    let cleanMsg = msg;
    if (!msg.startsWith('`')) {
      cleanMsg = msg.trim();
    }
    return `logger.error(${cleanMsg}, undefined, undefined, ${errorVar} instanceof Error ? ${errorVar} : new Error(String(${errorVar})));`;
  });
  
  // Pattern 1c: logger.error('msg', unknown) → logger.error('msg', undefined, undefined, unknown instanceof Error ? unknown : new Error(String(unknown)))
  // This is handled by pattern1, but we keep it as a specific check for unknown
  // Actually, pattern1 should catch this, but let's make sure unknown is explicitly handled
  
  // Pattern 1b: logger.error('msg', Error) → logger.error('msg', undefined, undefined, Error)
  const pattern1b = /logger\.error\('([^']*)',\s*Error\);/g;
  fixed = fixed.replace(pattern1b, (match, msg) => {
    if (match.includes('undefined,')) {
      return match;
    }
    replacements++;
    const trimmedMsg = msg.trim();
    return `logger.error('${trimmedMsg}', undefined, undefined, Error);`;
  });
  
  // Pattern 2: logger.warn('msg', 'string') → logger.warn('msg', undefined, { value: 'string' })
  const pattern2 = /logger\.warn\('([^']+)',\s*'([^']+)'\);/g;
  fixed = fixed.replace(pattern2, (match, msg, str) => {
    if (match.includes('undefined,')) {
      return match;
    }
    replacements++;
    return `logger.warn('${msg}', undefined, { value: '${str}' });`;
  });
  
  // Pattern 3a: logger.warn('msg', error/unknown) → logger.warn('msg', undefined, { error: error })
  // Warn doesn't take error as 4th param, so wrap in data
  // Handle both single quotes and template literals
  // Must come BEFORE pattern 3 to catch error/unknown first
  const pattern3a = /logger\.warn\((`[^`]*`|'[^']*'),\s*(error|err|unknown)\);/g;
  fixed = fixed.replace(pattern3a, (match, msg, errorVar) => {
    if (match.includes('undefined,')) {
      return match;
    }
    replacements++;
    let cleanMsg = msg;
    if (!msg.startsWith('`')) {
      cleanMsg = msg.trim();
    }
    return `logger.warn(${cleanMsg}, undefined, { ${errorVar}: ${errorVar} instanceof Error ? ${errorVar} : new Error(String(${errorVar})) });`;
  });
  
  // Pattern 3b: logger.warn('msg', complex expression) → logger.warn('msg', undefined, { value: expr })
  // Handle expressions like user?.id || 'anonymous', Object.keys(), etc.
  // Only match if it's NOT a simple variable (those are handled by pattern 3a)
  // Match expressions with operators, method calls, optional chaining
  const pattern3b = /logger\.warn\((`[^`]*`|'[^']*'),\s*([a-zA-Z_$][a-zA-Z0-9_$.()[\]]*(?:\?\.|\.|\(|\[|\|\||&&|\?)[^)]+)\);/g;
  fixed = fixed.replace(pattern3b, (match, msg, expr) => {
    if (match.includes('undefined,')) {
      return match;
    }
    // Skip if it's already an object literal (handled by pattern 4)
    if (expr.trim().startsWith('{')) {
      return match;
    }
    // Skip if it contains instanceof (already processed)
    if (expr.includes('instanceof')) {
      return match;
    }
    replacements++;
    let cleanMsg = msg;
    if (!msg.startsWith('`')) {
      cleanMsg = msg.trim();
    }
    return `logger.warn(${cleanMsg}, undefined, { value: ${expr} });`;
  });
  
  // Pattern 3: logger.warn('msg', variable) → logger.warn('msg', undefined, { value: variable })
  // This is now handled by pattern 3b which is more comprehensive
  
  // Pattern 4: logger.warn('msg', { ... }) → logger.warn('msg', undefined, { ... })
  // Handle multiline objects with dotall flag - need to match nested braces
  // Also handle template literals in messages
  const pattern4 = /logger\.warn\((`[^`]*`|'[^']*'),\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\})\);/gs;
  fixed = fixed.replace(pattern4, (match, msg, obj) => {
    if (match.includes('undefined,')) {
      return match;
    }
    replacements++;
    return `logger.warn(${msg}, undefined, ${obj});`;
  });
  
  // Pattern 5: logger.error('msg', { ... }) → logger.error('msg', undefined, { ... }, undefined)
  // Handle nested braces and template literals
  const pattern5 = /logger\.error\((`[^`]*`|'[^']*'),\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\})\);/gs;
  fixed = fixed.replace(pattern5, (match, msg, obj) => {
    if (match.includes('undefined,')) {
      return match;
    }
    replacements++;
    return `logger.error(${msg}, undefined, ${obj}, undefined);`;
  });
  
  // Pattern 6: logger.error('msg', zodError.error) → logger.error('msg', undefined, { error: zodError.error }, undefined)
  const pattern6 = /logger\.error\('([^']+)',\s*([a-zA-Z_$][a-zA-Z0-9_$.]*\.error)\);/g;
  fixed = fixed.replace(pattern6, (match, msg, errorVar) => {
    if (match.includes('undefined,')) {
      return match;
    }
    replacements++;
    return `logger.error('${msg}', undefined, { error: ${errorVar} }, undefined);`;
  });
  
  // Pattern 7: logger.error('msg', number, string) → logger.error('msg', undefined, { status: number, text: string }, undefined)
  // Handle messages with leading/trailing spaces
  const pattern7 = /logger\.error\('([^']*)',\s*(\d+),\s*([^)]+)\);/g;
  fixed = fixed.replace(pattern7, (match, msg, num, str) => {
    if (match.includes('undefined,')) {
      return match;
    }
    replacements++;
    const trimmedStr = str.trim();
    const trimmedMsg = msg.trim();
    return `logger.error('${trimmedMsg}', undefined, { status: ${num}, text: ${trimmedStr} }, undefined);`;
  });
  
  // Pattern 9: logger.error('msg', error, errorInfo) → logger.error('msg', undefined, { errorInfo }, error)
  const pattern9 = /logger\.error\('([^']*)',\s*(\w+),\s*(\w+)\);/g;
  fixed = fixed.replace(pattern9, (match, msg, errorVar, infoVar) => {
    if (match.includes('undefined,')) {
      return match;
    }
    replacements++;
    const trimmedMsg = msg.trim();
    return `logger.error('${trimmedMsg}', undefined, { ${infoVar} }, ${errorVar} instanceof Error ? ${errorVar} : new Error(String(${errorVar})));`;
  });
  
  // Pattern 10: logger.error('msg', string) → logger.error('msg', undefined, { value: string }, undefined)
  // For cases where string is passed as second arg
  const pattern10 = /logger\.error\('([^']*)',\s*([a-zA-Z_$][a-zA-Z0-9_$.]+)\);/g;
  fixed = fixed.replace(pattern10, (match, msg, varName) => {
    if (match.includes('undefined,')) {
      return match;
    }
    // Skip if it's an error variable (already handled by pattern 1)
    if (varName === 'error' || varName === 'err' || varName.endsWith('Error')) {
      return match;
    }
    // Skip safe patterns
    if (['undefined', 'null', 'true', 'false'].includes(varName)) {
      return match;
    }
    replacements++;
    const trimmedMsg = msg.trim();
    return `logger.error('${trimmedMsg}', undefined, { value: ${varName} }, undefined);`;
  });
  
  // Pattern 8: logger.error('msg', 'string') → logger.error('msg', undefined, { value: 'string' }, undefined)
  const pattern8 = /logger\.error\('([^']+)',\s*'([^']+)'\);/g;
  fixed = fixed.replace(pattern8, (match, msg, str) => {
    if (match.includes('undefined,')) {
      return match;
    }
    replacements++;
    return `logger.error('${msg}', undefined, { value: '${str}' }, undefined);`;
  });
  
  return { fixed, replacements };
}

function ensureBackupDir() {
  if (!DRY_RUN && !fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function createBackup(filePath) {
  if (DRY_RUN) return;
  
  const relativePath = filePath.replace(process.cwd() + path.sep, '');
  const backupPath = path.join(BACKUP_DIR, relativePath);
  const backupDir = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.copyFileSync(filePath, backupPath);
}

function main() {
  console.log(DRY_RUN ? '\n[DRY RUN MODE] No files will be modified\n' : '\n[LIVE MODE] Files will be modified\n');
  
  if (!DRY_RUN) {
    ensureBackupDir();
    console.log(`Backup directory: ${BACKUP_DIR}\n`);
  }
  
  // Find all TypeScript files
  let allFiles = [];
  SCAN_DIRS.forEach(dir => {
    const files = findTsFiles(dir);
    allFiles = allFiles.concat(files);
  });
  
  console.log(`Found ${allFiles.length} TypeScript files to scan\n`);
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  let totalReplacements = 0;
  
  allFiles.forEach(filePath => {
    totalFiles++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { fixed, replacements } = fixLoggerCalls(content);
      
      if (replacements > 0 && fixed !== content) {
        modifiedFiles++;
        totalReplacements += replacements;
        
        if (DRY_RUN) {
          console.log(`[DRY RUN] Would modify: ${filePath} (${replacements} changes)`);
        } else {
          createBackup(filePath);
          fs.writeFileSync(filePath, fixed, 'utf8');
          console.log(`[MODIFIED] ${filePath} (${replacements} changes)`);
        }
      }
    } catch (error) {
      console.error(`[ERROR] Failed to process ${filePath}: ${error.message}`);
    }
  });
  
  console.log('\n=== Summary ===');
  console.log(`Total files scanned: ${totalFiles}`);
  console.log(`Files with changes: ${modifiedFiles}`);
  console.log(`Total replacements: ${totalReplacements}`);
  
  if (DRY_RUN) {
    console.log('\n[DRY RUN] No files were modified. Run without --dry-run to apply changes.');
    console.log('To apply: node fix-logger-calls.js');
  } else {
    console.log(`\nBackups saved to: ${BACKUP_DIR}`);
    console.log('To restore: Copy files from backup directory back to original locations');
  }
}

main();

