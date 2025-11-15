/**
 * Feature flags for avatar engine
 * AVATARS_ENABLED: Works without login, defaults to true
 * NSFW_AVATARS_ENABLED: Feature flag controlled, defaults to false
 */

export interface AvatarFlags {
  avatarsEnabled: boolean;
  nsfwAvatarsEnabled: boolean;
}

let cachedFlags: AvatarFlags | null = null;

/**
 * Resolve feature flags from environment and runtime
 */
export function resolveAvatarFlags(): AvatarFlags {
  if (cachedFlags) {
    return cachedFlags;
  }

  // Check environment variables (server-side)
  const envAvatarsEnabled =
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_AVATARS_ENABLED !== 'false'
      : true;

  const envNsfwEnabled =
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_NSFW_AVATARS_ENABLED === 'true'
      : false;

  // Check client-side feature flags if available
  let clientAvatarsEnabled = envAvatarsEnabled;
  let clientNsfwEnabled = envNsfwEnabled;

  if (typeof window !== 'undefined') {
    // Check window-level feature flags if they exist
    const windowFlags = (window as any).__OTAKUMORI_FLAGS__;
    if (windowFlags) {
      clientAvatarsEnabled = windowFlags.AVATARS_ENABLED ?? envAvatarsEnabled;
      clientNsfwEnabled = windowFlags.NSFW_AVATARS_ENABLED ?? envNsfwEnabled;
    }
  }

  cachedFlags = {
    avatarsEnabled: clientAvatarsEnabled,
    nsfwAvatarsEnabled: clientNsfwEnabled,
  };

  return cachedFlags;
}

/**
 * Get AVATARS_ENABLED flag
 */
export function isAvatarsEnabled(): boolean {
  return resolveAvatarFlags().avatarsEnabled;
}

/**
 * Get NSFW_AVATARS_ENABLED flag
 */
export function isNsfwAvatarsEnabled(): boolean {
  return resolveAvatarFlags().nsfwAvatarsEnabled;
}

/**
 * Clear cached flags (useful for testing)
 */
export function clearFlagsCache(): void {
  cachedFlags = null;
}

