/**
 * NSFW Filter Configuration
 * Centralized toggle for NSFW content filtering
 */

import { clientEnv } from '@/env/client';

/**
 * Whether NSFW content filtering is enabled
 * Set to false to disable all NSFW filtering temporarily
 */
export const NSFW_FILTER_ENABLED = clientEnv.NEXT_PUBLIC_NSFW_FILTER_ENABLED !== 'false';

/**
 * Check if NSFW filtering should be applied
 * Returns false if filtering is disabled globally
 */
export function shouldFilterNSFW(): boolean {
  return NSFW_FILTER_ENABLED;
}
