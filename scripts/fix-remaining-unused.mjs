#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

/**
 * Fix remaining unused variable warnings
 * Uses more precise patterns based on actual lint output
 */

const fixes = {
  'app/components/demos/LightingDemo.tsx': [
    { from: /const \[lightingEngine,/g, to: 'const [_lightingEngine,' },
  ],
  'app/components/effects/PetalBreathingMode.tsx': [
    { from: /const \[petals,/g, to: 'const [_petals,' },
  ],
  'app/components/PetalGameImage.tsx': [
    { from: /const \[lastCollectDate,/g, to: 'const [_lastCollectDate,' },
  ],
  'app/hooks/useAdvancedPetals.ts': [{ from: /{\s*spawnRate,/g, to: '{ _spawnRate,' }],
  'app/hooks/useDynamicLighting.ts': [
    { from: /{\s*enableMouseInteraction,/g, to: '{ _enableMouseInteraction,' },
    { from: /enableVolumetricEffects,/g, to: '_enableVolumetricEffects,' },
    { from: /ambientIntensity,/g, to: '_ambientIntensity,' },
  ],
  'app/lib/3d/model-loader.ts': [{ from: /\(options: any\)/g, to: '(_options: any)' }],
  'app/lib/3d/performance-optimization.ts': [
    { from: /\.forEach\(\(key\)/g, to: '.forEach((_key)' },
  ],
  'app/mini-games/bubble-girl/InteractiveBuddyGame.tsx': [
    { from: /const \[showShop, setShowShop\]/g, to: 'const [_showShop, setShowShop]' },
  ],
  'app/mini-games/dungeon-of-desire/DungeonGame.tsx': [
    { from: /const { saveOnExit:/g, to: 'const { saveOnExit: _saveOnExit,' },
    { from: /, autoSave }/g, to: ', autoSave: _autoSave }' },
  ],
  'app/mini-games/_shared/GameAvatarIntegration.tsx': [
    { from: /{\s*quality,/g, to: '{ _quality,' },
    { from: /enable3D,/g, to: '_enable3D,' },
    { from: /enableAnimations,/g, to: '_enableAnimations,' },
    { from: /animationState,/g, to: '_animationState,' },
    { from: /async \(userId:/g, to: 'async (_userId:' },
    { from: /: \(config:/g, to: ': (_config:' },
    { from: /: \(options:/g, to: ': (_options:' },
  ],
  'app/mini-games/_shared/GameAvatarRenderer.tsx': [
    { from: /{\s*animationState,/g, to: '{ _animationState,' },
    { from: /useFrame\(\(state, delta\)/g, to: 'useFrame((state, _delta)' },
  ],
  'app/mini-games/_shared/GameShellV2.tsx': [
    { from: /const \[playerSlots, setPlayerSlots\]/g, to: 'const [_playerSlots, setPlayerSlots]' },
  ],
  'app/shop/product/[id]/ProductClient.tsx': [
    {
      from: /const { showSuccess, showError }/g,
      to: 'const { showSuccess, showError: _showError }',
    },
  ],
  'components/arcade/games/NekoLapDance.tsx': [
    { from: /const \[earWiggle, setEarWiggle\]/g, to: 'const [_earWiggle, setEarWiggle]' },
    { from: /const \[tailSway, setTailSway\]/g, to: 'const [_tailSway, setTailSway]' },
  ],
  'components/GameControls.tsx': [
    { from: /const \[isVisible, setIsVisible\]/g, to: 'const [_isVisible, setIsVisible]' },
  ],
  'components/hero/InteractivePetals.tsx': [
    { from: /{\s*variant,/g, to: '{ _variant,' },
    { from: /const \[dailyLimit, setDailyLimit\]/g, to: 'const [_dailyLimit, setDailyLimit]' },
  ],
  'lib/analytics/session-tracker.ts': [
    { from: /const session = await/g, to: 'const _session = await' },
  ],
};

console.log('🔧 Fixing remaining unused variable warnings...\n');

let fixedCount = 0;
let errorCount = 0;
let changeCount = 0;

for (const [filePath, fileFixes] of Object.entries(fixes)) {
  try {
    let content = readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileChangeCount = 0;

    for (const fix of fileFixes) {
      const matches = content.match(fix.from);
      if (matches) {
        content = content.replace(fix.from, fix.to);
        fileChangeCount += matches.length;
      }
    }

    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath} (${fileChangeCount} changes)`);
      fixedCount++;
      changeCount += fileChangeCount;
    } else {
      console.log(`⏭️  No changes: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    errorCount++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`✅ Fixed: ${fixedCount} files`);
console.log(`🔄 Changes: ${changeCount} variables prefixed`);
console.log(`❌ Errors: ${errorCount} files`);
console.log(`\n🔍 Run "npm run lint" to verify fixes`);
