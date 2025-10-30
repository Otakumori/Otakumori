#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { globby } from 'globby';

// Files to process (from lint output)
const filesToProcess = [
  'app/components/avatar/CharacterEditor.tsx',
  'app/components/effects/AdvancedPetalSystem.tsx',
  'app/components/effects/DynamicLightingSystem.tsx',
  'app/components/effects/PetalBreathingMode.tsx',
  'app/components/PetalGameImage.tsx',
  'app/hooks/useAdvancedPetals.ts',
  'app/hooks/useDynamicLighting.ts',
  'app/lib/3d/animation-system.ts',
  'app/lib/3d/model-loader.ts',
  'app/lib/3d/performance-optimization.ts',
  'app/mini-games/bubble-girl/InteractiveBuddyGame.tsx',
  'app/mini-games/dungeon-of-desire/DungeonGame.tsx',
  'app/mini-games/otaku-beat-em-up/BeatEmUpGame.tsx',
  'app/mini-games/petal-storm-rhythm/page.tsx',
  'app/mini-games/_shared/GameAvatarIntegration.tsx',
  'app/mini-games/_shared/GameAvatarRenderer.tsx',
  'app/mini-games/_shared/GameShellV2.tsx',
  'app/shop/product/[id]/ProductClient.tsx',
  'app/stores/audioStore.ts',
  'components/arcade/games/NekoLapDance.tsx',
  'components/avatar/AvatarEditor.tsx',
  'components/avatar/AvatarSystem.tsx',
  'components/GameControls.tsx',
  'components/hero/InteractivePetals.tsx',
  'lib/analytics/session-tracker.ts',
  'lib/lighting/dynamic-lighting.ts',
  'lib/procedural/anime-style-filters.ts',
  'lib/procedural/cel-shaded-assets.ts',
];

// Simple patterns to fix
const fixes = [
  // Unused variables in destructuring
  {
    pattern: /const\s+(\w+)\s*=\s*([^;]+);/g,
    fix: (match, varName, assignment) => {
      if (varName && !varName.startsWith('_')) {
        return match.replace(varName, `_${varName}`);
      }
      return match;
    },
  },
  // Unused function parameters
  {
    pattern: /\(([^)]*)\)\s*=>/g,
    fix: (match, params) => {
      const fixedParams = params
        .split(',')
        .map((param) => {
          const trimmed = param.trim();
          if (
            trimmed &&
            !trimmed.startsWith('_') &&
            !trimmed.includes('=') &&
            !trimmed.includes(':')
          ) {
            return `_${trimmed}`;
          }
          return trimmed;
        })
        .join(', ');
      return match.replace(params, fixedParams);
    },
  },
];

async function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Apply simple prefix fixes for known unused variables
    const knownUnused = [
      'isDragging',
      'filteredParts',
      'showShop',
      'setShowShop',
      'pickups',
      'enemySpawnTimer',
      'saveOnExit',
      'autoSave',
      'projectilesRef',
      'sessionId',
      'achievements',
      'setPlayerSlots',
      'showError',
      'playingSounds',
      'earWiggle',
      'setEarWiggle',
      'tailSway',
      'setTailSway',
      'direction',
      'setIsVisible',
      'setDailyLimit',
      'session',
      'lightId',
      'effectId',
      'distance',
      'rng',
      'angle',
    ];

    knownUnused.forEach((varName) => {
      const regex = new RegExp(`\\b${varName}\\b(?=\\s*[=:,)])`, 'g');
      const newContent = content.replace(regex, `_${varName}`);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing unused variables...\n');

  let fixedCount = 0;

  for (const file of filesToProcess) {
    const wasFixed = await fixFile(file);
    if (wasFixed) fixedCount++;
  }

  console.log(`\n✨ Fixed ${fixedCount} files`);
  console.log('🔍 Run "npm run lint" to check remaining issues');
}

main().catch(console.error);
