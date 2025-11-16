/**
 * Central Game Visual Loader
 * 
 * Provides consistent visual profiles for all mini-games:
 * - Background styles, lighting, post-processing
 * - HUD skin selection (respects cosmetics)
 * - Avatar representation modes
 * - Material/shader configurations
 * 
 * No game should hardcode visual decisions - they all use this loader.
 */

import type { HudSkinId } from '@/app/lib/cosmetics/cosmeticsConfig';
import type { RepresentationMode } from '@om/avatar-engine/types/avatar';
import { getMiniGameConfig } from './miniGameConfigs';

/**
 * Background style presets for different game moods
 */
export type BackgroundStyle =
  | 'abyss' // Deep purple/black void
  | 'dojo' // Night dojo with rim lighting
  | 'city' // Neon cityscape
  | 'void' // Pure black void
  | 'arena' // Warm arena spotlight
  | 'dungeon' // Dark torch-lit dungeon
  | 'neon-lane' // Bright neon rhythm lane
  | 'airy' // Light, airy palette
  | 'chaos' // Chaotic micro-game background
  | 'starfield' // Starfield/abyss background
  | 'blossom-night' // Cherry blossom night scene
  | 'arcade' // Neon note highway (rhythm games)
  | 'city-abyss' // Side-scrolling city with abyss purple
  | 'bubble'; // Bubbly pastel background

/**
 * Game theme identifier
 */
export type GameTheme =
  | 'petal-samurai'
  | 'petal-hero'
  | 'memory'
  | 'puzzle'
  | 'bubble'
  | 'beat-em-up'
  | 'dungeon'
  | 'thigh-run'
  | 'microgames';

/**
 * Background configuration
 */
export interface BackgroundConfig {
  kind: BackgroundStyle;
  accentColor: string; // Primary accent color
  glowColor?: string; // Optional glow color
  vignette?: boolean; // Vignette overlay flag
}

/**
 * HUD configuration
 */
export interface HudConfig {
  defaultHud: 'standard' | 'minimal';
  allowQuakeOverlay: boolean;
}

/**
 * Petal sprite configuration
 */
export interface PetalConfig {
  usesPetalSpriteSheet: boolean;
  spritePath?: string; // Defaults to /assets/images/petal_sprite.png
}

/**
 * NSFW flavor configuration (disabled for testing)
 */
export interface NsfwFlavorConfig {
  hasAltDemons?: boolean; // For dungeon-of-desire (disabled for testing)
  hasAltOutfits?: boolean; // For future use (disabled for testing)
}

/**
 * Light configuration for R3F scenes
 */
export interface LightConfig {
  key?: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  fill?: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  rim?: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
}

/**
 * Post-processing effects configuration
 */
export interface PostProcessingConfig {
  bloom?: boolean;
  vignette?: boolean;
  chromaticAberration?: boolean;
  bloomIntensity?: number;
  vignetteIntensity?: number;
}

/**
 * Material hints for avatar rendering
 */
export interface MaterialHints {
  useAnimeToon: boolean;
  useOutline: boolean;
  outlineColor?: string;
  outlineThickness?: number;
  textureQuality?: 'low' | 'medium' | 'high';
  useMatcap?: boolean; // For hair/accessory gloss
}

/**
 * VFX configuration for game effects
 */
export interface VfxConfig {
  screenshake?: {
    enabled: boolean;
    intensity: number; // 0-1
    duration: number; // ms
  };
  particles?: {
    enabled: boolean;
    maxCount: number;
    petalBurst?: boolean; // Use petal particles
  };
  trails?: {
    enabled: boolean;
    lifetime: number; // ms (150-250 for slash trails)
    additiveBlending?: boolean;
  };
}

/**
 * Complete visual profile for a game
 */
