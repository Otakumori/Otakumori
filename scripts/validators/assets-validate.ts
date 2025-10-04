#!/usr/bin/env tsx

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface AssetRole {
  [key: string]: string | undefined;
}

interface CreditsEntry {
  kind: string;
  title: string;
  creator: string;
  license: string;
  source: string;
}

interface Manifest {
  [category: string]: {
    [key: string]: string;
  };
}

function validateAssets() {
  // '⌕ Validating assets...\n'

  // Load files
  const rolesPath = join(process.cwd(), 'assets-roles.json');
  const manifestPath = join(process.cwd(), 'public/assets/manifest.json');
  const creditsPath = join(process.cwd(), 'public/assets/credits.json');

  if (!existsSync(rolesPath)) {
    console.error(' assets-roles.json not found');
    return false;
  }

  if (!existsSync(manifestPath)) {
    console.error(' manifest.json not found');
    return false;
  }

  if (!existsSync(creditsPath)) {
    console.error(' credits.json not found');
    return false;
  }

  const roles: { [game: string]: AssetRole } = JSON.parse(readFileSync(rolesPath, 'utf8'));
  const manifest: Manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const credits: CreditsEntry[] = JSON.parse(readFileSync(creditsPath, 'utf8'));

  // Move resolveFromManifest inside this function so it has access to manifest
  function resolveFromManifest(path: string): string | null {
    // Resolve dot-path like "bg.oakWoods" to manifest.bg.oakWoods
    const parts = path.split('.');
    let current: any = manifest;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    return typeof current === 'string' ? current : null;
  }

  let hasErrors = false;

  // Validate bubble-ragdoll specifically
  const bubbleGame = roles['bubble-ragdoll'];
  if (bubbleGame) {
    // ' Validating bubble-ragdoll assets:'

    // Check required assets exist
    const requiredAssets = ['bg', 'bubbleSprite', 'popSfx', 'bounceSfx', 'failSfx'];
    for (const asset of requiredAssets) {
      if (!bubbleGame[asset]) {
        console.error(`   Missing ${asset}`);
        hasErrors = true;
      }
    }

    // Check theme fields
    const themeFields = [
      'themeAccent',
      'themeOverlayBg',
      'themeCreditsText',
      'themeCreditsUrl',
      'themePledgeLabel',
      'themePledgeUrl',
      'showCreditsInPause',
    ];
    for (const field of themeFields) {
      if (!bubbleGame[field]) {
        console.error(`   Missing theme field: ${field}`);
        hasErrors = true;
      }
    }

    // Validate showCreditsInPause value
    const showCredits = bubbleGame.showCreditsInPause;
    if (showCredits && !['always', 'once', 'never'].includes(showCredits)) {
      console.error(`   Invalid showCreditsInPause: ${showCredits} (must be always/once/never)`);
      hasErrors = true;
    }

    // Check if credits text exists and has matching credits entry
    if (bubbleGame.themeCreditsText) {
      const hasMatchingCredit = credits.some(
        (credit) =>
          credit.title.toLowerCase().includes('particle') ||
          credit.creator.toLowerCase().includes('kenney'),
      );
      if (!hasMatchingCredit) {
        console.warn(`    Credits text found but no matching entry in credits.json`);
      }
    }

    // '   bubble-ragdoll validation complete\n'
  }

  // Validate petal-collection specifically
  const petalGame = roles['petal-collection'];
  if (petalGame) {
    // ' Validating petal-collection assets:'

    // Check required assets exist
    const requiredAssets = ['bg', 'petalParticle', 'collectSfx', 'missSfx'];
    for (const asset of requiredAssets) {
      if (!petalGame[asset]) {
        console.error(`   Missing ${asset}`);
        hasErrors = true;
      }
    }

    // Check theme fields
    const themeFields = [
      'themeAccent',
      'themeOverlayBg',
      'themeCreditsText',
      'themeCreditsUrl',
      'themePledgeLabel',
      'themePledgeUrl',
      'showCreditsInPause',
    ];
    for (const field of themeFields) {
      if (!petalGame[field]) {
        console.error(`   Missing theme field: ${field}`);
        hasErrors = true;
      }
    }

    // '   petal-collection validation complete\n'
  }

  // Validate quick-math specifically
  const mathGame = roles['quick-math'];
  if (mathGame) {
    // ' Validating quick-math assets:'

    // Check required assets exist
    const requiredAssets = ['successSfx', 'failSfx'];
    for (const asset of requiredAssets) {
      if (!mathGame[asset]) {
        console.error(`   Missing ${asset}`);
        hasErrors = true;
      }
    }

    // Check theme fields
    const themeFields = [
      'themeAccent',
      'themeOverlayBg',
      'themeCreditsText',
      'themeCreditsUrl',
      'themePledgeLabel',
      'themePledgeUrl',
      'showCreditsInPause',
    ];
    for (const field of themeFields) {
      if (!mathGame[field]) {
        console.error(`   Missing theme field: ${field}`);
        hasErrors = true;
      }
    }

    // '   quick-math validation complete\n'
  }

  // Validate other games
  for (const [gameKey, gameRoles] of Object.entries(roles)) {
    if (gameKey === 'bubble-ragdoll') continue; // Already validated above

    // ` Validating ${gameKey}:`

    // Check if game has theme fields
    const hasThemeFields = [
      'themeCreditsText',
      'themeCreditsUrl',
      'themePledgeLabel',
      'themePledgeUrl',
    ].some((field) => gameRoles[field]);

    if (hasThemeFields) {
      // Must have showCreditsInPause
      if (!gameRoles.showCreditsInPause) {
        console.error(`   Has credits/pledge but missing showCreditsInPause`);
        hasErrors = true;
      } else if (!['always', 'once', 'never'].includes(gameRoles.showCreditsInPause)) {
        console.error(`   Invalid showCreditsInPause: ${gameRoles.showCreditsInPause}`);
        hasErrors = true;
      }
    }

    // Validate asset paths start with /assets/
    for (const [role, url] of Object.entries(gameRoles)) {
      if (typeof url === 'string' && !url.startsWith('/assets/') && url.includes('.')) {
        // Only check manifest paths (containing dots), not theme colors or other values
        const manifestPath = resolveFromManifest(url);
        if (manifestPath && !manifestPath.startsWith('/assets/')) {
          console.error(
            `   Asset for role ${role} in ${gameKey} must live under /public/assets/* (got: ${url})`,
          );
          hasErrors = true;
        }
      }
    }

    // `   ${gameKey} validation complete`
  }

  // Validate manifest paths
  // '\n Validating manifest paths...'

  function validateManifestPaths(obj: any, prefix: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        // Ensure all paths start with /assets/
        if (!value.startsWith('/assets/')) {
          console.error(
            `   Asset for ${currentPath} must live under /public/assets/* (got: ${value})`,
          );
          hasErrors = true;
        }

        const fullPath = join(process.cwd(), 'public', value);
        if (!existsSync(fullPath)) {
          console.warn(`    Asset not found: ${value}`);
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively validate nested objects
        validateManifestPaths(value, currentPath);
      }
    }
  }

  validateManifestPaths(manifest);

  if (hasErrors) {
    // '\n Validation failed with errors'
    return false;
  } else {
    // '\n All validations passed!'
    return true;
  }
}

// Run validation
if (require.main === module) {
  const success = validateAssets();
  process.exit(success ? 0 : 1);
}

export { validateAssets };
