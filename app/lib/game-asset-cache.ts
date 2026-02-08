/**
 * Global asset cache for game assets
 * Allows preloader and game components to share loaded assets
 */

interface CachedAsset {
  url: string;
  type: 'sprite' | 'audio' | 'image';
  element: HTMLImageElement | HTMLAudioElement;
  loaded: boolean;
  error: boolean;
}

class GameAssetCache {
  private cache = new Map<string, CachedAsset>();

  /**
   * Store a loaded asset in the cache
   */
  set(url: string, asset: CachedAsset): void {
    this.cache.set(url, asset);
  }

  /**
   * Get a cached asset
   */
  get(url: string): CachedAsset | undefined {
    return this.cache.get(url);
  }

  /**
   * Check if an asset is already loaded
   */
  has(url: string): boolean {
    const asset = this.cache.get(url);
    return asset !== undefined && asset.loaded && !asset.error;
  }

  /**
   * Get the cached element (image or audio)
   */
  getElement(url: string): HTMLImageElement | HTMLAudioElement | null {
    const asset = this.cache.get(url);
    return asset?.element ?? null;
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const gameAssetCache = new GameAssetCache();