export interface GameVisualProfile {
  id: string; // Game ID (e.g., 'petal-samurai')
  displayName: string; // User-facing game name
  theme: GameTheme;
  background: BackgroundConfig;
  backgroundColor: string; // CSS color or gradient (kept for backward compatibility)
  // Lighting (for 3D scenes)
  lights?: LightConfig;
  // Post-processing
  postProcessing?: PostProcessingConfig;
  // Avatar configuration
  usesAvatar: boolean;
  avatarRepresentationMode: RepresentationMode;
  // HUD configuration
  hud: HudConfig;
  // Petal sprite configuration
  petals?: PetalConfig;
  // NSFW flavor (disabled for testing)
  nsfwFlavor?: NsfwFlavorConfig;
  // HUD configuration (will be resolved via getHudForGame) - kept for backward compatibility
  useQuakeHudByDefault?: boolean; // Only if unlocked and equipped
  // 2D game assets (if applicable)
  spriteSheetUrl?: string;
  textureAtlasUrl?: string;
  // Material hints for avatar rendering
  materialHints?: MaterialHints;
  // VFX configuration
  vfxConfig?: VfxConfig;
  // Accessibility flags
  effectsEnabled?: boolean; // Screen shake, flashes, etc.
  reducedMotion?: boolean; // Respect prefers-reduced-motion
  // Legacy fields for backward compatibility
  gameId?: string;
  backgroundStyle?: BackgroundStyle;
}

/**
 * Get visual profile for a specific game
 * Maps each game to its unique visual identity while maintaining cohesion
 */
