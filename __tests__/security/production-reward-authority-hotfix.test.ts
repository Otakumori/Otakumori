// @vitest-environment node

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { POST as pullFreeGacha } from '@/app/api/gacha/route';
import { POST as awardTitle } from '@/app/api/titles/award/route';
import { POST as earnLegacyPetals, GET as getLegacyPetals } from '@/app/api/petals/route';
import { POST as earnPetals } from '@/app/api/petals/earn/route';
import { POST as earnGamePetals } from '@/app/api/v1/petals/earn/route';
import { POST as grantPetals } from '@/app/api/v1/petals/grant/route';
import { POST as collectPetals } from '@/app/api/v1/petals/collect/route';
import { POST as unlockAchievement } from '@/app/api/v1/achievements/unlock/route';
import {
  POST as unlockUserAchievement,
  GET as getUserAchievements,
} from '@/app/api/v1/achievements/[userId]/route';
import { POST as submitMiniGame } from '@/app/api/mini-games/submit/route';
import { POST as finishGame } from '@/app/api/games/finish/route';
import { POST as claimLegacyQuest, GET as getQuests } from '@/app/api/quests/route';
import {
  POST as submitLeaderboard,
  GET as getLeaderboard,
} from '@/app/api/v1/leaderboards/[gameId]/route';

type RetiredPost = (...args: unknown[]) => Promise<Response>;

const retiredRoutes = [
  ['/api/gacha', pullFreeGacha],
  ['/api/titles/award', awardTitle],
  ['/api/petals', earnLegacyPetals],
  ['/api/petals/earn', earnPetals],
  ['/api/v1/petals/earn', earnGamePetals],
  ['/api/v1/petals/grant', grantPetals],
  ['/api/v1/petals/collect', collectPetals],
  ['/api/v1/achievements/unlock', unlockAchievement],
  ['/api/v1/achievements/[userId]', unlockUserAchievement],
  ['/api/mini-games/submit', submitMiniGame],
  ['/api/games/finish', finishGame],
  ['/api/quests', claimLegacyQuest],
  ['/api/v1/leaderboards/[gameId]', submitLeaderboard],
] as const satisfies ReadonlyArray<readonly [string, RetiredPost]>;

const requestVariants = [
  undefined,
  new Request('https://www.otaku-mori.com/retired', { method: 'POST' }),
  new Request('https://www.otaku-mori.com/retired', {
    method: 'POST',
    headers: { authorization: 'Bearer test-only', 'content-type': 'application/json' },
    body: '{"amount":999999,"score":999999,"achievementCode":"forged"}',
  }),
] as const;

describe('Production reward-authority containment', () => {
  it.each(retiredRoutes)('%s rejects client-authored reward authority', async (_path, post) => {
    for (const request of requestVariants) {
      const response = await post(request);

      expect(response.status).toBe(410);
      await expect(response.json()).resolves.toMatchObject({
        ok: false,
        error: 'LEGACY_REWARD_ROUTE_DISABLED',
      });
    }
  });

  it('stays fail-closed for repeated and concurrent submissions', async () => {
    const attempts = await Promise.all(
      Array.from({ length: 12 }, () =>
        pullFreeGacha(
          new Request('https://www.otaku-mori.com/api/gacha', {
            method: 'POST',
            headers: { authorization: 'Bearer test-only' },
          }) as never,
        ),
      ),
    );

    expect(attempts).toHaveLength(12);
    expect(attempts.every((response) => response.status === 410)).toBe(true);
  });

  it('keeps legitimate read-only handlers exported and retires the mock achievement read', async () => {
    expect(getLegacyPetals).toBeTypeOf('function');
    expect(getQuests).toBeTypeOf('function');
    expect(getLeaderboard).toBeTypeOf('function');

    const response = await getUserAchievements();
    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      canonicalPath: '/api/v1/achievements/me',
    });
  });

  it('removes database-writing fallbacks from the retired handlers', () => {
    const routeFiles = [
      'app/api/gacha/route.ts',
      'app/api/titles/award/route.ts',
      'app/api/petals/earn/route.ts',
      'app/api/v1/petals/earn/route.ts',
      'app/api/v1/petals/grant/route.ts',
      'app/api/v1/petals/collect/route.ts',
      'app/api/v1/achievements/unlock/route.ts',
      'app/api/mini-games/submit/route.ts',
      'app/api/games/finish/route.ts',
    ];

    for (const routeFile of routeFiles) {
      const source = readFileSync(join(process.cwd(), routeFile), 'utf8');
      expect(source).not.toMatch(/(?:grantPetals|awardPetals|petalLedger|petalWallet)/);
      expect(source).not.toMatch(
        /(?:achievement|userAchievement|inventoryItem)\.(?:create|upsert)/i,
      );
    }

    const achievementsSource = readFileSync(
      join(process.cwd(), 'app/api/v1/achievements/[userId]/route.ts'),
      'utf8',
    );
    expect(achievementsSource).not.toContain('return success without persisting');
    expect(achievementsSource).not.toContain('petalsAwarded');

    const legacyPetalsSource = readFileSync(join(process.cwd(), 'app/api/petals/route.ts'), 'utf8');
    expect(legacyPetalsSource).not.toContain('petalBalance: { increment: amount }');

    const questSource = readFileSync(join(process.cwd(), 'app/api/quests/route.ts'), 'utf8');
    expect(questSource).not.toContain('awardPetals');

    const leaderboardSource = readFileSync(
      join(process.cwd(), 'app/api/v1/leaderboards/[gameId]/route.ts'),
      'utf8',
    );
    expect(leaderboardSource).not.toContain('grantPetals');
    expect(leaderboardSource).not.toContain('leaderboardScore.create');
  });
});
