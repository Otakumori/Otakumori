// Feature flags configuration
// These can be controlled via environment variables or runtime configuration

export const flags = {
  // Core features
  showMiniGames: process.env.NEXT_PUBLIC_FEATURE_MINIGAMES === "on",
  showSoapstone: process.env.NEXT_PUBLIC_FEATURE_SOAPSTONE === "on",
  showPetals: process.env.NEXT_PUBLIC_FEATURE_PETALS === "on",
  showRune: process.env.NEXT_PUBLIC_FEATURE_RUNE === "on",
  showStarfield: process.env.NEXT_PUBLIC_FEATURE_STARFIELD === "on",
  showCursorGlow: process.env.NEXT_PUBLIC_FEATURE_CURSOR_GLOW === "on",
  
  // Service integrations
  usePrintifyLive: process.env.NODE_ENV === "production",
  useStripeLive: process.env.NODE_ENV === "production",
  useClerkLive: process.env.NODE_ENV === "production",
  
  // Development features
  enableDebugMode: process.env.NODE_ENV === "development",
  enableAnalytics: process.env.NEXT_PUBLIC_GA_ID ? true : false,
  enableSentry: process.env.NODE_ENV === "production",
  
  // Performance features
  enableImageOptimization: true,
  enableLazyLoading: true,
  enablePrefetching: true,
  
  // UI/UX features
  enableReducedMotion: false, // Will be set based on user preference
  enableDarkMode: false, // Will be set based on user preference
  enableAnimations: true,
} as const;

export type FeatureFlag = keyof typeof flags;
export type FeatureFlagValue = typeof flags[FeatureFlag];

// Helper function to check if a feature is enabled
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return Boolean(flags[flag]);
}

// Helper function to get feature flag value
export function getFeatureFlag<T extends FeatureFlag>(flag: T): typeof flags[T] {
  return flags[flag];
}
