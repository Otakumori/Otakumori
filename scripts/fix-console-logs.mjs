#!/usr/bin/env node
/**
 * Replace console.* with logger calls
 * Run: node scripts/fix-console-logs.mjs --dry-run
 * Run: node scripts/fix-console-logs.mjs --execute
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', '.cache', 'reports', 'coverage'];
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function findFiles(dir, fileList = []) {
  if (!statSync(dir).isDirectory()) {
    return fileList;
  }

  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    try {
      const stat = statSync(filePath);
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findFiles(filePath, fileList);
      } else if (stat.isFile() && FILE_EXTENSIONS.includes(extname(file))) {
        fileList.push(filePath);
      }
    } catch (e) {
      // Skip files we can't access
    }
  });
  return fileList;
}

function hasLoggerImport(content) {
  return /import.*logger.*from.*['"]@\/app\/lib\/logger['"]/.test(content);
}

function hasRequestIdImport(content) {
  return /import.*newRequestId.*from.*['"]@\/app\/lib\/requestId['"]/.test(content);
}

function replaceConsoleStatements(content, filePath) {
  let modified = content;
  let hasLogger = hasLoggerImport(content);
  let hasRequestId = hasRequestIdImport(content);
  let addedLoggerImport = false;
  let addedRequestIdImport = false;
  
  // Check if it's an API route
  const isApiRoute = filePath.includes('/api/') && filePath.includes('/route.ts');
  const hasRequest = /req\s*:|request\s*:|Request\s*/.test(content);
  
  // Count replacements to determine if we need imports
  const consoleLogMatches = modified.match(/console\.log\s*\(/g);
  const consoleErrorMatches = modified.match(/console\.error\s*\(/g);
  const consoleWarnMatches = modified.match(/console\.warn\s*\(/g);
  const consoleInfoMatches = modified.match(/console\.info\s*\(/g);
  const consoleDebugMatches = modified.match(/console\.debug\s*\(/g);
  
  const hasAnyConsole = consoleLogMatches || consoleErrorMatches || consoleWarnMatches || 
                        consoleInfoMatches || consoleDebugMatches;
  
  if (!hasAnyConsole) {
    return { modified, changed: false };
  }
  
  // Replace console.log
  if (consoleLogMatches) {
    if (!hasLogger) {
      hasLogger = true;
      addedLoggerImport = true;
    }
    if (!hasRequestId && !isApiRoute) {
      hasRequestId = true;
      addedRequestIdImport = true;
    }
    
    modified = modified.replace(/console\.log\s*\(/g, (match, offset) => {
      // Check if this is in a comment
      const beforeMatch = modified.substring(0, offset);
      const lastComment = beforeMatch.lastIndexOf('//');
      const lastNewline = beforeMatch.lastIndexOf('\n');
      if (lastComment > lastNewline) {
        return match; // Skip if in comment
      }
      
      return isApiRoute && hasRequest 
        ? 'logger.request(req, '
        : 'logger.info(';
    });
  }
  
  // Replace console.error
  if (consoleErrorMatches) {
    if (!hasLogger) {
      hasLogger = true;
      addedLoggerImport = true;
    }
    
    modified = modified.replace(/console\.error\s*\(/g, (match, offset) => {
      const beforeMatch = modified.substring(0, offset);
      const lastComment = beforeMatch.lastIndexOf('//');
      const lastNewline = beforeMatch.lastIndexOf('\n');
      if (lastComment > lastNewline) {
        return match;
      }
      
      return isApiRoute && hasRequest 
        ? 'logger.apiError(req, '
        : 'logger.error(';
    });
  }
  
  // Replace console.warn
  if (consoleWarnMatches) {
    if (!hasLogger) {
      hasLogger = true;
      addedLoggerImport = true;
    }
    if (!hasRequestId && !isApiRoute) {
      hasRequestId = true;
      addedRequestIdImport = true;
    }
    
    modified = modified.replace(/console\.warn\s*\(/g, (match, offset) => {
      const beforeMatch = modified.substring(0, offset);
      const lastComment = beforeMatch.lastIndexOf('//');
      const lastNewline = beforeMatch.lastIndexOf('\n');
      if (lastComment > lastNewline) {
        return match;
      }
      
      return 'logger.warn(';
    });
  }
  
  // Replace console.info
  if (consoleInfoMatches) {
    if (!hasLogger) {
      hasLogger = true;
      addedLoggerImport = true;
    }
    if (!hasRequestId && !isApiRoute) {
      hasRequestId = true;
      addedRequestIdImport = true;
    }
    
    modified = modified.replace(/console\.info\s*\(/g, (match, offset) => {
      const beforeMatch = modified.substring(0, offset);
      const lastComment = beforeMatch.lastIndexOf('//');
      const lastNewline = beforeMatch.lastIndexOf('\n');
      if (lastComment > lastNewline) {
        return match;
      }
      
      return 'logger.info(';
    });
  }
  
  // Replace console.debug
  if (consoleDebugMatches) {
    if (!hasLogger) {
      hasLogger = true;
      addedLoggerImport = true;
    }
    if (!hasRequestId && !isApiRoute) {
      hasRequestId = true;
      addedRequestIdImport = true;
    }
    
    modified = modified.replace(/console\.debug\s*\(/g, (match, offset) => {
      const beforeMatch = modified.substring(0, offset);
      const lastComment = beforeMatch.lastIndexOf('//');
      const lastNewline = beforeMatch.lastIndexOf('\n');
      if (lastComment > lastNewline) {
        return match;
      }
      
      return 'logger.debug(';
    });
  }
  
  // Add imports if needed
  if (addedLoggerImport || addedRequestIdImport) {
    const importLines = [];
    if (addedLoggerImport) {
      importLines.push("import { logger } from '@/app/lib/logger';");
    }
    if (addedRequestIdImport) {
      importLines.push("import { newRequestId } from '@/app/lib/requestId';");
    }
    
    // Find first import line
    const firstImportMatch = modified.match(/^import\s+/m);
    if (firstImportMatch) {
      const insertPos = modified.indexOf(firstImportMatch[0]);
      modified = modified.slice(0, insertPos) + 
                 importLines.join('\n') + '\n' + 
                 modified.slice(insertPos);
    } else {
      // No imports, add at top (after 'use client' if present)
      const useClientMatch = modified.match(/^['"]use client['"];?\s*\n/);
      if (useClientMatch) {
        const insertPos = useClientMatch.index + useClientMatch[0].length;
        modified = modified.slice(0, insertPos) + 
                   importLines.join('\n') + '\n' + 
                   modified.slice(insertPos);
      } else {
        modified = importLines.join('\n') + '\n\n' + modified;
      }
    }
  }
  
  return { modified, changed: modified !== content };
}

// Main execution
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');
const rootDir = join(__dirname, '..');
const appDir = join(rootDir, 'app');

console.log('🔍 Scanning for console statements...\n');

let files = [];
try {
  files = findFiles(appDir);
} catch (e) {
  console.error('Error scanning files:', e.message);
  process.exit(1);
}

const filesWithConsole = files.filter(f => {
  try {
    const content = readFileSync(f, 'utf8');
    return /console\.(log|error|warn|info|debug)/.test(content);
  } catch {
    return false;
  }
});

console.log(`Found ${filesWithConsole.length} files with console statements\n`);

if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE\n');
  filesWithConsole.slice(0, 20).forEach(f => {
    try {
      const content = readFileSync(f, 'utf8');
      const matches = content.match(/console\.(log|error|warn|info|debug)/g);
      console.log(`${f.replace(rootDir + '/', '')}: ${matches?.length || 0} console statements`);
    } catch (e) {
      console.log(`${f}: Error reading file`);
    }
  });
  if (filesWithConsole.length > 20) {
    console.log(`\n... and ${filesWithConsole.length - 20} more files`);
  }
  console.log('\nRun with --execute to apply replacements');
} else {
  let fixed = 0;
  let errors = 0;
  let skipped = 0;
  
  filesWithConsole.forEach(file => {
    try {
      const content = readFileSync(file, 'utf8');
      const { modified, changed } = replaceConsoleStatements(content, file);
      
      if (changed) {
        writeFileSync(file, modified, 'utf8');
        console.log(`✅ Fixed: ${file.replace(rootDir + '/', '')}`);
        fixed++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${file.replace(rootDir + '/', '')}:`, error.message);
      errors++;
    }
  });
  
  console.log(`\n📊 Summary: Fixed ${fixed}, Skipped ${skipped}, Errors: ${errors}`);
}
