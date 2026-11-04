// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { POST as grantPetals } from '@/app/api/v1/petals/grant/route';
import { POST as earnPetals } from '@/app/api/petals/earn/route';
import { POST as earnGamePetals } from '@/app/api/v1/petals/earn/route';
import { POST as collectPetals } from '@/app/api/v1/petals/collect/route';
import { POST as unlockAchievement } from '@/app/api/v1/achievements/unlock/route';
import { POST as submitMiniGame } from '@/app/api/mini-games/submit/route';
import { POST as finishGame } from '@/app/api/games/finish/route';
import { POST as claimLegacyQuest } from '@/app/api/quests/route';

const legacyRoutes = [
  ['/api/v1/petals/grant', grantPetals],
  ['/api/petals/earn', earnPetals],
  ['/api/v1/petals/earn', earnGamePetals],
  ['/api/v1/petals/collect', collectPetals],
  ['/api/v1/achievements/unlock', unlockAchievement],
  ['/api/mini-games/submit', submitMiniGame],
  ['/api/games/finish', finishGame],
  ['/api/quests', claimLegacyQuest],
] as const;

describe('legacy reward mutation containment', () => {
  it.each(legacyRoutes)('%s rejects client-authored reward authority', async (_path, post) => {
    const response = await post();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'LEGACY_REWARD_ROUTE_DISABLED',
    });
  });
});
