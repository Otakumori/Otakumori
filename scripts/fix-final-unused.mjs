#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

/**
 * Final pass - fix all remaining unused variables
 */

const manualFixes = [
  {
    file: 'app/lib/3d/model-loader.ts',
    line: 135,
    from: 'async (options)',
    to: 'async (_options)',
  },
  {
    file: 'app/lib/3d/performance-optimization.ts',
    line: 538,
    from: '.forEach((key)',
    to: '.forEach((_key)',
  },
  {
    file: 'app/mini-games/bubble-girl/InteractiveBuddyGame.tsx',
    line: 91,
    from: 'const [showShop, setShowShop]',
    to: 'const [_showShop, setShowShop]',
  },
  {
    file: 'app/mini-games/dungeon-of-desire/DungeonGame.tsx',
    line: 100,
    from: 'const { saveOnExit:',
    to: 'const { saveOnExit: _saveOnExit,',
  },
  {
    file: 'app/mini-games/_shared/GameAvatarIntegration.tsx',
    changes: [
      { line: 47, from: 'quality,', to: '_quality,' },
      { line: 50, from: 'enable3D,', to: '_enable3D,' },
      { line: 51, from: 'enableAnimations,', to: '_enableAnimations,' },
      { line: 52, from: 'animationState,', to: '_animationState,' },
      { line: 107, from: 'async (userId:', to: 'async (_userId:' },
      { line: 145, from: ': (config:', to: ': (_config:' },
      { line: 146, from: ': (options:', to: ': (_options:' },
    ],
  },
  {
    file: 'app/mini-games/_shared/GameAvatarRenderer.tsx',
    changes: [
      { line: 43, from: 'animationState,', to: '_animationState,' },
      { line: 77, from: 'useFrame((state, delta)', to: 'useFrame((state, _delta)' },
    ],
  },
  {
    file: 'app/mini-games/_shared/GameShellV2.tsx',
    line: 91,
    from: 'const [playerSlots, setPlayerSlots]',
    to: 'const [_playerSlots, setPlayerSlots]',
  },
  {
    file: 'app/shop/product/[id]/ProductClient.tsx',
    line: 44,
    from: 'const { showSuccess, showError }',
    to: 'const { showSuccess, showError: _showError }',
  },
  {
    file: 'components/arcade/games/NekoLapDance.tsx',
    changes: [
      { line: 36, from: 'const [earWiggle, setEarWiggle]', to: 'const [_earWiggle, setEarWiggle]' },
      { line: 37, from: 'const [tailSway, setTailSway]', to: 'const [_tailSway, setTailSway]' },
    ],
  },
  {
    file: 'components/GameControls.tsx',
    line: 27,
    from: 'const [isVisible, setIsVisible]',
    to: 'const [_isVisible, setIsVisible]',
  },
  {
    file: 'components/hero/InteractivePetals.tsx',
    changes: [
      { line: 26, from: 'variant,', to: '_variant,' },
      {
        line: 37,
        from: 'const [dailyLimit, setDailyLimit]',
        to: 'const [_dailyLimit, setDailyLimit]',
      },
    ],
  },
  {
    file: 'lib/analytics/session-tracker.ts',
    line: 290,
    from: 'const session = ',
    to: 'const _session = ',
  },
];

console.log('🔧 Final pass: fixing remaining unused variables...\n');

let fixedFiles = 0;
let totalChanges = 0;

for (const fix of manualFixes) {
  try {
    let content = readFileSync(fix.file, 'utf8');
    const originalContent = content;
    let changes = 0;

    if (fix.changes) {
      // Multiple changes in one file
      for (const change of fix.changes) {
        const regex = new RegExp(change.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, change.to);
          changes += matches.length;
        }
      }
    } else {
      // Single change
      const regex = new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, fix.to);
        changes += matches.length;
      }
    }

    if (content !== originalContent) {
      writeFileSync(fix.file, content, 'utf8');
      console.log(`✅ Fixed: ${fix.file} (${changes} changes)`);
      fixedFiles++;
      totalChanges += changes;
    } else {
      console.log(`⏭️  No changes: ${fix.file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${fix.file}:`, error.message);
  }
}

console.log(`\n📊 Final Summary:`);
console.log(`✅ Fixed: ${fixedFiles} files`);
console.log(`🔄 Changes: ${totalChanges} variables prefixed`);
console.log(`\n🔍 Run "npm run lint" to verify all fixes`);