export function getGameVisualProfile(gameId: string): GameVisualProfile {
  const gameConfig = getMiniGameConfig(gameId);
  const baseProfile: GameVisualProfile = {
    id: gameId,
    gameId, // Legacy field for backward compatibility
    displayName: gameId,
    theme: 'petal-samurai',
    background: {
      kind: 'abyss',
      accentColor: '#ec4899',
      vignette: false,
    },
    backgroundStyle: 'abyss', // Legacy field
    backgroundColor: 'linear-gradient(to bottom, #1a0a2e, #000000)',
    avatarRepresentationMode: gameConfig?.representationMode || 'fullBody',
    usesAvatar: gameConfig?.avatarUsage === 'avatar-or-preset',
    hud: {
      defaultHud: 'standard',
      allowQuakeOverlay: false,
    },
    effectsEnabled: true,
    reducedMotion: false,
  };

  // Game-specific visual identities
  switch (gameId) {
    case 'petal-samurai':
      return {
        ...baseProfile,
        displayName: 'Petal Samurai',
        theme: 'petal-samurai',
        background: {
          kind: 'dojo',
          accentColor: '#ec4899',
          glowColor: '#f472b6',
          vignette: true,
        },
        backgroundStyle: 'dojo', // Legacy
        backgroundColor: 'linear-gradient(to bottom, #2d1b4e, #0a0a0a)',
        lights: {
          key: {
            color: '#ec4899',
            intensity: 1.2,
            position: [5, 5, 5],
          },
          fill: {
            color: '#8b5cf6',
            intensity: 0.4,
            position: [-5, 2, -5],
          },
          rim: {
            color: '#f472b6',
            intensity: 0.8,
            position: [0, 3, -8],
          },
        },
        postProcessing: {
          bloom: true,
          vignette: true,
          bloomIntensity: 0.3,
          vignetteIntensity: 0.4,
        },
        avatarRepresentationMode: 'fullBody',
        usesAvatar: true,
        hud: {
          defaultHud: 'standard',
          allowQuakeOverlay: true,
        },
        petals: {
          usesPetalSpriteSheet: true,
          spritePath: '/assets/images/petal_sprite.png',
        },
        spriteSheetUrl: '/assets/images/petal_sprite.png', // Legacy
        materialHints: {
          useAnimeToon: true,
          useOutline: true,
          outlineColor: '#ec4899',
          outlineThickness: 0.02,
          textureQuality: 'high',
        },
        vfxConfig: {
          screenshake: {
            enabled: true,
            intensity: 0.3,
            duration: 200,
          },
          particles: {
            enabled: true,
            maxCount: 50,
            petalBurst: true,
          },
          trails: {
            enabled: true,
            lifetime: 200, // 150-250ms for slash trails
            additiveBlending: true,
          },
        },
      };

    case 'petal-storm-rhythm':
      return {
        ...baseProfile,
        displayName: 'Petal Hero',
        theme: 'petal-hero',
        background: {
          kind: 'arcade',
          accentColor: '#a78bfa',
          glowColor: '#c084fc',
          vignette: false,
        },
        backgroundStyle: 'arcade', // Legacy (was 'neon-lane')
        backgroundColor: 'linear-gradient(to bottom, #1e1b4e, #312e81, #000000)',
        lights: {
          key: {
            color: '#a78bfa',
            intensity: 1.0,
            position: [0, 4, 0],
          },
          fill: {
            color: '#c084fc',
            intensity: 0.6,
            position: [-3, 2, 3],
          },
        },
        postProcessing: {
          bloom: true,
          chromaticAberration: true,
          bloomIntensity: 0.5,
        },
        avatarRepresentationMode: 'bust',
        usesAvatar: true,
        hud: {
          defaultHud: 'standard',
          allowQuakeOverlay: true,
        },
      };

    case 'thigh-coliseum':
      return {
        ...baseProfile,
        displayName: 'Thigh Coliseum',
        theme: 'thigh-run',
        background: {
          kind: 'arena',
          accentColor: '#fbbf24',
          glowColor: '#f97316',
          vignette: true,
        },
        backgroundStyle: 'arena', // Legacy
        backgroundColor: 'linear-gradient(to bottom, #4c1d95, #1e1b4e, #000000)',
        lights: {
          key: {
            color: '#fbbf24',
            intensity: 1.5,
            position: [0, 8, 0],
          },
          fill: {
            color: '#f59e0b',
            intensity: 0.5,
            position: [-4, 3, 4],
          },
          rim: {
            color: '#f97316',
            intensity: 0.7,
            position: [5, 2, -5],
          },
        },
        postProcessing: {
          bloom: true,
          vignette: true,
          bloomIntensity: 0.4,
          vignetteIntensity: 0.3,
        },
        avatarRepresentationMode: 'fullBody',
        usesAvatar: true,
        hud: {
          defaultHud: 'standard',
          allowQuakeOverlay: false,
        },
      };

    case 'dungeon-of-desire':
      return {
        ...baseProfile,
        displayName: 'Dungeon of Desire',
        theme: 'dungeon',
        background: {
          kind: 'dungeon',
          accentColor: '#dc2626',
          glowColor: '#991b1b',
          vignette: true,
        },
        backgroundStyle: 'dungeon', // Legacy
        backgroundColor: 'linear-gradient(to bottom, #1a0a2e, #0a0a0a)',
        lights: {
          key: {
            color: '#dc2626',
            intensity: 0.8,
            position: [2, 3, 2],
          },
          fill: {
            color: '#991b1b',
            intensity: 0.3,
            position: [-2, 1, -2],
          },
        },
        postProcessing: {
          bloom: false,
          vignette: true,
          chromaticAberration: false,
          vignetteIntensity: 0.6,
        },
        avatarRepresentationMode: 'bust',
        usesAvatar: true,
        hud: {
          defaultHud: 'standard',
          allowQuakeOverlay: false,
        },
        nsfwFlavor: {
          hasAltDemons: false, // Disabled for testing
          hasAltOutfits: false, // Disabled for testing
        },
      };

    case 'memory-match':
      return {
        ...baseProfile,
        displayName: 'Memory Match',
        theme: 'memory',
        background: {
          kind: 'airy',
          accentColor: '#ec4899',
          glowColor: '#a78bfa',
          vignette: false,
        },
        backgroundStyle: 'airy', // Legacy
        backgroundColor: 'linear-gradient(to bottom, #2d1b4e, #1e1b4e, #0a0a0a)',
        lights: {
          key: {
            color: '#ec4899',
            intensity: 0.8,
            position: [0, 4, 0],
          },
          fill: {
            color: '#a78bfa',
            intensity: 0.4,
            position: [-3, 2, 3],
          },
        },
        postProcessing: {
          bloom: true,
          bloomIntensity: 0.2,
        },
        avatarRepresentationMode: 'portrait',
        usesAvatar: true,
        hud: {
          defaultHud: 'standard',
          allowQuakeOverlay: false,
        },
      };

    case 'puzzle-reveal':
      return {
        ...baseProfile,
        displayName: 'Puzzle Reveal',
        theme: 'puzzle',
        background: {
          kind: 'airy',
          accentColor: '#ec4899',
          glowColor: '#a78bfa',
          vignette: true,
        },
        backgroundStyle: 'airy', // Legacy
        backgroundColor: 'linear-gradient(to bottom, #2d1b4e, #1e1b4e, #0a0a0a)',
        lights: {
          key: {
            color: '#ec4899',
            intensity: 0.8,
            position: [0, 4, 0],
          },
          fill: {
            color: '#a78bfa',
            intensity: 0.4,
            position: [-3, 2, 3],
          },
        },
        postProcessing: {
          bloom: true,
          bloomIntensity: 0.2,
          vignette: true,
          vignetteIntensity: 0.3,
        },
        avatarRepresentationMode: 'portrait',
        usesAvatar: true,
        hud: {
          defaultHud: 'minimal',
          allowQuakeOverlay: false,
        },
      };

    case 'bubble-girl':
      return {
        ...baseProfile,
        displayName: 'Bubble Girl',
        theme: 'bubble',
        background: {
          kind: 'bubble',
          accentColor: '#f472b6',
          glowColor: '#c084fc',
          vignette: false,
        },
        backgroundStyle: 'airy', // Legacy (bubble variant)
        backgroundColor: 'linear-gradient(to bottom, #581c87, #3b0764, #1e1b4e)',
        lights: {
          key: {
            color: '#f472b6',
            intensity: 1.0,
            position: [0, 5, 0],
          },
          fill: {
            color: '#c084fc',
            intensity: 0.5,
            position: [-2, 2, 2],
          },
        },
        postProcessing: {
          bloom: true,
          bloomIntensity: 0.4,
        },
        avatarRepresentationMode: 'chibi',
        usesAvatar: true,
        hud: {
          defaultHud: 'standard',
          allowQuakeOverlay: false,
        },
      };

    case 'blossomware':
      return {
        ...baseProfile,
        displayName: 'Blossomware',
        theme: 'microgames',
        background: {
          kind: 'chaos',
          accentColor: '#f472b6',
          glowColor: '#c084fc',
          vignette: false,
        },
        backgroundStyle: 'chaos', // Legacy (was 'airy')
        backgroundColor: 'linear-gradient(to bottom, #581c87, #3b0764, #1e1b4e)',
        lights: {
          key: {
            color: '#f472b6',
            intensity: 1.0,
            position: [0, 5, 0],
          },
          fill: {
            color: '#c084fc',
            intensity: 0.5,
            position: [-2, 2, 2],
          },
        },
        postProcessing: {
          bloom: true,
          bloomIntensity: 0.4,
        },
        avatarRepresentationMode: 'chibi',
        usesAvatar: true,
        hud: {
          defaultHud: 'minimal',
          allowQuakeOverlay: false,
        },
      };

    case 'otaku-beat-em-up':
      return {
        ...baseProfile,
        displayName: 'Otaku Beat-Em-Up',
        theme: 'beat-em-up',
        background: {
          kind: 'city-abyss',
          accentColor: '#818cf8',
          glowColor: '#a78bfa',
          vignette: false,
        },
        backgroundStyle: 'city-abyss', // Legacy (was 'city')
        backgroundColor: 'linear-gradient(to bottom, #312e81, #1e1b4e, #000000)',
        lights: {
          key: {
            color: '#818cf8',
            intensity: 1.2,
            position: [4, 4, 4],
          },
          fill: {
            color: '#a78bfa',
            intensity: 0.5,
            position: [-3, 2, -3],
          },
        },
        postProcessing: {
          bloom: true,
          chromaticAberration: true,
          bloomIntensity: 0.4,
        },
        avatarRepresentationMode: 'fullBody',
        usesAvatar: true,
        hud: {
          defaultHud: 'standard',
          allowQuakeOverlay: false,
        },
      };

    default:
      return {
        ...baseProfile,
        backgroundStyle: 'abyss', // Legacy
      };
  }
}

