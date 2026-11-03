import { legacyRewardRouteDisabled } from '@/app/lib/petals/legacyRewardRoute';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST() {
  return legacyRewardRouteDisabled('/api/v1/petals/wallet');
}
