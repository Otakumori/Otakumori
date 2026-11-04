import { existsSync, readFileSync } from 'node:fs';
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
import {
  completePuzzleRevealRun,
  createPuzzleRevealRun,
  recordPuzzleRevealTile,
} from '@/app/mini-games/(games)/puzzle-reveal/puzzleRevealRun';

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
    expect(PUZZLE_REVEAL_CONTENT).toHaveLength(8);
    expect(new Set(PUZZLE_REVEAL_CONTENT.map(({ id }) => id)).size).toBe(8);
    for (const artwork of PUZZLE_REVEAL_CONTENT) {
      expect(existsSync(join(process.cwd(), 'public', artwork.url.replace(/^\//, '')))).toBe(true);
    }
    for (let current = 0; current < PUZZLE_REVEAL_CONTENT.length; current += 1) {
      expect(nextPuzzleContentIndex(current, 2, PUZZLE_REVEAL_CONTENT.length)).not.toBe(current);
    }
  });

  it('keeps the completed artwork visible and moves results into a diegetic recovery record', () => {
    const game = source('app/mini-games/(games)/puzzle-reveal/EnhancedTileGame.tsx');
    const page = source('app/mini-games/(games)/puzzle-reveal/page.tsx');

    expect(game).toContain('The corrupted memory has been fully restored.');
    expect(game).toContain('Restore next artifact');
    expect(game).toContain('Return to hub');
    expect(game).toContain('!tile.isRevealing');
    expect(game).toContain('completeGame(newScore)');
    expect(game).toContain('pointer-events-none absolute left-4 top-4');
    expect(game).not.toContain('Masterpiece Revealed!');
    expect(game).not.toContain('window.location.reload()');
    expect(page).toContain("gameState === 'paused' || gameState === 'win'");
  });

  it('completes Puzzle Reveal once from current tile state and resets cleanly for replay', () => {
    let progress = createPuzzleRevealRun(0);
    const premature = recordPuzzleRevealTile(progress, 100);
    expect(premature).toMatchObject({ accepted: false, shouldComplete: false });
    expect(completePuzzleRevealRun(premature.progress).didComplete).toBe(false);

    progress = createPuzzleRevealRun(3);
    const first = recordPuzzleRevealTile(progress, 100);
    expect(first).toMatchObject({ accepted: true, shouldComplete: false });
    expect(first.progress).toMatchObject({ tilesRevealed: 1, score: 100 });

    const second = recordPuzzleRevealTile(first.progress, 150);
    expect(second).toMatchObject({ accepted: true, shouldComplete: false });

    const final = recordPuzzleRevealTile(second.progress, 200);
    expect(final).toMatchObject({ accepted: true, shouldComplete: true });
    expect(final.progress).toMatchObject({ tilesRevealed: 3, score: 450 });

    const repeatedInput = recordPuzzleRevealTile(final.progress, 999);
    expect(repeatedInput).toMatchObject({ accepted: false, shouldComplete: false });
    expect(repeatedInput.progress.score).toBe(450);

    const completed = completePuzzleRevealRun(final.progress);
    expect(completed.didComplete).toBe(true);
    expect(completePuzzleRevealRun(completed.progress).didComplete).toBe(false);

    const replay = createPuzzleRevealRun(3);
    expect(recordPuzzleRevealTile(replay, 100)).toMatchObject({
      accepted: true,
      shouldComplete: false,
    });
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
