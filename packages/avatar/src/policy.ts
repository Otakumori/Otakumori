/**
 * Avatar policy resolution module
 * Determines NSFW content permissions based on user preferences and verification
 */

export interface PolicyContext {
  /**
   * User's cookie preference for NSFW content
   * Expected format: "enabled" | "disabled" | undefined
   */
  cookieValue?: string;
  /**
   * Whether the user has completed adult verification (from Clerk metadata)
   */
  adultVerified?: boolean;
}

export interface PolicyResult {
  /**
   * Whether NSFW content is allowed for this request
   * Requires BOTH cookie opt-in AND adult verification
   */
  nsfwAllowed: boolean;
}

/**
 * Resolves NSFW content policy based on user context
 * Defense-in-depth: requires both cookie preference AND adult verification
 *
 * @param ctx - Policy context containing cookie and verification status
 * @returns PolicyResult indicating if NSFW content is permitted
 */
export function resolvePolicy(ctx: PolicyContext): PolicyResult {
  // Default to safe mode
  if (!ctx.cookieValue || !ctx.adultVerified) {
    return { nsfwAllowed: false };
  }

  // Both checks must pass
  const cookieOptIn = ctx.cookieValue === 'enabled';
  const verified = ctx.adultVerified === true;

  return {
    nsfwAllowed: cookieOptIn && verified,
  };
}

/**
 * Determines if an equipment slot contains NSFW content by name
 */
export function isNSFWSlot(slot: string): boolean {
  return slot.startsWith('NSFW');
}
