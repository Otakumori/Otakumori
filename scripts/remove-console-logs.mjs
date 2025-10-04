#!/usr/bin/env node

/**
 * Automated console.log remover - replaces console.log with comments
 * Preserves console.error and console.warn
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

function removeConsoleLogs(text) {
  let modified = text;

  // Pattern 1: Single-line console.log
  modified = modified.replace(/^(\s*)console\.log\([^)]*\);?\s*$/gm, '$1// Console log removed');

  // Pattern 2: Multi-line console.log
  modified = modified.replace(
    /console\.log\(\s*[`'"](.*?)[`'"],?\s*\{[\s\S]*?\}\s*\);?/g,
    '// Console log removed',
  );

  // Pattern 3: Template literal console.log
  modified = modified.replace(/console\.log\(`[^`]*\${[^}]+}[^`]*`\);?/g, '// Console log removed');

  // Pattern 4: Simple string console.log
  modified = modified.replace(/console\.log\([`'"][^`'"]*[`'"]\);?/g, '// Console log removed');

  return modified;
}

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const cleaned = removeConsoleLogs(content);

    if (content !== cleaned) {
      writeFileSync(filePath, cleaned, 'utf8');
      console.log(` Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(` Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  let fixedCount = 0;

  try {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (['node_modules', '.next', '.git', 'dist', 'build', 'scripts'].includes(item)) {
          continue;
        }
        fixedCount += processDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = extname(item);
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
          if (processFile(fullPath)) {
            fixedCount++;
          }
        }
      }
    }
  } catch (error) {
    console.error(` Error processing directory ${dirPath}:`, error.message);
  }

  return fixedCount;
}

// Main execution
console.log(' Starting console.log cleanup...');
const fixedCount = processDirectory('.');
console.log(` Fixed ${fixedCount} files`);
console.log(' Done! All console.log statements have been removed.');

