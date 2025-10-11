#!/usr/bin/env node
/**
 * Fix brand name consistency: "Otakumori" -> "Otaku-mori"
 * Excludes "Otakumori ™" trademark version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Directories to search
const searchDirs = ['app', 'components', 'lib'];

// Files to exclude
const excludePatterns = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /dist/,
  /build/,
  /package-lock\.json/,
  /yarn\.lock/,
  /pnpm-lock\.yaml/,
];

let filesChanged = 0;
let totalReplacements = 0;

function shouldExclude(filePath) {
  return excludePatterns.some((pattern) => pattern.test(filePath));
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (shouldExclude(fullPath)) return;

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.js') ||
      file.endsWith('.jsx') ||
      file.endsWith('.md') ||
      file.endsWith('.mdx')
    ) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function fixBrandName(content) {
  let replacements = 0;

  // Replace "Otakumori" but NOT "Otakumori ™"
  // Use negative lookahead to exclude the trademark version
  const result = content.replace(/Otakumori(?!\s*™)/g, (match, offset, string) => {
    // Additional check: make sure we're not in the middle of "Otakumori ™"
    const nextChars = string.slice(offset + match.length, offset + match.length + 3);
    if (nextChars.trim().startsWith('™')) {
      return match; // Keep as is
    }
    replacements++;
    return 'Otaku-mori';
  });

  return { content: result, replacements };
}

function processFile(filePath) {
  const relativePath = path.relative(projectRoot, filePath);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, replacements } = fixBrandName(content);

    if (replacements > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ ${relativePath}: ${replacements} replacement(s)`);
      filesChanged++;
      totalReplacements += replacements;
    }
  } catch (error) {
    console.error(`✗ Error processing ${relativePath}:`, error.message);
  }
}

console.log('🔍 Searching for brand name inconsistencies...\n');

// Collect all files
let allFiles = [];
searchDirs.forEach((dir) => {
  const dirPath = path.join(projectRoot, dir);
  if (fs.existsSync(dirPath)) {
    allFiles = allFiles.concat(getAllFiles(dirPath));
  }
});

console.log(`Found ${allFiles.length} files to check\n`);

// Process each file
allFiles.forEach(processFile);

console.log('\n' + '='.repeat(50));
console.log(`✨ Complete!`);
console.log(`   Files changed: ${filesChanged}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log('='.repeat(50));

if (filesChanged > 0) {
  console.log('\n💡 Run `git diff` to review changes');
  process.exit(0);
} else {
  console.log('\n✓ All brand names are already consistent!');
  process.exit(0);
}
