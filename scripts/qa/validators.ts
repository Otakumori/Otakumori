/**
 * QA Validators - Individual validation functions
 * Deterministic, static checks that don't require browser/runtime
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate avatar integration in game file
 */
export function validateAvatarIntegration(
  gameSlug: string,
  filePath: string,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(filePath)) {
    errors.push(`Game file not found: ${filePath}`);
    return { passed: false, errors, warnings };
  }

  const content = readFileSync(filePath, 'utf-8');

  // Check for avatar engine imports
  const hasUseGameAvatar = content.includes('useGameAvatar') || content.includes('@om/avatar-engine/gameIntegration');
  const hasAvatarRenderer = content.includes('AvatarRenderer') || content.includes('@om/avatar-engine/renderer');

  if (!hasUseGameAvatar && !hasAvatarRenderer) {
    errors.push(`Missing avatar integration: ${gameSlug} does not import useGameAvatar or AvatarRenderer`);
  }

  // Check for correct representation mode (if avatar is used)
  if (hasUseGameAvatar || hasAvatarRenderer) {
    const expectedModes: Record<string, string> = {
      'petal-samurai': 'fullBody',
      'otaku-beat-em-up': 'fullBody',
      'thigh-coliseum': 'fullBody',
      'petal-storm-rhythm': 'bust',
      'memory-match': 'portrait',
      'puzzle-reveal': 'portrait',
      'bubble-girl': 'chibi',
      'blossomware': 'chibi',
      'dungeon-of-desire': 'bust',
    };

    const expectedMode = expectedModes[gameSlug];
    if (expectedMode) {
      // Check if mode is used correctly (basic pattern matching)
      const modePattern = new RegExp(`mode[\\s]*[:=][\\s]*['"]${expectedMode}['"]`, 'i');
      if (!modePattern.test(content) && !content.includes(`representationConfig.mode`)) {
        warnings.push(`Representation mode may not match expected: ${expectedMode}`);
      }
    }
  }

  // Check for feature flag handling
  const hasFlagCheck = content.includes('isAvatarsEnabled') || content.includes('AVATARS_ENABLED');
  if ((hasUseGameAvatar || hasAvatarRenderer) && !hasFlagCheck) {
    warnings.push(`Avatar integration found but no AVATARS_ENABLED flag check detected`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate cel-shaded material usage
 */
export function validateCelShadedMaterials(filePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(filePath)) {
    return { passed: true, errors, warnings };
  }

  const content = readFileSync(filePath, 'utf-8');

  // Check for non-cel-shaded materials
  const hasMeshStandardMaterial = /new\s+THREE\.MeshStandardMaterial\s*\(/i.test(content);
  const hasMeshBasicMaterial = /new\s+THREE\.MeshBasicMaterial\s*\(/i.test(content);
  const hasMeshPhongMaterial = /new\s+THREE\.MeshPhongMaterial\s*\(/i.test(content);

  // Check for cel-shaded material imports
  const hasCelShadedImport = content.includes('@om/avatar-engine/materials') ||
    content.includes('createCelShadedMaterial') ||
    content.includes('skinMaterialProcedural') ||
    content.includes('hairGlowMaterial') ||
    content.includes('outfitMaterialProcedural');

  if (hasMeshStandardMaterial || hasMeshBasicMaterial || hasMeshPhongMaterial) {
    if (!hasCelShadedImport) {
      errors.push(`Found non-cel-shaded materials (MeshStandardMaterial/MeshBasicMaterial/MeshPhongMaterial) without cel-shaded imports`);
    } else {
      warnings.push(`Found non-cel-shaded materials but also has cel-shaded imports - may need replacement`);
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate shared UI components usage
 */
export function validateSharedUI(filePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(filePath)) {
    return { passed: true, errors, warnings };
  }

  const content = readFileSync(filePath, 'utf-8');

  // Check for GameHUD import or useGameHud hook (which provides GameHUD)
  const hasGameHUD = content.includes('GameHUD') || 
                     content.includes('app/mini-games/_shared/GameHUD') ||
                     content.includes('useGameHud') ||
                     content.includes('app/mini-games/_shared/useGameHud');
  // Check for GameOverlay import
  const hasGameOverlay = content.includes('GameOverlay') || 
                         content.includes('app/mini-games/_shared/GameOverlay') ||
                         content.includes('../_shared/GameOverlay');

  if (!hasGameHUD) {
    warnings.push(`GameHUD component not found - should be added for consistent UI`);
  }

  if (!hasGameOverlay) {
    warnings.push(`GameOverlay component not found - should be added for instructions/win/lose screens`);
  }

  // Check for restart handler
  const hasRestartHandler = /onRestart|handleRestart|restart/i.test(content);
  if (!hasRestartHandler && hasGameOverlay) {
    warnings.push(`GameOverlay found but no restart handler detected`);
  }

  // Check for "Back to Arcade" link
  const hasBackLink = content.includes('/mini-games') || content.includes('Back to Arcade') || content.includes('Back to Hub');
  if (!hasBackLink) {
    warnings.push(`No "Back to Arcade" link found`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate game mechanics (basic pattern checks)
 */
export function validateGameMechanics(gameSlug: string, filePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(filePath)) {
    return { passed: true, errors, warnings };
  }

  const content = readFileSync(filePath, 'utf-8');

  // Game-specific mechanics checks
  if (gameSlug === 'memory-match') {
    // Check for match validation logic
    if (!/match|pair|flip/i.test(content)) {
      warnings.push(`Memory Match: Match/pair logic may be missing`);
    }
    // Check for time limit enforcement
    if (!/time|timer|timeLeft/i.test(content)) {
      warnings.push(`Memory Match: Timer logic may be missing`);
    }
  }

  if (gameSlug === 'bubble-girl') {
    // Check for physics/sandbox mechanics
    if (!/physics|sandbox|tool/i.test(content)) {
      warnings.push(`Bubble Girl: Physics/sandbox mechanics may be missing`);
    }
  }

  if (gameSlug === 'blossomware') {
    // Check for microgames/playlist mechanics
    if (!/microgame|playlist|streak/i.test(content)) {
      warnings.push(`Blossomware: Microgames/playlist mechanics may be missing`);
    }
  }

  if (gameSlug === 'puzzle-reveal') {
    // Check for combo cap (10x max)
    const comboPattern = /combo.*10|10.*combo|max.*10/i;
    if (!comboPattern.test(content) && /combo/i.test(content)) {
      warnings.push(`Puzzle Reveal: Combo cap (10x max) may not be enforced`);
    }
    // Check for energy system
    if (!/energy/i.test(content)) {
      warnings.push(`Puzzle Reveal: Energy system may be missing`);
    }
  }

  // General checks for exploit patterns
  if (/setScore.*\+\+|score\s*\+\+|\+\+\s*score/i.test(content)) {
    warnings.push(`Potential score manipulation pattern detected - ensure proper validation`);
  }

  if (/while\s*\(true\)|for\s*\(\s*;\s*;\s*\)/i.test(content)) {
    warnings.push(`Infinite loop pattern detected - ensure proper exit conditions`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate feature flag usage
 */
export function validateFeatureFlags(filePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(filePath)) {
    return { passed: true, errors, warnings };
  }

  const content = readFileSync(filePath, 'utf-8');

  // Check for AVATARS_ENABLED flag check
  const hasAvatarFlag = content.includes('AVATARS_ENABLED') || content.includes('isAvatarsEnabled');
  const hasAvatarUsage = content.includes('AvatarRenderer') || content.includes('useGameAvatar');

  if (hasAvatarUsage && !hasAvatarFlag) {
    warnings.push(`Avatar usage found but no AVATARS_ENABLED flag check - should handle fallback`);
  }

  // Check for REQUIRE_AUTH_FOR_MINI_GAMES flag
  const hasAuthFlag = content.includes('REQUIRE_AUTH_FOR_MINI_GAMES') || content.includes('requireAuth');
  // This is optional, so just a warning
  if (!hasAuthFlag) {
    // Not an error, just informational
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

