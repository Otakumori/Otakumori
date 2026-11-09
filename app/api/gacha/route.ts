import { legacyRewardRouteDisabled } from '@/app/lib/petals/legacyRewardRoute';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  return legacyRewardRouteDisabled('/petal-shop');
}
