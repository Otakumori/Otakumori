import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  BUBBLE_OBJECTIVES,
  DUNGEON_FINAL_FLOOR,
  MAID_SHIFT_MS,
  THIGH_TARGET_DISTANCE,
  bubbleObjectiveForRun,
  canonicalSecondaryGameId,
  dungeonEnemyGrammar,
  maidShiftPhase,
  nextPuzzleContentIndex,
} from '@/app/mini-games/_shared/secondaryGameContracts';
import { PUZZLE_REVEAL_CONTENT } from '@/app/mini-games/(games)/puzzle-reveal/puzzleRevealContent';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('secondary game launch closure', () => {
  it('normalizes Bubble Ragdoll while retaining the historical alias', () => {
    expect(canonicalSecondaryGameId('bubble-girl')).toBe('bubble-ragdoll');
    expect(canonicalSecondaryGameId('bubble-ragdoll')).toBe('bubble-ragdoll');
    expect(
      new Set(
        BUBBLE_OBJECTIVES.map(
          (objective) => bubbleObjectiveForRun(BUBBLE_OBJECTIVES.indexOf(objective)).id,
        ),
      ).size,
    ).toBe(3);
  });

  it('rotates Puzzle Reveal deterministically without an immediate repeat', () => {
    expect(PUZZLE_REVEAL_CONTENT).toHaveLength(2);
    expect(nextPuzzleContentIndex(0, 2, 2)).toBe(1);
    expect(nextPuzzleContentIndex(1, 2, 2)).toBe(0);
  });

  it('defines finite Thigh, Dungeon, and Maid runs', () => {
    expect(THIGH_TARGET_DISTANCE).toBe(10_000);
    expect(DUNGEON_FINAL_FLOOR).toBe(10);
    expect(dungeonEnemyGrammar(4, 2)).toBe('wraith');
    expect(dungeonEnemyGrammar(10, 0)).toBe('demon_lord');
    expect(maidShiftPhase(MAID_SHIFT_MS - 1)).toBe('rush');
    expect(maidShiftPhase(MAID_SHIFT_MS)).toBe('complete');
  });

  it('keeps every game on shared result/replay and reward-free PB semantics', () => {
    const wrappers = [
      'bubble-ragdoll/Game.tsx',
      'puzzle-reveal/page.tsx',
      'thigh-coliseum/Game.tsx',
      'dungeon-of-desire/Game.tsx',
      'maid-cafe-manager/Game.tsx',
    ].map((name) => source(`app/mini-games/(games)/${name}`));

    for (const wrapper of wrappers) {
      expect(wrapper).toContain('recordResult({');
      expect(wrapper).toContain('personalBest');
      expect(wrapper).toMatch(/onRestart|handleRestart/);
      expect(wrapper).not.toContain("fetch('/api/v1/leaderboards/");
    }
  });

  it('fails Puzzle Reveal closed when approved art cannot load', () => {
    const game = source('app/mini-games/(games)/puzzle-reveal/EnhancedTileGame.tsx');
    expect(game).toContain('Artwork unavailable');
    expect(game).not.toContain('generateFallbackImage');
  });
});
