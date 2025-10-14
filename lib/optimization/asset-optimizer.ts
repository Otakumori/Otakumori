/**
 * Asset Optimization Pipeline
 * Ensures all game assets meet quality standards
 */

export interface AssetQualityConfig {
  maxImageSize: number; // bytes
  maxTextureResolution: number; // pixels
  supportedFormats: string[];
  compressionQuality: number; // 0-100
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  warnings: string[];
}

export const ASSET_QUALITY_STANDARDS = {
  images: {
    maxSize: 100 * 1024, // 100KB
    formats: ['webp', 'avif', 'png', 'jpg'],
    quality: 85,
  },
  textures: {
    maxSize: 512 * 1024, // 512KB
    maxResolution: 2048,
    formats: ['ktx2', 'webp'],
    quality: 90,
  },
  models: {
    maxPolyCount: 25000,
    maxTextureSize: 2048,
    formats: ['glb', 'gltf'],
  },
  audio: {
    maxSize: 200 * 1024, // 200KB
    formats: ['webm', 'mp3', 'ogg'],
    bitrate: 128, // kbps
  },
} as const;

/**
 * Validates image meets quality standards
 */
export async function validateImage(
  imageUrl: string,
  options: Partial<AssetQualityConfig> = {},
): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];

  try {
    // Check file extension
    const extension = imageUrl.split('.').pop()?.toLowerCase();
    const supportedFormats = options.supportedFormats || ASSET_QUALITY_STANDARDS.images.formats;

    if (extension && !supportedFormats.includes(extension as 'png' | 'jpg' | 'webp' | 'avif')) {
      issues.push(`Unsupported format: ${extension}. Use ${supportedFormats.join(', ')}`);
    }

    // In browser environment, check actual file size
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const size = blob.size;
        const maxSize = options.maxImageSize || ASSET_QUALITY_STANDARDS.images.maxSize;

        if (size > maxSize) {
          issues.push(
            `Image too large: ${(size / 1024).toFixed(2)}KB exceeds ${(maxSize / 1024).toFixed(2)}KB limit`,
          );
        }

        // Check dimensions
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(blob);
        });

        const maxResolution =
          options.maxTextureResolution || ASSET_QUALITY_STANDARDS.textures.maxResolution;
        if (img.width > maxResolution || img.height > maxResolution) {
          issues.push(`Resolution too high: ${img.width}x${img.height} exceeds ${maxResolution}px`);
        }

        URL.revokeObjectURL(img.src);
      } catch (error) {
        issues.push(
          `Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  } catch (error) {
    return {
      valid: false,
      issues: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Generate responsive image srcset
 */
export function generateResponsiveImages(
  baseUrl: string,
  sizes: number[] = [640, 768, 1024, 1280, 1920],
): string {
  return sizes.map((size) => `${baseUrl}?w=${size} ${size}w`).join(', ');
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'png' {
  if (typeof window === 'undefined') return 'webp';

  // Check AVIF support
  const avifSupport =
    document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;

  if (avifSupport) return 'avif';

  // Check WebP support
  const webpSupport =
    document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;

  if (webpSupport) return 'webp';

  return 'png';
}

/**
 * Preload critical assets
 */
export function preloadAssets(assets: { url: string; type: 'image' | 'font' | 'audio' }[]): void {
  if (typeof window === 'undefined') return;

  assets.forEach(({ url, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;

    switch (type) {
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
      case 'audio':
        link.as = 'fetch';
        break;
    }

    document.head.appendChild(link);
  });
}

/**
 * Lazy load images with Intersection Observer
 */
export function setupLazyLoading(selector: string = 'img[data-lazy]'): void {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll(selector);

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.lazy;

          if (src) {
            img.src = src;
            img.removeAttribute('data-lazy');
            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px', // Start loading 50px before viewport
    },
  );

  images.forEach((img) => imageObserver.observe(img));
}

/**
 * Monitor asset loading performance
 */
export interface AssetPerformanceMetrics {
  url: string;
  size: number;
  duration: number;
  type: string;
}

export function monitorAssetPerformance(): AssetPerformanceMetrics[] {
  if (typeof window === 'undefined' || !window.performance) return [];

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  return resources
    .filter((resource) => {
      const type = resource.initiatorType;
      return ['img', 'css', 'script', 'fetch', 'xmlhttprequest'].includes(type);
    })
    .map((resource) => ({
      url: resource.name,
      size: resource.transferSize,
      duration: resource.duration,
      type: resource.initiatorType,
    }))
    .sort((a, b) => b.size - a.size); // Largest first
}

/**
 * Generate asset optimization report
 */
export interface AssetReport {
  totalAssets: number;
  totalSize: number;
  largestAssets: AssetPerformanceMetrics[];
  slowestAssets: AssetPerformanceMetrics[];
  recommendations: string[];
}

export function generateAssetReport(): AssetReport {
  const metrics = monitorAssetPerformance();
  const totalSize = metrics.reduce((sum, m) => sum + m.size, 0);
  const largestAssets = metrics.slice(0, 10);
  const slowestAssets = [...metrics].sort((a, b) => b.duration - a.duration).slice(0, 10);

  const recommendations: string[] = [];

  // Check for large assets
  largestAssets.forEach((asset) => {
    if (asset.size > ASSET_QUALITY_STANDARDS.images.maxSize && asset.type === 'img') {
      recommendations.push(`Optimize image: ${asset.url} (${(asset.size / 1024).toFixed(2)}KB)`);
    }
  });

  // Check for slow assets
  slowestAssets.forEach((asset) => {
    if (asset.duration > 1000) {
      recommendations.push(`Slow loading: ${asset.url} (${asset.duration.toFixed(0)}ms)`);
    }
  });

  // Check total bundle size
  if (totalSize > 500 * 1024) {
    recommendations.push(
      `Total asset size exceeds 500KB limit: ${(totalSize / 1024).toFixed(2)}KB`,
    );
  }

  return {
    totalAssets: metrics.length,
    totalSize,
    largestAssets,
    slowestAssets,
    recommendations,
  };
}
