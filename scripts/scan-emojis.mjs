#!/usr/bin/env node

/**
 * Script to scan for disallowed emojis in the codebase
 * Only allowlisted symbols are permitted
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const emojiRegex =
  /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F018}-\u{1F270}]/gu;

// Allowlisted symbols (black/white only)
const allowlistedSymbols = [
  '←',
  '→',
  '↑',
  '↓',
  '↕', // Arrows
  'ⓘ', // Info Circle
  '©', // Copyright
  '֎', // Near name in About Me
  '', // Excited, Heart Reaction
  '', // Swords
  '†', // Dagger
  '🃝', // Card Game
  '', // Yes
  '®', // Rated 18+ gate
  '', // No
  '︎', // Write a message (𓂃︎)
  '', // Notes/Journal
  '', // Give me a call
  '', // Shoot an email
  '⌕', // Search
];

// Complex allowlisted patterns
const allowlistedPatterns = [
  /\(｡>\\<\)/, // Shy but wants to interact
  /\(˵ •̀ ᴗ - ˵ \) /, // Good Job
  />ᴗ</, // Excited
];

const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx', '.json'];
const ignoredDirs = ['node_modules', '.next', 'dist', 'coverage', '.git', 'eslint-plugin-otm'];

function containsDisallowedEmoji(text) {
  if (typeof text !== 'string') return false;

  let cleanText = text;

  // Remove allowlisted symbols
  for (const symbol of allowlistedSymbols) {
    cleanText = cleanText.replace(
      new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      '',
    );
  }

  // Remove allowlisted patterns
  for (const pattern of allowlistedPatterns) {
    cleanText = cleanText.replace(pattern, '');
  }

  // Check if any emojis remain
  return emojiRegex.test(cleanText);
}

function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const violations = [];

    lines.forEach((line, index) => {
      if (containsDisallowedEmoji(line)) {
        violations.push({
          line: index + 1,
          content: line.trim(),
          file: filePath,
        });
      }
    });

    return violations;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    return [];
  }
}

function scanDirectory(dirPath, allViolations = []) {
  try {
    const items = readdirSync(dirPath);

    for (const item of items) {
      if (ignoredDirs.includes(item)) continue;

      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath, allViolations);
      } else if (allowedExtensions.includes(extname(item))) {
        const violations = scanFile(fullPath);
        allViolations.push(...violations);
      }
    }

    return allViolations;
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}: ${error.message}`);
    return allViolations;
  }
}

function main() {
  const violations = scanDirectory('.');

  if (violations.length === 0) {
    console.log(' No disallowed emojis found in the codebase!');
    process.exit(0);
  }

  console.error(' Found disallowed emojis in the codebase:');
  console.error('');

  // Group violations by file
  const violationsByFile = violations.reduce((acc, violation) => {
    if (!acc[violation.file]) {
      acc[violation.file] = [];
    }
    acc[violation.file].push(violation);
    return acc;
  }, {});

  for (const [file, fileViolations] of Object.entries(violationsByFile)) {
    console.error(` ${file}:`);
    fileViolations.forEach((violation) => {
      console.error(`  Line ${violation.line}: ${violation.content}`);
    });
    console.error('');
  }

  console.error(`Total violations: ${violations.length}`);
  console.error('');
  console.error(
    'Allowed symbols only: ← → ↑ ↓ ↕ ⓘ © ֎   † 🃝  ® (｡>\\<)  (˵ •̀ ᴗ - ˵ )  >ᴗ< ︎    ⌕',
  );
  process.exit(1);
}

main();
