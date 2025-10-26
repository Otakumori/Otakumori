/**
 * NSFW Policy Helper (Server-Only)
 *
 * Single source of truth for NSFW content access policy.
 * Checks age verification cookie, Clerk adult verification, and global override.
 */

import 'server-only';
import { cookies } from 'next/headers';
import { auth, currentUser } from '@clerk/nextjs/server';
import { env } from '@/env';

export interface NSFWPolicy {
  nsfwAllowed: boolean;
}

/**
 * Get NSFW access policy from request context
 *
 * Checks three sources in order:
 * 1. om_age_ok cookie (set by age verification API)
 * 2. Clerk user adultVerified metadata
 * 3. NSFW_GLOBAL environment variable (for testing)
 *
 * @returns Policy object with nsfwAllowed flag
 */
export async function getPolicyFromRequest(): Promise<NSFWPolicy> {
  const cookieStore = await cookies();
  const ageFlag = cookieStore.get('om_age_ok')?.value === '1';

  // Check Clerk adult verification if user is authenticated
  let adultVerified = false;
  try {
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      adultVerified = user?.publicMetadata?.adultVerified === true;
    }
  } catch (error) {
    // If auth check fails, continue with cookie/global checks only
    console.warn('Failed to check Clerk adult verification:', error);
  }

  // Global override for testing (never use in production with "on")
  const global = (env.NSFW_GLOBAL ?? 'off').toLowerCase() === 'on';

  return { nsfwAllowed: ageFlag || adultVerified || global };
}

/**
 * Synchronous version that only checks cookie (for middleware use)
 *
 * @param req - Request object with cookies
 * @returns Policy object with nsfwAllowed flag
 */
export function getPolicyFromRequestSync(req: Request): NSFWPolicy {
  const cookieHeader = req.headers.get('cookie') || '';
  const ageFlag = cookieHeader.includes('om_age_ok=1');
  const global = (env.NSFW_GLOBAL ?? 'off').toLowerCase() === 'on';

  return { nsfwAllowed: ageFlag || global };
}
