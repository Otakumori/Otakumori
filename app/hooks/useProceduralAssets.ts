/**
 * React Hook for Procedural Asset Generation
 * Provides client-side access to procedurally generated assets
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  generateNoiseTexture,
  generateVoronoiTexture,
  generateGradientTexture,
  type TextureConfig,
  type ColorPalette,
} from '@/lib/procedural/texture-synthesizer';

export type AssetType = 'noise' | 'voronoi' | 'gradient';

export interface AssetGenerationOptions {
  type: AssetType;
  width: number;
  height: number;
  seed?: string;
  palette: ColorPalette;
  config?: {
    scale?: number;
    octaves?: number;
    persistence?: number;
    lacunarity?: number;
    pointCount?: number;
    direction?: 'horizontal' | 'vertical' | 'diagonal';
  };
}

export interface ProceduralAsset {
  dataUrl: string;
  imageData: ImageData;
  width: number;
  height: number;
}

/**
 * Convert ImageData to data URL
 */
function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Hook for generating procedural assets
 */
export function useProceduralAssets() {
  const [cache, setCache] = useState<Map<string, ProceduralAsset>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Generate a single asset
   */
  const generateAsset = useCallback(
    async (options: AssetGenerationOptions): Promise<ProceduralAsset> => {
      const cacheKey = JSON.stringify(options);

      // Check cache first
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
      }

      setIsGenerating(true);

      try {
        const { type, width, height, seed, palette, config } = options;
        let imageData: ImageData;

        const textureConfig: TextureConfig = {
          width,
          height,
          seed: seed || Date.now().toString(),
          ...config,
        };

        switch (type) {
          case 'noise':
            imageData = generateNoiseTexture(textureConfig, palette);
            break;
          case 'voronoi':
            imageData = generateVoronoiTexture(textureConfig, palette, config?.pointCount || 20);
            break;
          case 'gradient':
            imageData = generateGradientTexture(
              textureConfig,
              palette.primary,
              palette.secondary,
              0,
            );
            break;
          default:
            throw new Error(`Unknown asset type: ${type}`);
        }

        const dataUrl = imageDataToDataUrl(imageData);
        const asset: ProceduralAsset = {
          dataUrl,
          imageData,
          width,
          height,
        };

        // Update cache
        setCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, asset);
          return newCache;
        });

        return asset;
      } finally {
        setIsGenerating(false);
      }
    },
    [cache],
  );

  /**
   * Generate multiple assets in batch
   */
  const generateBatch = useCallback(
    async (optionsArray: AssetGenerationOptions[]): Promise<ProceduralAsset[]> => {
      const promises = optionsArray.map((options) => generateAsset(options));
      return Promise.all(promises);
    },
    [generateAsset],
  );

  /**
   * Clear the cache
   */
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  /**
   * Get cache size
   */
  const getCacheSize = useCallback(() => {
    return cache.size;
  }, [cache]);

  return {
    generateAsset,
    generateBatch,
    clearCache,
    getCacheSize,
    isGenerating,
  };
}

/**
 * Hook for a single procedural asset with auto-generation
 */
export function useProceduralAsset(options: AssetGenerationOptions | null) {
  const [asset, setAsset] = useState<ProceduralAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { generateAsset } = useProceduralAssets();

  useEffect(() => {
    if (!options) {
      setAsset(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    generateAsset(options)
      .then((generatedAsset) => {
        setAsset(generatedAsset);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [options, generateAsset]);

  return { asset, isLoading, error };
}

/**
 * Predefined palettes for common game themes
 */
export const PREDEFINED_PALETTES: Record<string, ColorPalette> = {
  sakura: {
    primary: '#FFB7C5',
    secondary: '#FF69B4',
    accent: '#FF1493',
    highlight: '#FFF0F5',
    shadow: '#8B0A50',
  },
  cyberpunk: {
    primary: '#00FFFF',
    secondary: '#FF00FF',
    accent: '#FFFF00',
    highlight: '#FFFFFF',
    shadow: '#000033',
  },
  forest: {
    primary: '#228B22',
    secondary: '#90EE90',
    accent: '#00FF00',
    highlight: '#F0FFF0',
    shadow: '#006400',
  },
  fire: {
    primary: '#FF4500',
    secondary: '#FF6347',
    accent: '#FFD700',
    highlight: '#FFF8DC',
    shadow: '#8B0000',
  },
  ice: {
    primary: '#00CED1',
    secondary: '#B0E0E6',
    accent: '#FFFFFF',
    highlight: '#F0FFFF',
    shadow: '#000080',
  },
  void: {
    primary: '#4B0082',
    secondary: '#8A2BE2',
    accent: '#9370DB',
    highlight: '#E6E6FA',
    shadow: '#000000',
  },
  golden: {
    primary: '#FFD700',
    secondary: '#FFA500',
    accent: '#FF8C00',
    highlight: '#FFFACD',
    shadow: '#B8860B',
  },
  dark: {
    primary: '#1A1A1A',
    secondary: '#333333',
    accent: '#4D4D4D',
    highlight: '#666666',
    shadow: '#000000',
  },
};
