/**
 * Enhanced Asset Loader
 *
 * Fallback texture generation, asset preloading system,
 * and error handling for missing assets.
 */

'use client';

import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { generateFallbackTexture } from './enhancedTextures';

export interface AssetLoadOptions {
  fallbackType?: 'checker' | 'gradient' | 'solid';
  fallbackColor1?: string;
  fallbackColor2?: string;
  timeout?: number;
  retries?: number;
}

export interface LoadedAsset {
  url: string;
  image: HTMLImageElement;
  canvas?: HTMLCanvasElement;
  loaded: boolean;
  error?: Error;
}

/**
 * Load image with fallback generation
 */
export async function loadImageWithFallback(
  url: string,
  ctx: CanvasRenderingContext2D,
  options: AssetLoadOptions = {},
): Promise<LoadedAsset> {
  const {
    fallbackType = 'checker',
    fallbackColor1 = '#4a5568',
    fallbackColor2 = '#2d3748',
    timeout = 5000,
    retries = 2,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const image = await loadImageWithTimeout(url, timeout);

      return {
        url,
        image,
        loaded: true,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < retries) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }
  }

  // Generate fallback texture
  logger.warn(`Failed to load image ${url}, generating fallback texture`);
  const fallbackCanvas = document.createElement('canvas');
  fallbackCanvas.width = 256;
  fallbackCanvas.height = 256;
  const fallbackCtx = fallbackCanvas.getContext('2d');

  if (fallbackCtx) {
    const imageData = generateFallbackTexture(
      fallbackCtx,
      256,
      256,
      fallbackType,
      fallbackColor1,
      fallbackColor2,
    );
    fallbackCtx.putImageData(imageData, 0, 0);

    // Convert canvas to image
    const fallbackImage = new Image();
    fallbackImage.src = fallbackCanvas.toDataURL();

    return new Promise((resolve) => {
      fallbackImage.onload = () => {
        resolve({
          url,
          image: fallbackImage,
          canvas: fallbackCanvas,
          loaded: false, // Mark as fallback
          error: lastError,
        });
      };
    });
  }

  // Ultimate fallback: create solid color image
  const solidImage = new Image();
  solidImage.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="${fallbackColor1}"/></svg>`;

  return new Promise((resolve) => {
    solidImage.onload = () => {
      resolve({
        url,
        image: solidImage,
        loaded: false,
        error: lastError,
      });
    };
  });
}

/**
 * Load image with timeout
 */
function loadImageWithTimeout(url: string, timeout: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => {
      reject(new Error(`Image load timeout: ${url}`));
    }, timeout);

    image.onload = () => {
      clearTimeout(timer);
      resolve(image);
    };

    image.onerror = () => {
      clearTimeout(timer);
      reject(new Error(`Failed to load image: ${url}`));
    };

    image.src = url;
  });
}

/**
 * Preload multiple assets
 */
export async function preloadAssets(
  urls: string[],
  ctx: CanvasRenderingContext2D,
  options: AssetLoadOptions = {},
): Promise<Map<string, LoadedAsset>> {
  const loadedAssets = new Map<string, LoadedAsset>();

  // Load in parallel (with concurrency limit)
  const concurrency = 5;
  const chunks: string[][] = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const promises = chunk.map((url) => loadImageWithFallback(url, ctx, options));
    const results = await Promise.all(promises);

    chunk.forEach((url, index) => {
      loadedAssets.set(url, results[index]);
    });
  }

  return loadedAssets;
}

/**
 * Check if asset exists (HEAD request)
 */
export async function checkAssetExists(url: string, timeout: number = 3000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get asset URL with fallback chain
 */
export async function getAssetWithFallback(
  primaryUrl: string,
  fallbackUrls: string[],
  ctx: CanvasRenderingContext2D,
  options: AssetLoadOptions = {},
): Promise<LoadedAsset> {
  // Try primary URL first
  try {
    return await loadImageWithFallback(primaryUrl, ctx, options);
  } catch {
    // Try fallback URLs
    for (const fallbackUrl of fallbackUrls) {
      try {
        return await loadImageWithFallback(fallbackUrl, ctx, options);
      } catch {
        continue;
      }
    }
  }

  // All failed, generate fallback
  return loadImageWithFallback(primaryUrl, ctx, options);
}

/**
 * Create sprite sheet from image
 */
export function createSpriteSheet(
  image: HTMLImageElement,
  cols: number,
  rows: number,
  spriteWidth: number,
  spriteHeight: number,
): HTMLCanvasElement[] {
  const sprites: HTMLCanvasElement[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const canvas = document.createElement('canvas');
      canvas.width = spriteWidth;
      canvas.height = spriteHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          image,
          col * spriteWidth,
          row * spriteHeight,
          spriteWidth,
          spriteHeight,
          0,
          0,
          spriteWidth,
          spriteHeight,
        );
        sprites.push(canvas);
      }
    }
  }

  return sprites;
}

/**
 * Cache for loaded assets
 */
class AssetCache {
  private cache = new Map<string, LoadedAsset>();

  get(url: string): LoadedAsset | undefined {
    return this.cache.get(url);
  }

  set(url: string, asset: LoadedAsset): void {
    this.cache.set(url, asset);
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const assetCache = new AssetCache();

/**
 * Load asset with caching
 */
export async function loadAssetCached(
  url: string,
  ctx: CanvasRenderingContext2D,
  options: AssetLoadOptions = {},
): Promise<LoadedAsset> {
  if (assetCache.has(url)) {
    return assetCache.get(url)!;
  }

  const asset = await loadImageWithFallback(url, ctx, options);
  assetCache.set(url, asset);
  return asset;
}