/**
 * Get HUD skin for a game based on cosmetics state
 * Respects user's equipped HUD skin and unlock status
 */
export function getHudForGame(
  gameId: string,
  cosmeticsState: {
    hudSkin: HudSkinId;
    isUnlocked: (itemId: string) => boolean;
  },
): HudSkinId {
  // Check if Quake HUD is unlocked and equipped
  const quakeUnlocked = cosmeticsState.isUnlocked('hud-quake-overlay');
  const quakeEquipped = cosmeticsState.hudSkin === 'quake';

  // Only return 'quake' if both unlocked AND equipped
  if (quakeUnlocked && quakeEquipped) {
    return 'quake';
  }

  // Default HUD for all games
  return 'default';
}

/**
 * Get avatar bundle configuration for a game
 * Returns representation mode and material hints
 */
export function getAvatarBundleForGame(gameId: string): {
  representationMode: RepresentationMode;
  materialHints: {
    useAnimeToon: boolean;
    useOutline: boolean;
    outlineColor?: string;
    outlineThickness?: number;
  };
} {
  const profile = getGameVisualProfile(gameId);
  // Note: gameConfig available for future use if needed for avatar customization per game
  // const gameConfig = getMiniGameConfig(gameId);

  return {
    representationMode: profile.avatarRepresentationMode,
    materialHints: {
      useAnimeToon: true, // Always use AnimeToon shader
      useOutline: true, // Always use outline pass
      outlineColor: '#ec4899', // Pink outline (Otaku-mori brand)
      outlineThickness: 0.02, // Consistent thickness
    },
  };
}

