export interface AvatarV2PolicyContext {
  /**
   * Server-side product capability. This must come from trusted server
   * configuration, not NEXT_PUBLIC_* client configuration.
   */
  adultAssetsEnabled: boolean;
  adultVerified: boolean;
  userOptedIn: boolean;
}

export interface AvatarV2PolicyResult {
  mode: 'safe' | 'adult';
  adultAssetsAllowed: boolean;
}

export function resolveAvatarV2Policy(
  context: AvatarV2PolicyContext,
): AvatarV2PolicyResult {
  const adultAssetsAllowed =
    context.adultAssetsEnabled &&
    context.adultVerified &&
    context.userOptedIn;

  return {
    mode: adultAssetsAllowed ? 'adult' : 'safe',
    adultAssetsAllowed,
  };
}

export function isAvatarAssetRatingAllowed(
  contentRating: 'sfw' | 'adult',
  policy: AvatarV2PolicyResult,
): boolean {
  return contentRating === 'sfw' || policy.adultAssetsAllowed;
}
