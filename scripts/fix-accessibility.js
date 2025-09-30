#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common emoji patterns and their accessible replacements
const emojiReplacements = {
  '🌸': '<span role="img" aria-label="Cherry blossom">🌸</span>',
  '🎮': '<span role="img" aria-label="Game controller">🎮</span>',
  '✨': '<span role="img" aria-label="Sparkles">✨</span>',
  '🔮': '<span role="img" aria-label="Crystal ball">🔮</span>',
  '❤': '<span role="img" aria-label="Heart">❤</span>',
  '💖': '<span role="img" aria-label="Sparkling heart">💖</span>',
  '💕': '<span role="img" aria-label="Two hearts">💕</span>',
  '💗': '<span role="img" aria-label="Growing heart">💗</span>',
  '💝': '<span role="img" aria-label="Heart with ribbon">💝</span>',
  '💘': '<span role="img" aria-label="Heart with arrow">💘</span>',
  '💓': '<span role="img" aria-label="Beating heart">💓</span>',
  '💞': '<span role="img" aria-label="Revolving hearts">💞</span>',
  '💟': '<span role="img" aria-label="Heart decoration">💟</span>',
  '💌': '<span role="img" aria-label="Love letter">💌</span>',
  '💋': '<span role="img" aria-label="Kiss mark">💋</span>',
  '💍': '<span role="img" aria-label="Ring">💍</span>',
  '💎': '<span role="img" aria-label="Gem stone">💎</span>',
  '💐': '<span role="img" aria-label="Bouquet">💐</span>',
  '🌺': '<span role="img" aria-label="Hibiscus">🌺</span>',
  '🌻': '<span role="img" aria-label="Sunflower">🌻</span>',
  '🌹': '<span role="img" aria-label="Rose">🌹</span>',
  '🌷': '<span role="img" aria-label="Tulip">🌷</span>',
  '🌼': '<span role="img" aria-label="Daisy">🌼</span>',
  '🌿': '<span role="img" aria-label="Herb">🌿</span>',
  '🍀': '<span role="img" aria-label="Four leaf clover">🍀</span>',
  '🌱': '<span role="img" aria-label="Seedling">🌱</span>',
  '🌾': '<span role="img" aria-label="Sheaf of rice">🌾</span>',
  '🌵': '<span role="img" aria-label="Cactus">🌵</span>',
  '🌴': '<span role="img" aria-label="Palm tree">🌴</span>',
  '🌳': '<span role="img" aria-label="Deciduous tree">🌳</span>',
  '🌲': '<span role="img" aria-label="Evergreen tree">🌲</span>',
  '🌟': '<span role="img" aria-label="Star">🌟</span>',
  '⭐': '<span role="img" aria-label="White medium star">⭐</span>',
  '💫': '<span role="img" aria-label="Dizzy star">💫</span>',
};

// Function to fix emojis in a file
function fixEmojisInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace standalone emojis (not already wrapped)
    for (const [emoji, replacement] of Object.entries(emojiReplacements)) {
      // Only replace if not already wrapped in a span with role="img"
      const emojiRegex = new RegExp(
        `(?<!<span[^>]*role="img"[^>]*>)${emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![^<]*</span>)`,
        'g',
      );
      if (content.match(emojiRegex)) {
        content = content.replace(emojiRegex, replacement);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed emojis in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files = files.concat(findFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some((ext) => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
function main() {
  console.log('🔧 Starting accessibility fixes...\n');

  const appDir = path.join(process.cwd(), 'app');
  const componentsDir = path.join(process.cwd(), 'components');

  const files = [...findFiles(appDir), ...findFiles(componentsDir)];

  let fixedCount = 0;
  let totalFiles = files.length;

  console.log(`📁 Found ${totalFiles} files to process...\n`);

  for (const file of files) {
    if (fixEmojisInFile(file)) {
      fixedCount++;
    }
  }

  console.log(`\n🎉 Accessibility fixes complete!`);
  console.log(`📊 Fixed ${fixedCount} out of ${totalFiles} files`);

  if (fixedCount > 0) {
    console.log('\n🔍 Running linter to check results...');
    try {
      execSync(
        'npx eslint . --ext .ts,.tsx --max-warnings 0 2>&1 | findstr "accessible-emoji" | Measure-Object',
        {
          stdio: 'inherit',
          shell: true,
        },
      );
    } catch (error) {
      console.log('Linter check completed with some issues remaining.');
    }
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixEmojisInFile, emojiReplacements };
