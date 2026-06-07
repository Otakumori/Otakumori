/**
 * Server-owned petal reward table.
 *
 * Petal-granting endpoints MUST NOT trust a client-supplied `amount`. Instead
 * they map a client-supplied action/reason to a fixed, server-controlled
 * reward defined here, then route the grant through `grantPetals()` which
 * additionally enforces per-source caps, daily caps, and rate limits.
 *
 * Keep rewards small for spammable client actions (petal clicks). High-value
 * grants (purchases, achievements) flow through their own server-side paths.
 */

import type { PetalSource } from './grant';

/**
 * Fixed rewards for low-trust, client-initiated "earn"/"click" actions.
 * All of these resolve to the `background_petal_click` source, which is the
 * most strictly rate-limited and daily-capped source in PETAL_RULES.
 */
const CLICK_EVENT_REWARDS: Record<string, number> = {
  cherry_blossom_click: 1,
  petal_click: 1,
  background_petal_click: 1,
  homepage_collection: 1,
};

/** Default reward when the reason is unknown but the request is authorized. */
const DEFAULT_CLICK_REWARD = 1;

export type ResolvedPetalReward = {
  amount: number;
  source: PetalSource;
};

/**
 * Resolve the server-owned reward for a client-initiated petal click/earn.
 * The returned amount is never derived from the request body.
 */
export function resolveClickReward(reason: unknown): ResolvedPetalReward {
  const key = typeof reason === 'string' ? reason.trim().toLowerCase() : '';
  const amount = CLICK_EVENT_REWARDS[key] ?? DEFAULT_CLICK_REWARD;
  return { amount, source: 'background_petal_click' };
}