/**
 * Apply visual profile to a game component
 * Helper to set background and accessibility flags
 */
export function applyVisualProfile(
  profile: GameVisualProfile,
  options?: {
    effectsEnabled?: boolean;
    reducedMotion?: boolean;
  },
): {
  backgroundStyle: React.CSSProperties;
  effectsEnabled: boolean;
  reducedMotion: boolean;
} {
  const effectsEnabled = options?.effectsEnabled ?? profile.effectsEnabled ?? true;
  const reducedMotion = options?.reducedMotion ?? profile.reducedMotion ?? false;

  return {
    backgroundStyle: {
      background: profile.backgroundColor,
    },
    effectsEnabled,
    reducedMotion,
  };
}

/**
 * Representation Mode Documentation
 * 
 * Each game uses a specific representation mode for avatar display:
 * 
 * - fullBody: Complete avatar (petal-samurai, otaku-beat-em-up, thigh-coliseum)
 *   - Use when avatar is central to gameplay or needs full visibility
 *   - Conditional display: hide if avatar quality is low (focus on game VFX instead)
 * 
 * - bust: Waist-up view (petal-storm-rhythm, dungeon-of-desire)
 *   - Emphasizes face, hair, torso
 *   - Good for rhythm games and character-focused experiences
 * 
 * - portrait: Head/shoulder frame (memory-match, puzzle-reveal)
 *   - Simplified, UI-integrated avatar
 *   - Used when avatar is decorative, not gameplay-critical
 * 
 * - chibi: Proportional remap with larger head (bubble-girl, blossomware)
 *   - Stylized, cute representation
 *   - Good for casual/sandbox games
 */

/**
 * Hook to get complete visual profile for a game
 * Combines game visual profile, avatar bundle config, and cosmetics state
 * 
 * Note: This is a regular function, not a React hook (no hooks used internally).
 * It can be called from React hooks or components.
 */
export function useGameVisualProfile(
  gameId: string,
  options?: {
    avatarConfig?: unknown; // AvatarProfile | null
    cosmeticsState?: {
      hudSkin: HudSkinId;
      isUnlocked: (itemId: string) => boolean;
    };
  },
): GameVisualProfile & {
  hudSkin: HudSkinId;
  avatarBundle: ReturnType<typeof getAvatarBundleForGame>;
} {
  // Get base visual profile
  const profile = getGameVisualProfile(gameId);
  
  // Get avatar bundle config
  const avatarBundle = getAvatarBundleForGame(gameId);
  
  // Resolve HUD skin from cosmetics state
  const cosmeticsState = options?.cosmeticsState || {
    hudSkin: 'default' as HudSkinId,
    isUnlocked: () => false,
  };
  const hudSkin = getHudForGame(gameId, cosmeticsState);
  
  // Merge material hints from avatar bundle into profile if not already set
  if (!profile.materialHints) {
    profile.materialHints = avatarBundle.materialHints;
  }
  
  return {
    ...profile,
    hudSkin,
    avatarBundle,
  };
}

