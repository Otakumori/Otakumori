#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

/**
 * Fix the final 5 accessibility warnings
 */

console.log('🔧 Fixing final 5 warnings...\n');

const fixes = [
  {
    file: 'app/components/avatar/CharacterEditor.tsx',
    line: 759,
    description: 'Add tabIndex={0} to make div focusable for keyboard shortcuts',
    // Already fixed above with tabIndex={-1}
  },
  {
    file: 'app/components/gamecube/EnhancedGameCubeHub.tsx',
    line: 237,
    find: /<div\s+className="absolute inset-0 z-10 cursor-pointer"\s+onClick={handleCanvasClick}/,
    replace:
      '<div className="absolute inset-0 z-10 cursor-pointer" onClick={handleCanvasClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCanvasClick(); } }}',
  },
  {
    file: 'app/components/shop/FeaturedCarousel.tsx',
    line: 60,
    find: /<div\s+className="absolute inset-0"\s+onClick={handleClick}/,
    replace:
      '<div className="absolute inset-0" onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }}',
  },
  {
    file: 'app/mini-games/console/ConsoleCard.tsx',
    line: 557,
    find: /<span\s+className="[^"]*"\s+onClick={[^}]+}/,
    replace: (match) => match.replace('<span', '<button').replace('</span>', '</button>'),
  },
  {
    file: 'components/arcade/games/PantyRaid.tsx',
    line: 189,
    find: /<div\s+className="[^"]*"\s+onClick={[^}]+}/,
    replace: (match) =>
      match +
      ' role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}',
  },
];

let fixed = 0;

for (const fix of fixes) {
  try {
    if (!fix.find) continue; // Skip already fixed

    let content = readFileSync(fix.file, 'utf8');
    const originalContent = content;

    if (typeof fix.replace === 'function') {
      content = content.replace(fix.find, fix.replace);
    } else {
      content = content.replace(fix.find, fix.replace);
    }

    if (content !== originalContent) {
      writeFileSync(fix.file, content, 'utf8');
      console.log(`✅ Fixed: ${fix.file} (line ${fix.line})`);
      fixed++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${fix.file}:`, error.message);
  }
}

console.log(`\n📊 Fixed ${fixed} files`);
console.log('🔍 Run "npm run lint" to verify - should be 0 warnings!');
