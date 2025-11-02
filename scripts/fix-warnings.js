#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

console.log(' Fixing warnings automatically...');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findFiles(fullPath, extensions));
    } else if (extensions.some((ext) => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to fix React Hooks warnings
function fixHooksWarnings(content) {
  let modified = false;

  // Fix useEffect missing dependencies
  content = content.replace(
    /useEffect\(\s*\(\s*\)\s*=>\s*\{([^}]+)\},\s*\[\s*\]\s*\)/g,
    (match, body) => {
      // Check if the body uses any variables that should be dependencies
      const usedVars = body.match(/(\w+)(?=\s*[;,)])/g) || [];
      const filteredVars = usedVars.filter(
        (v) => !['console', 'window', 'document', 'localStorage', 'sessionStorage'].includes(v),
      );

      if (filteredVars.length > 0) {
        modified = true;
        return `useEffect(() => {${body}}, [${filteredVars.join(', ')}])`;
      }
      return match;
    },
  );

  // Fix useCallback missing dependencies
  content = content.replace(
    /useCallback\(\s*\(\s*\)\s*=>\s*\{([^}]+)\},\s*\[\s*\]\s*\)/g,
    (match, body) => {
      const usedVars = body.match(/(\w+)(?=\s*[;,)])/g) || [];
      const filteredVars = usedVars.filter(
        (v) => !['console', 'window', 'document', 'localStorage', 'sessionStorage'].includes(v),
      );

      if (filteredVars.length > 0) {
        modified = true;
        return `useCallback(() => {${body}}, [${filteredVars.join(', ')}])`;
      }
      return match;
    },
  );

  return { content, modified };
}

// Function to add ESLint disable comments for img tags in game files
function fixImgWarnings(content, filePath) {
  let modified = false;

  // Only add disable comments for game/scene/sprite files
  if (
    filePath.includes('/game') ||
    filePath.includes('/scene') ||
    filePath.includes('/sprite') ||
    filePath.includes('/mini-games') ||
    filePath.includes('/abyss')
  ) {
    // Add file-level disable comment if not present
    if (!content.includes('@next/next/no-img-element')) {
      const disableComment = '\n';
      content = disableComment + content;
      modified = true;
    }
  }

  return { content, modified };
}

// Main function
function main() {
  try {
    const projectRoot = process.cwd();
    const files = findFiles(projectRoot);

    let totalFixed = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        let modified = false;

        // Fix hooks warnings
        const hooksResult = fixHooksWarnings(content, file);
        if (hooksResult.modified) {
          modified = true;
        }

        // Fix img warnings
        const imgResult = fixImgWarnings(hooksResult.content, file);
        if (imgResult.modified) {
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(file, imgResult.content, 'utf8');
          totalFixed++;
          console.log(` Fixed: ${path.relative(projectRoot, file)}`);
        }
      } catch (error) {
        console.log(`  Skipped: ${path.relative(projectRoot, file)} (${error.message})`);
      }
    }

    console.log(`\n Fixed ${totalFixed} files!`);

    // Run lint to check remaining issues
    console.log('\n⌕ Running lint check...');
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
}

main();
