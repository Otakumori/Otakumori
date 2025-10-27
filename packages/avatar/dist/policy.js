/**
 * Avatar policy resolution module
 * Determines NSFW content permissions based on user preferences and verification
 */
/**
 * Resolves NSFW content policy based on user context
 * Defense-in-depth: requires both cookie preference AND adult verification
 *
 * @param ctx - Policy context containing cookie and verification status
 * @returns PolicyResult indicating if NSFW content is permitted
 */
export function resolvePolicy(ctx) {
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
export function isNSFWSlot(slot) {
    return slot.startsWith('NSFW');
}
