#!/usr/bin/env tsx
/**
 * Mini-Games QA Validation Script
 * Runs static checks on all mini-games for avatar integration, materials, UI, mechanics, and flags
 *
 * Usage: pnpm mini-games:qa
 *
 * Exits with non-zero status if hard failures are found (errors, not warnings)
 */

import { existsSync } from 'fs';
import { join } from 'path';
import {
  validateAvatarIntegration,
  validateCelShadedMaterials,
  validateSharedUI,
  validateGameMechanics,
  validateFeatureFlags,
} from './qa/validators';
import { formatGameResult, formatSummary, generateSummary, type GameQAResult } from './qa/report';

const GAMES = [
  'petal-samurai',
  'memory-match',
  'otaku-beat-em-up',
  'bubble-girl',
  'petal-storm-rhythm',
  'blossomware',
  'dungeon-of-desire',
  'thigh-coliseum',
  'puzzle-reveal',
] as const;

/**
 * Validate a single game
 */
async function validateGame(gameSlug: string): Promise<GameQAResult> {
  const gamePath = join(process.cwd(), 'app', 'mini-games', gameSlug);
  const pagePath = join(gamePath, 'page.tsx');

  // Try to find game component files
  const possibleFiles = [
    pagePath,
    join(gamePath, 'Game.tsx'),
    join(
      gamePath,
      `${gameSlug
        .split('-')
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join('')}Game.tsx`,
    ),
  ];

  const gameFile = possibleFiles.find((f) => existsSync(f)) || pagePath;

  // Run all validators
  const avatarCheck = validateAvatarIntegration(gameSlug, gameFile);
  const materialsCheck = validateCelShadedMaterials(gameFile);
  const uiCheck = validateSharedUI(gameFile);
  const mechanicsCheck = validateGameMechanics(gameSlug, gameFile);
  const flagsCheck = validateFeatureFlags(gameFile);

  // Collect all errors and warnings
  const errors: string[] = [
    ...avatarCheck.errors,
    ...materialsCheck.errors,
    ...uiCheck.errors,
    ...mechanicsCheck.errors,
    ...flagsCheck.errors,
  ];

  const warnings: string[] = [
    ...avatarCheck.warnings,
    ...materialsCheck.warnings,
    ...uiCheck.warnings,
    ...mechanicsCheck.warnings,
    ...flagsCheck.warnings,
  ];

  const passed = errors.length === 0;

  return {
    game: gameSlug,
    passed,
    errors,
    warnings,
    checks: {
      avatar: avatarCheck,
      materials: materialsCheck,
      ui: uiCheck,
      mechanics: mechanicsCheck,
      flags: flagsCheck,
    },
  };
}

/**
 * Main QA runner
 */
async function runQA(): Promise<{ passed: boolean; summary: ReturnType<typeof generateSummary> }> {
  console.log('🔍 Running Mini-Games QA Validation...\n');

  const results: GameQAResult[] = [];

  for (const game of GAMES) {
    try {
      const result = await validateGame(game);
      results.push(result);
      console.log(formatGameResult(result));
    } catch (error) {
      console.error(`❌ Error validating ${game}:`, error);
      results.push({
        game,
        passed: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`],
        warnings: [],
        checks: {
          avatar: { passed: false, errors: [], warnings: [] },
          materials: { passed: false, errors: [], warnings: [] },
          ui: { passed: false, errors: [], warnings: [] },
          mechanics: { passed: false, errors: [], warnings: [] },
          flags: { passed: false, errors: [], warnings: [] },
        },
      });
    }
  }

  const summary = generateSummary(results);
  console.log(formatSummary(summary));

  // Pass if no errors (warnings are OK)
  const passed = summary.totalErrors === 0;

  return { passed, summary };
}

// CLI entry point - run if executed directly
runQA()
  .then(({ passed, summary }) => {
    if (!passed) {
      console.error('\n❌ QA Validation FAILED - Hard failures detected');
      console.error('Fix errors above before committing.\n');
      process.exit(1);
    } else {
      console.log('\n✅ QA Validation PASSED\n');
      if (summary.totalWarnings > 0) {
        console.log('⚠️  Some warnings were found but are non-blocking.\n');
      }
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('❌ QA script error:', error);
    process.exit(1);
  });

// Export for programmatic use
export { runQA, validateGame };
