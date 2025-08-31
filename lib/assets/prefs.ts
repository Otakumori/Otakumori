export const assetPreferences = {
  // Use dynamic animated banners instead of static images
  preferDynamicCategoryBanners: true,

  // Achievement generation preferences
  achievementGeneration: {
    defaultSize: 96,
    emitPng: true,
    emitFrames: false, // Set to true to generate framed versions
    preserveExistingTierPngs: true,
  },

  // Tier frame preferences
  tierFrames: {
    defaultHue: 325, // Purple-pink base
    respectReducedMotion: true,
    enableAnimations: true,
  },

  // Soapstone overlay preferences
  soapstone: {
    defaultEmphasis: 0.9,
    enableVignette: true,
    enableFilmGrain: true,
  },
} as const;

export type AssetPreferences = typeof assetPreferences;
