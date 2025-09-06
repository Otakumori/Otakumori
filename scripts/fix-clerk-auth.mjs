#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

console.log('🔧 Fixing Clerk auth() calls to use await...');

// Recursively find all TypeScript files
function findTsFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = statSync(fullPath);

    if (
      stat.isDirectory() &&
      !item.startsWith('.') &&
      item !== 'node_modules' &&
      item !== '.next' &&
      item !== 'dist'
    ) {
      findTsFiles(fullPath, files);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = findTsFiles('.');

let fixedCount = 0;

for (const file of files) {
  try {
    const content = readFileSync(file, 'utf8');

    // Check if file contains auth() calls that need await
    const authPattern = /const\s*{\s*[^}]*}\s*=\s*auth\(\);/g;
    const matches = content.match(authPattern);

    if (matches) {
      let newContent = content;
      let hasChanges = false;

      // Replace auth() with await auth() where needed
      newContent = newContent.replace(
        /const\s*{\s*([^}]*)}\s*=\s*auth\(\);/g,
        (match, destructuring) => {
          // Skip if already has await
          if (match.includes('await auth()')) {
            return match;
          }

          hasChanges = true;
          return `const { ${destructuring} } = await auth();`;
        },
      );

      if (hasChanges) {
        writeFileSync(file, newContent, 'utf8');
        console.log(`✅ Fixed: ${file}`);
        fixedCount++;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n🎉 Fixed ${fixedCount} files!`);
