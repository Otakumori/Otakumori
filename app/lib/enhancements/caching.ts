/**
 * Caching Utilities
 *
 * Utilities for caching and memory management
 */

/**
 * Simple in-memory cache with TTL
 */
export class Cache<K, V> {
  private cache = new Map<K, { value: V; expires: number }>();
  private defaultTTL: number;

  constructor(defaultTTL = 60000) {
    // Default 60 seconds
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expires });
  }

  /**
   * Check if key exists and is valid
   */
  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete key from cache
   */
  delete(key: K): void {
    this.cache.delete(key);
  }

  /**
   * Clear all expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    this.cleanup();
    return this.cache.size;
  }
}

/**
 * LRU Cache implementation
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    const value = this.cache.get(key)!;
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  /**
   * Check if key exists
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete key from cache
   */
  delete(key: K): void {
    this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Texture cache for image assets
 */
export class TextureCache {
  private cache = new Map<string, HTMLImageElement | HTMLCanvasElement>();
  private loading = new Map<string, Promise<HTMLImageElement | HTMLCanvasElement>>();

  /**
   * Load texture from URL
   */
  async load(url: string): Promise<HTMLImageElement | HTMLCanvasElement> {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Check if already loading
    if (this.loading.has(url)) {
      return this.loading.get(url)!;
    }

    // Start loading
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.cache.set(url, img);
        this.loading.delete(url);
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(url);
        reject(new Error(`Failed to load texture: ${url}`));
      };
      img.src = url;
    });

    this.loading.set(url, promise);
    return promise;
  }

  /**
   * Get cached texture
   */
  get(url: string): HTMLImageElement | HTMLCanvasElement | undefined {
    return this.cache.get(url);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.loading.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Global texture cache instance
let textureCacheInstance: TextureCache | null = null;

/**
 * Get global texture cache instance
 */
export function getTextureCache(): TextureCache {
  if (!textureCacheInstance) {
    textureCacheInstance = new TextureCache();
  }
  return textureCacheInstance;
}
