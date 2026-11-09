import { legacyRewardRouteDisabled } from '@/app/lib/petals/legacyRewardRoute';

export async function GET() {
  return legacyRewardRouteDisabled('/api/v1/achievements/me');
}

export async function POST() {
  return legacyRewardRouteDisabled('/api/v1/games/achievements');
}

export const runtime = 'nodejs';
