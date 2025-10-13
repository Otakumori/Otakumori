/**
 * Core Procedural Asset Generator
 * Main interface for generating game assets on-the-fly
 */

import {
  generateNoiseTexture,
  applyCelShading,
  applyDithering,
  compositeTextures,
  imageDataToDataUrl,
  type TextureConfig,
  type ColorPalette,
} from './texture-synthesizer';

import {
  applyInkOutline,
  applyScreentone,
  applyAnimeHighlights,
  applyBloom,
  applyColorBanding,
} from './anime-style-filters';

export type AssetType = 'texture' | 'sprite' | 'background' | 'particle' | 'card' | 'ui';
export type AssetStyle = 'retro' | 'modern' | 'anime' | 'pixel' | 'manga' | 'cel-shaded';

export interface AssetGenerationConfig {
  type: AssetType;
  style: AssetStyle;
  width: number;
  height: number;
  colorPalette: ColorPalette;
  seed?: string;
  additionalEffects?: {
    outline?: boolean;
    bloom?: boolean;
    dithering?: boolean;
    screentone?: boolean;
    posterization?: number; // Number of color levels
    colorBanding?: number; // Number of bands
  };
}

/**
 * Generate a complete game asset with specified configuration
 */
export async function generateGameAsset(config: AssetGenerationConfig): Promise<string> {
  const {
    type,
    style,
    width,
    height,
    colorPalette,
    seed = `${type}-${style}-${Date.now()}`,
    additionalEffects = {},
  } = config;

  // Base texture configuration
  const textureConfig: TextureConfig = {
    width,
    height,
    seed,
    scale: 0.02,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2,
  };

  let imageData: ImageData;

  // Generate base texture based on style
  switch (style) {
    case 'retro':
    case 'pixel':
      // Use noise with low resolution
      imageData = generateNoiseTexture({ ...textureConfig, scale: 0.05, octaves: 2 }, colorPalette);
      if (additionalEffects.dithering) {
        imageData = applyDithering(imageData);
      }
      break;

    case 'anime':
    case 'cel-shaded':
      // Smooth noise with cel shading
      imageData = generateNoiseTexture(textureConfig, colorPalette);
      imageData = applyCelShading(imageData, additionalEffects.posterization || 4);

      if (additionalEffects.outline) {
        imageData = applyInkOutline(imageData, 2, '#000000');
      }

      imageData = applyAnimeHighlights(imageData, {
        strength: 0.3,
        highlightColor: colorPalette.highlight,
      });
      break;

    case 'manga':
      // Black and white with screentone
      imageData = generateNoiseTexture(textureConfig, {
        primary: '#ffffff',
        secondary: '#cccccc',
        accent: '#888888',
        highlight: '#ffffff',
        shadow: '#000000',
      });

      if (additionalEffects.screentone) {
        imageData = applyScreentone(imageData, 3, 6);
      }

      if (additionalEffects.outline) {
        imageData = applyInkOutline(imageData, 2, '#000000');
      }
      break;

    case 'modern':
    default:
      // High-detail noise with multiple layers
      const baseTexture = generateNoiseTexture(textureConfig, colorPalette);
      const detailTexture = generateNoiseTexture(
        { ...textureConfig, scale: 0.1, octaves: 6 },
        colorPalette,
      );
      imageData = compositeTextures(baseTexture, detailTexture, 'overlay', 0.3);

      if (additionalEffects.bloom) {
        imageData = applyBloom(imageData, 200, 0.5);
      }
      break;
  }

  // Apply type-specific processing
  switch (type) {
    case 'card':
      // Add border and decorative elements
      imageData = addCardBorder(imageData, colorPalette);
      break;

    case 'particle':
      // Add glow and transparency
      imageData = addParticleGlow(imageData);
      break;

    case 'background':
      // Add depth and layering
      if (style === 'anime' || style === 'modern') {
        imageData = applyBloom(imageData, 180, 0.4);
      }
      break;

    case 'ui':
      // Clean and simple
      if (additionalEffects.colorBanding) {
        imageData = applyColorBanding(imageData, additionalEffects.colorBanding);
      }
      break;
  }

  // Convert to data URL for immediate use
  return imageDataToDataUrl(imageData);
}

