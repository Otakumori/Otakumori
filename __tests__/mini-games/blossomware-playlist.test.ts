import { describe, expect, it } from 'vitest';

import {
  BLOSSOMWARE_CLASSIC_SEED,
  BLOSSOMWARE_SHORT_ROUNDS,
  buildBlossomwarePlaylist,
  getBlossomwareDailySeed,
} from '@/components/arcade/blossomwarePlaylist';
import type { EngineGame } from '@/components/arcade/types';

const playlist = Array.from({ length: 11 }, (_, index) => ({
  id: `game-${index + 1}`,
  label: `Game ${index + 1}`,
  durationSec: 5,
  component: (() => null) as EngineGame['component'],
}));

const ids = (games: readonly EngineGame[]) => games.map((game) => game.id);

describe('Blossomware playlist variants', () => {
  it('preserves the authored classic order without mutating the registry', () => {
    const classic = buildBlossomwarePlaylist(playlist, 'classic', BLOSSOMWARE_CLASSIC_SEED);

    expect(ids(classic)).toEqual(ids(playlist));
    expect(classic).not.toBe(playlist);
  });

  it('derives the same bounded quick playlist from the same seed', () => {
    const first = buildBlossomwarePlaylist(playlist, 'short', 'quick-review-seed');
    const second = buildBlossomwarePlaylist(playlist, 'short', 'quick-review-seed');

    expect(first).toHaveLength(BLOSSOMWARE_SHORT_ROUNDS);
    expect(ids(first)).toEqual(ids(second));
    expect(new Set(ids(first))).toHaveLength(BLOSSOMWARE_SHORT_ROUNDS);
    expect(ids(playlist)).toEqual(Array.from({ length: 11 }, (_, index) => `game-${index + 1}`));
  });

  it('uses all authored microgames in a reproducible daily shuffle', () => {
    const first = buildBlossomwarePlaylist(playlist, 'daily', 'daily-2026-10-24');
    const second = buildBlossomwarePlaylist(playlist, 'daily', 'daily-2026-10-24');

    expect(ids(first)).toEqual(ids(second));
    expect(first).toHaveLength(playlist.length);
    expect(new Set(ids(first))).toEqual(new Set(ids(playlist)));
    expect(ids(first)).not.toEqual(ids(playlist));
  });

  it('derives a stable local-calendar daily seed', () => {
    expect(getBlossomwareDailySeed(new Date(2026, 9, 24, 23, 59))).toBe('daily-2026-10-24');
  });
});
