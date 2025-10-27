#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

/**
 * Automated ESLint unused variable fixer
 * Prefixes unused variables with _ to suppress warnings
 */

const fixes = {
  'app/components/demos/LightingDemo.tsx': [
    { from: /const lightingEngine = /g, to: 'const _lightingEngine = ' },
  ],
  'app/components/effects/AdvancedPetalSystem.tsx': [
    { from: /\(entries\) =>/g, to: '(_entries) =>' },
  ],
  'app/components/effects/DynamicLightingSystem.tsx': [
    { from: /const addCustomLight = /g, to: 'const _addCustomLight = ' },
    { from: /const removeCustomLight = /g, to: 'const _removeCustomLight = ' },
    { from: /const addLightBurst = /g, to: 'const _addLightBurst = ' },
  ],
  'app/components/effects/PetalBreathingMode.tsx': [
    { from: /const petals = /g, to: 'const _petals = ' },
    { from: /const animationRef = /g, to: 'const _animationRef = ' },
  ],
  'app/components/PetalGameImage.tsx': [
    { from: /const lastCollectDate = /g, to: 'const _lastCollectDate = ' },
  ],
  'app/hooks/useAdvancedPetals.ts': [{ from: /spawnRate,/g, to: '_spawnRate,' }],
  'app/hooks/useDynamicLighting.ts': [
    { from: /enableMouseInteraction,/g, to: '_enableMouseInteraction,' },
    { from: /enableVolumetricEffects,/g, to: '_enableVolumetricEffects,' },
    { from: /ambientIntensity,/g, to: '_ambientIntensity,' },
  ],
  'app/lib/3d/animation-system.ts': [{ from: /const deltaTime = /g, to: 'const _deltaTime = ' }],
  'app/lib/3d/model-loader.ts': [{ from: /\(options\) =>/g, to: '(_options) =>' }],
  'app/lib/3d/performance-optimization.ts': [{ from: /\(key\) =>/g, to: '(_key) =>' }],
  'app/mini-games/bubble-girl/InteractiveBuddyGame.tsx': [
    { from: /const \[showShop, setShowShop\] = /g, to: 'const [_showShop, setShowShop] = ' },
  ],
  'app/mini-games/dungeon-of-desire/DungeonGame.tsx': [
    { from: /const saveOnExit = /g, to: 'const _saveOnExit = ' },
    { from: /const autoSave = /g, to: 'const _autoSave = ' },
  ],
  'app/mini-games/_shared/GameAvatarIntegration.tsx': [
    { from: /quality,/g, to: '_quality,' },
    { from: /enable3D,/g, to: '_enable3D,' },
    { from: /enableAnimations,/g, to: '_enableAnimations,' },
    { from: /animationState,/g, to: '_animationState,' },
    { from: /\(userId\) =>/g, to: '(_userId) =>' },
    { from: /\(config\) =>/g, to: '(_config) =>' },
    { from: /\(options\) =>/g, to: '(_options) =>' },
  ],
  'app/mini-games/_shared/GameAvatarRenderer.tsx': [
    { from: /animationState,/g, to: '_animationState,' },
    { from: /\(delta\) =>/g, to: '(_delta) =>' },
  ],
  'app/mini-games/_shared/GameShellV2.tsx': [
    {
      from: /const \[playerSlots, setPlayerSlots\] = /g,
      to: 'const [_playerSlots, setPlayerSlots] = ',
    },
  ],
  'app/shop/product/[id]/ProductClient.tsx': [
    {
      from: /const { showSuccess, showError } = /g,
      to: 'const { showSuccess, showError: _showError } = ',
    },
  ],
  'components/arcade/games/NekoLapDance.tsx': [
    { from: /const \[earWiggle, setEarWiggle\] = /g, to: 'const [_earWiggle, setEarWiggle] = ' },
    { from: /const \[tailSway, setTailSway\] = /g, to: 'const [_tailSway, setTailSway] = ' },
  ],
  'components/GameControls.tsx': [
    { from: /const \[isVisible, setIsVisible\] = /g, to: 'const [_isVisible, setIsVisible] = ' },
  ],
  'components/hero/InteractivePetals.tsx': [
    { from: /variant,/g, to: '_variant,' },
    {
      from: /const \[dailyLimit, setDailyLimit\] = /g,
      to: 'const [_dailyLimit, setDailyLimit] = ',
    },
  ],
  'lib/analytics/session-tracker.ts': [{ from: /const session = /g, to: 'const _session = ' }],
  'lib/procedural/cel-shaded-assets.ts': [{ from: /const angle = /g, to: 'const _angle = ' }],
};

console.log('🔧 Fixing unused variable warnings...\n');

let fixedCount = 0;
let errorCount = 0;

for (const [filePath, fileFixes] of Object.entries(fixes)) {
  try {
    let content = readFileSync(filePath, 'utf8');
    const originalContent = content;

    for (const fix of fileFixes) {
      content = content.replace(fix.from, fix.to);
    }

    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      fixedCount++;
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
console.log(`❌ Errors: ${errorCount} files`);
console.log(`\n🔍 Run "npm run lint" to verify fixes`);
