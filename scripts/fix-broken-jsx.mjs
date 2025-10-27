#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

/**
 * Fix broken JSX from automated scripts
 */

const filesToFix = [
  'app/components/demos/LightingDemo.tsx',
  'app/components/ui/QuickSearch.tsx',
  'app/mini-games/console/ConsoleCard.tsx',
  'components/arcade/games/ButtonMashersKiss.tsx',
];

console.log('🔧 Fixing broken JSX...\n');

let totalFixed = 0;

for (const file of filesToFix) {
  try {
    let content = readFileSync(file, 'utf8');
    const originalContent = content;
    let changes = 0;

    // Fix 1: Broken role/tabIndex/onKeyDown attributes
    // Pattern: / role="button" tabIndex={0} onKeyDown={...}>
    // Should be: role="button" tabIndex={0} onKeyDown={...}>
    content = content.replace(
      /\s*\/\s*role="button"\s*tabIndex={\d+}\s*onKeyDown={(.*?)}>/g,
      ' role="button" tabIndex={0} onKeyDown={$1}>',
    );

    // Fix 2: Broken onKeyDown with = instead of =>
    // Pattern: onKeyDown={(e) = role="button" tabIndex={0}> {
    // Should be: onKeyDown={(e) => {
    content = content.replace(
      /onKeyDown=\{\(e\)\s*=\s*role="button"\s*tabIndex={\d+}>\s*{/g,
      'onKeyDown={(e) => {',
    );

    // Fix 3: Replace standalone <3 with ♥ or [HEART]
    // But NOT in JSX tags (< followed by letter)
    content = content.replace(/(?<!<)(<3)(?![a-zA-Z])/g, '♥');

    if (content !== originalContent) {
      writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      totalFixed++;
    } else {
      console.log(`⏭️  No changes: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n📊 Summary: Fixed ${totalFixed} files`);
console.log('🔍 Run "npm run typecheck" to verify');
