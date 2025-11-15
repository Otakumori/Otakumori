/**
 * QA Report Formatting Utilities
 * Formats validation results into human-readable reports
 */

import type { ValidationResult } from './validators';

export interface GameQAResult {
  game: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    avatar: ValidationResult;
    materials: ValidationResult;
    ui: ValidationResult;
    mechanics: ValidationResult;
    flags: ValidationResult;
  };
}

export interface QASummary {
  totalGames: number;
  passedGames: number;
  failedGames: number;
  totalErrors: number;
  totalWarnings: number;
  results: GameQAResult[];
}

/**
 * Format a single game result for console output
 */
export function formatGameResult(result: GameQAResult): string {
  const status = result.passed ? '✅ PASS' : '❌ FAIL';
  const lines: string[] = [];

  lines.push(`\n${status} ${result.game.toUpperCase()}`);
  lines.push('─'.repeat(50));

  // Avatar check
  if (result.checks.avatar.errors.length > 0 || result.checks.avatar.warnings.length > 0) {
    lines.push('  Avatar Integration:');
    result.checks.avatar.errors.forEach((err) => lines.push(`    ❌ ${err}`));
    result.checks.avatar.warnings.forEach((warn) => lines.push(`    ⚠️  ${warn}`));
  } else {
    lines.push('  Avatar Integration: ✅');
  }

  // Materials check
  if (result.checks.materials.errors.length > 0 || result.checks.materials.warnings.length > 0) {
    lines.push('  Cel-Shaded Materials:');
    result.checks.materials.errors.forEach((err) => lines.push(`    ❌ ${err}`));
    result.checks.materials.warnings.forEach((warn) => lines.push(`    ⚠️  ${warn}`));
  } else {
    lines.push('  Cel-Shaded Materials: ✅');
  }

  // UI check
  if (result.checks.ui.errors.length > 0 || result.checks.ui.warnings.length > 0) {
    lines.push('  Shared UI Components:');
    result.checks.ui.errors.forEach((err) => lines.push(`    ❌ ${err}`));
    result.checks.ui.warnings.forEach((warn) => lines.push(`    ⚠️  ${warn}`));
  } else {
    lines.push('  Shared UI Components: ✅');
  }

  // Mechanics check
  if (result.checks.mechanics.errors.length > 0 || result.checks.mechanics.warnings.length > 0) {
    lines.push('  Game Mechanics:');
    result.checks.mechanics.errors.forEach((err) => lines.push(`    ❌ ${err}`));
    result.checks.mechanics.warnings.forEach((warn) => lines.push(`    ⚠️  ${warn}`));
  } else {
    lines.push('  Game Mechanics: ✅');
  }

  // Flags check
  if (result.checks.flags.errors.length > 0 || result.checks.flags.warnings.length > 0) {
    lines.push('  Feature Flags:');
    result.checks.flags.errors.forEach((err) => lines.push(`    ❌ ${err}`));
    result.checks.flags.warnings.forEach((warn) => lines.push(`    ⚠️  ${warn}`));
  } else {
    lines.push('  Feature Flags: ✅');
  }

  return lines.join('\n');
}

/**
 * Format summary report
 */
export function formatSummary(summary: QASummary): string {
  const lines: string[] = [];

  lines.push('\n' + '='.repeat(60));
  lines.push('MINI-GAMES QA SUMMARY');
  lines.push('='.repeat(60));

  lines.push(`\nTotal Games: ${summary.totalGames}`);
  lines.push(`Passed: ${summary.passedGames} ✅`);
  lines.push(`Failed: ${summary.failedGames} ❌`);
  lines.push(`Total Errors: ${summary.totalErrors}`);
  lines.push(`Total Warnings: ${summary.totalWarnings}`);

  if (summary.failedGames > 0) {
    lines.push('\n❌ FAILED GAMES:');
    summary.results
      .filter((r) => !r.passed)
      .forEach((result) => {
        lines.push(`  - ${result.game} (${result.errors.length} errors)`);
      });
  }

  if (summary.totalWarnings > 0) {
    lines.push('\n⚠️  WARNINGS:');
    summary.results.forEach((result) => {
      if (result.warnings.length > 0) {
        lines.push(`  ${result.game}: ${result.warnings.length} warning(s)`);
      }
    });
  }

  lines.push('\n' + '='.repeat(60));

  return lines.join('\n');
}

/**
 * Generate summary from results
 */
export function generateSummary(results: GameQAResult[]): QASummary {
  const totalGames = results.length;
  const passedGames = results.filter((r) => r.passed).length;
  const failedGames = totalGames - passedGames;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  return {
    totalGames,
    passedGames,
    failedGames,
    totalErrors,
    totalWarnings,
    results,
  };
}