/**
 * Generate a character card texture
 */
export async function generateCharacterCard(
  characterName: string,
  colorScheme: ColorPalette,
  style: 'kill-la-kill' | 'studio-ghibli' | 'generic' = 'generic',
): Promise<string> {
  const seed = `card-${characterName}-${style}`;

  // Style-specific configurations
  const styleConfig: Record<string, Partial<AssetGenerationConfig>> = {
    'kill-la-kill': {
      style: 'anime',
      additionalEffects: {
        outline: true,
        posterization: 5,
        bloom: true,
      },
    },
    'studio-ghibli': {
      style: 'cel-shaded',
      additionalEffects: {
        posterization: 6,
        outline: false,
      },
    },
    generic: {
      style: 'modern',
      additionalEffects: {
        bloom: true,
      },
    },
  };

  return generateGameAsset({
    type: 'card',
    width: 256,
    height: 356,
    colorPalette: colorScheme,
    seed,
    ...styleConfig[style],
  } as AssetGenerationConfig);
}

/**
 * Generate particle textures for effects
 */
export async function generateParticleTexture(
  particleType: 'petal' | 'spark' | 'smoke' | 'magic',
  colorPalette: ColorPalette,
): Promise<string> {
  const seed = `particle-${particleType}`;

  const config: AssetGenerationConfig = {
    type: 'particle',
    style: 'modern',
    width: 64,
    height: 64,
    colorPalette,
    seed,
    additionalEffects: {
      bloom: true,
    },
  };

  return generateGameAsset(config);
}

/**
 * Generate UI element textures
 */
export async function generateUITexture(
  elementType: 'button' | 'panel' | 'border' | 'icon',
  colorPalette: ColorPalette,
  style: AssetStyle = 'modern',
): Promise<string> {
  const sizes: Record<string, { width: number; height: number }> = {
    button: { width: 200, height: 60 },
    panel: { width: 400, height: 300 },
    border: { width: 512, height: 512 },
    icon: { width: 64, height: 64 },
  };

  return generateGameAsset({
    type: 'ui',
    style,
    ...sizes[elementType],
    colorPalette,
    seed: `ui-${elementType}-${style}`,
    additionalEffects: {
      posterization: style === 'anime' ? 4 : undefined,
      colorBanding: style === 'retro' ? 3 : undefined,
    },
  });
}

/**
 * Helper: Add decorative border to card
 */
function addCardBorder(imageData: ImageData, palette: ColorPalette): ImageData {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);

  const borderWidth = 8;
  const borderColor = hexToRgb(palette.accent);

  // Draw border
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (
        x < borderWidth ||
        x >= width - borderWidth ||
        y < borderWidth ||
        y >= height - borderWidth
      ) {
        const idx = (y * width + x) * 4;
        result.data[idx] = borderColor.r;
        result.data[idx + 1] = borderColor.g;
        result.data[idx + 2] = borderColor.b;
        result.data[idx + 3] = 255;
      }
    }
  }

  return result;
}

/**
 * Helper: Add glow effect for particles
 */
function addParticleGlow(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const falloff = Math.max(0, 1 - distance / maxRadius);

      const idx = (y * width + x) * 4;
      result.data[idx + 3] = Math.round(data[idx + 3] * falloff);
    }
  }

  return result;
}

// Helper function
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Cache for generated assets to avoid regeneration
 */
const assetCache = new Map<string, string>();

/**
 * Get or generate an asset with caching
 */
export async function getCachedAsset(
  key: string,
  generator: () => Promise<string>,
): Promise<string> {
  if (assetCache.has(key)) {
    return assetCache.get(key)!;
  }

  const asset = await generator();
  assetCache.set(key, asset);
  return asset;
}

/**
 * Clear asset cache
 */
export function clearAssetCache(): void {
  assetCache.clear();
}
