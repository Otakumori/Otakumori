import { NextResponse } from 'next/server';

export const LEGACY_REWARD_ROUTE_DISABLED = 'LEGACY_REWARD_ROUTE_DISABLED';

/** Client-authored events are not authority to mutate rewards or the Petal ledger. */
export function legacyRewardRouteDisabled(canonicalPath: string) {
  return NextResponse.json(
    {
      ok: false,
      error: LEGACY_REWARD_ROUTE_DISABLED,
      message: 'This endpoint cannot authorize rewards from client-supplied events.',
      canonicalPath,
    },
    { status: 410 },
  );
}
