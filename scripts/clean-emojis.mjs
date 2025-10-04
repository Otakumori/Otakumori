#!/usr/bin/env node

/**
 * Simple emoji cleaner - replaces colorful emojis with clean Unicode symbols
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Emoji to clean symbol mapping
const emojiMap = {
  // Arrows and navigation
  '←': '←',
  '→': '→',
  '↑': '↑',
  '↓': '↓',
  '↕': '↕',
  '◀': '◀',
  '▶': '▶',
  '▲': '▲',
  '▼': '▼',

  // Shapes and symbols
  '': '',
  '': '',
  '◆': '◆',
  '●': '●',
  '': '●',
  '': '○',
  '■': '■',
  '□': '□',
  '◆': '◆',
  '◆': '◆',
  '◆': '◆',
  '▲': '▲',
  '▼': '▼',
  '◀': '◀',
  '▶': '▶',

  // Tools and objects
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',

  // Communication
  'ⓘ': 'ⓘ',
  '©': '©',
  '®': '®',
  '': '',
  '': '',
  '︎': '',
  '': '',
  '': '',
  '⌕': '⌕',

  // Special characters
  '': '',
  '†': '†',
  '🃝': '🃝',
  '︎': '︎',
  '': '',

  // Common emojis to remove entirely
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
  '': '',
};

function cleanEmojis(text) {
  let cleaned = text;

  // Replace mapped emojis
  for (const [emoji, replacement] of Object.entries(emojiMap)) {
    cleaned = cleaned.replace(new RegExp(emoji, 'g'), replacement);
  }

  // Remove any remaining colorful emojis (basic pattern)
  cleaned = cleaned.replace(
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu,
    '',
  );

  return cleaned;
}

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const cleaned = cleanEmojis(content);

    if (content !== cleaned) {
      writeFileSync(filePath, cleaned, 'utf8');
      console.log(` Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(` Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  let cleanedCount = 0;

  try {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
          continue;
        }
        cleanedCount += processDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = extname(item);
        if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'].includes(ext)) {
          if (processFile(fullPath)) {
            cleanedCount++;
          }
        }
      }
    }
  } catch (error) {
    console.error(` Error processing directory ${dirPath}:`, error.message);
  }

  return cleanedCount;
}

// Main execution
console.log(' Starting emoji cleanup...');
const cleanedCount = processDirectory('.');
console.log(` Cleaned ${cleanedCount} files`);
console.log(' Done! Your emojis are now clean Unicode symbols.');
