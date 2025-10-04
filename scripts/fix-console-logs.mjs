#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', 'coverage'];
const EXCLUDE_FILES = ['test', 'spec', 'setup', 'config'];

function shouldProcessFile(filePath) {
  // Skip if in excluded directory
  for (const dir of EXCLUDE_DIRS) {
    if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) {
      return false;
    }
  }

  // Skip if filename contains excluded patterns
  const fileName = filePath.split('/').pop().split('\\').pop();
  for (const pattern of EXCLUDE_FILES) {
    if (fileName.includes(pattern)) {
      return false;
    }
  }

  return true;
}

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace console.log with comments
    const newContent = content.replace(/console\.log\([^)]*\);?/g, (match) => {
      modified = true;
      // Extract the content inside console.log and convert to comment
      const innerContent = match.replace(/console\.log\(|\);?$/g, '');
      return `// ${innerContent}`;
    });

    if (modified) {
      writeFileSync(filePath, newContent, 'utf8');
      console.warn(`Fixed console.log in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (shouldProcessFile(fullPath)) {
          processDirectory(fullPath);
        }
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        if (shouldProcessFile(fullPath)) {
          processFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Process the current directory
processDirectory('.');
console.warn('Console.log fix completed!');
