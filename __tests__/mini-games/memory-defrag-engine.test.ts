import { describe, expect, it } from 'vitest';
import {
  buildMemoryDefragAchievementIntent,
  buildMemoryDefragRewardIntent,
  createMemoryDefragGame,
  getMemoryDefragElapsedMs,
  MEMORY_DEFRAG_CONFIGS,
  pauseMemoryDefrag,
  resolveMemoryMismatch,
  resumeMemoryDefrag,
  revealMemoryCard,
} from '@/app/mini-games/(games)/memory-match/memoryDefragEngine';

type MemoryDefragState = ReturnType<typeof createMemoryDefragGame>;

function findPairIds(cards: MemoryDefragState['cards']) {
  const [first] = cards;
  const second = cards.find((card) => card.pairId === first.pairId && card.id !== first.id);
  if (!first || !second) throw new Error('fixture pair missing');
  return [first.id, second.id] as const;
}

function findMismatchIds(cards: MemoryDefragState['cards']) {
  const [first] = cards;
  const second = cards.find((card) => card.pairId !== first.pairId);
  if (!first || !second) throw new Error('fixture mismatch missing');
  return [first.id, second.id] as const;
}

describe('memory defrag engine', () => {
  it('creates deterministic boards with exactly two cards per pair', () => {
    const first = createMemoryDefragGame({ difficulty: 'keeper', seed: 'stable-seed', nowMs: 0 });
    const second = createMemoryDefragGame({ difficulty: 'keeper', seed: 'stable-seed', nowMs: 0 });

    expect(first.cards.map((card) => card.id)).toEqual(second.cards.map((card) => card.id));
    expect(first.cards).toHaveLength(MEMORY_DEFRAG_CONFIGS.keeper.pairs * 2);

    const pairCounts = new Map<string, number>();
    first.cards.forEach((card) => {
      pairCounts.set(card.pairId, (pairCounts.get(card.pairId) ?? 0) + 1);
    });

    expect([...pairCounts.values()]).toEqual(Array(MEMORY_DEFRAG_CONFIGS.keeper.pairs).fill(2));
  });

  it('reveals a first card without counting a move', () => {
    const game = createMemoryDefragGame({ seed: 'first-card', nowMs: 0 });
    const next = revealMemoryCard(game, game.cards[0].id, 100);

    expect(next.phase).toBe('playing');
    expect(next.moves).toBe(0);
    expect(next.revealedIds).toEqual([game.cards[0].id]);
    expect(next.cards.find((card) => card.id === game.cards[0].id)?.state).toBe('revealed');
  });

  it('matches a second card, increments streak, and keeps matched cards face up', () => {
    let game = createMemoryDefragGame({ seed: 'match', nowMs: 0 });
    const [firstId, secondId] = findPairIds(game.cards);

    game = revealMemoryCard(game, firstId, 100);
    game = revealMemoryCard(game, secondId, 200);

    expect(game.moves).toBe(1);
    expect(game.matchedPairs).toBe(1);
    expect(game.streak).toBe(1);
    expect(game.cards.find((card) => card.id === firstId)?.state).toBe('matched');
    expect(game.cards.find((card) => card.id === secondId)?.state).toBe('matched');
  });

  it('locks input for a mismatch until the mismatch resolves', () => {
    let game = createMemoryDefragGame({ seed: 'mismatch', nowMs: 0 });
    const [firstId, secondId] = findMismatchIds(game.cards);
    const ignoredId = game.cards.find((card) => card.id !== firstId && card.id !== secondId)?.id;

    game = revealMemoryCard(game, firstId, 100);
    game = revealMemoryCard(game, secondId, 200);
    const locked = revealMemoryCard(game, ignoredId ?? firstId, 250);

    expect(game.phase).toBe('resolving');
    expect(locked.lastEvent).toBe('ignored');

    const resolved = resolveMemoryMismatch(game, 1200);
    expect(resolved.phase).toBe('playing');
    expect(resolved.revealedIds).toEqual([]);
    expect(resolved.cards.find((card) => card.id === firstId)?.state).toBe('hidden');
    expect(resolved.cards.find((card) => card.id === secondId)?.state).toBe('hidden');
  });

  it('detects a perfect win and emits reward and achievement facts without granting economy', () => {
    let game = createMemoryDefragGame({ difficulty: 'initiate', seed: 'perfect', nowMs: 0 });
    const pairIds = new Map<string, string[]>();
    game.cards.forEach((card) => {
      pairIds.set(card.pairId, [...(pairIds.get(card.pairId) ?? []), card.id]);
    });

    let now = 100;
    for (const ids of pairIds.values()) {
      game = revealMemoryCard(game, ids[0], now);
      now += 100;
      game = revealMemoryCard(game, ids[1], now);
      now += 100;
    }

    const rewardIntent = buildMemoryDefragRewardIntent(game, now);
    const achievementIntent = buildMemoryDefragAchievementIntent(game, now);

    expect(game.phase).toBe('won');
    expect(rewardIntent?.economyAuthority).toBe('external');
    expect(rewardIntent?.facts.perfectClear).toBe(true);
    expect(achievementIntent?.facts).toContain('memory_defrag_perfect_clear');
  });

  it('pauses elapsed time while hidden and resumes without corrupting revealed state', () => {
    let game = createMemoryDefragGame({ seed: 'pause', nowMs: 0 });
    const firstId = game.cards[0].id;

    game = revealMemoryCard(game, firstId, 100);
    game = pauseMemoryDefrag(game, 500);
    const pausedElapsed = getMemoryDefragElapsedMs(game, 5000);
    game = resumeMemoryDefrag(game, 5000);

    expect(pausedElapsed).toBe(500);
    expect(game.phase).toBe('playing');
    expect(game.cards.find((card) => card.id === firstId)?.state).toBe('revealed');
    expect(getMemoryDefragElapsedMs(game, 5500)).toBe(1000);
  });
});
