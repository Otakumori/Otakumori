#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log(' Fixing script files...');

// Function to recursively find all script files
function findScriptFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findScriptFiles(fullPath));
    } else if (item.endsWith('.ts') || item.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to fix script files
function fixScriptFile(content, filePath) {
  // Only fix files that have shebang lines
  if (content.includes('#!/usr/bin/env')) {
    // Remove ESLint disable comments
    content = content.replace(/\/\* eslint-disable[^*]*\*\/\n?/g, '');
    return { content, modified: true };
  }

  return { content, modified: false };
}

// Main function
function main() {
  try {
    const projectRoot = process.cwd();
    const files = findScriptFiles(projectRoot);

    let totalFixed = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const result = fixScriptFile(content, file);

        if (result.modified) {
          fs.writeFileSync(file, result.content, 'utf8');
          totalFixed++;
          console.log(` Fixed: ${path.relative(projectRoot, file)}`);
        }
      } catch (error) {
        console.log(`  Skipped: ${path.relative(projectRoot, file)} (${error.message})`);
      }
    }

    console.log(`\n Fixed ${totalFixed} script files!`);
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
}

main();
