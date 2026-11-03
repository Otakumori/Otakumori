import { legacyRewardRouteDisabled } from '@/app/lib/petals/legacyRewardRoute';

export const runtime = 'nodejs';

export async function POST() {
  return legacyRewardRouteDisabled('/api/v1/games/personal-best');
}
