import { describe, expect, it } from 'vitest';

import { extractAchievements } from '@/app/profile/achievements/_data/response';

describe('Commander achievements response boundary', () => {
  it('extracts the API achievement collection from its response envelope', () => {
    const achievement = {
      id: 'first-game',
      name: 'Welcome to the Garden',
      description: 'Play your first mini-game',
      icon: '',
      unlocked: false,
      rarity: 'common' as const,
    };

    expect(
      extractAchievements({
        ok: true,
        data: { achievements: [achievement] },
      }),
    ).toEqual([achievement]);
  });

  it('fails closed to an empty collection for malformed responses', () => {
    expect(extractAchievements(null)).toEqual([]);
    expect(extractAchievements({ ok: true, data: {} })).toEqual([]);
  });
});
