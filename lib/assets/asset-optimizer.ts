/**
 * Asset Optimization Pipeline for Otaku-mori
 * Ensures all assets meet quality standards before deployment
 */

export interface AssetOptimizationConfig {
  images: {
    maxSizeKB: number;
    formats: string[];
    quality: number;
    generateWebP: boolean;
    generateAVIF: boolean;
  };
  audio: {
    maxSizeKB: number;
    bitrate: number;
    formats: string[];
  };
  models: {
    maxPolyCount: number;
    maxTextureSizePx: number;
    requireLODs: boolean;
  };
}

export const ASSET_STANDARDS: AssetOptimizationConfig = {
  images: {
    maxSizeKB: 100, // 100KB max for images
    formats: ['webp', 'jpg', 'png'],
    quality: 85,
    generateWebP: true,
    generateAVIF: true,
  },
  audio: {
    maxSizeKB: 50, // 50KB max for sound effects
    bitrate: 128, // 128kbps
    formats: ['mp3', 'ogg'],
  },
  models: {
    maxPolyCount: 25000, // 25k polygons max
    maxTextureSizePx: 2048, // 2K textures
    requireLODs: true, // Multiple detail levels
  },
};

export interface AssetValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  optimizations: string[];
  stats: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  };
}

/**
 * Validates an image asset against quality standards
 */
export async function validateImage(
  filePath: string,
  config: AssetOptimizationConfig['images'] = ASSET_STANDARDS.images,
): Promise<AssetValidationResult> {
  const result: AssetValidationResult = {
    valid: true,
    warnings: [],
    errors: [],
    optimizations: [],
    stats: {
      originalSize: 0,
      optimizedSize: 0,
      compressionRatio: 1.0,
    },
  };

  try {
    // Check if file exists
    const fs = await import('fs/promises');
    const stats = await fs.stat(filePath);
    result.stats.originalSize = stats.size;

    // Check file size
    const sizeKB = stats.size / 1024;
    if (sizeKB > config.maxSizeKB) {
      result.errors.push(
        `Image size ${sizeKB.toFixed(2)}KB exceeds limit of ${config.maxSizeKB}KB`,
      );
      result.valid = false;
    }

    // Check format
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (ext && !config.formats.includes(ext)) {
      result.warnings.push(
        `Format .${ext} not in recommended formats: ${config.formats.join(', ')}`,
      );
    }

    // Suggest WebP/AVIF conversion
    if (ext !== 'webp' && config.generateWebP) {
      result.optimizations.push('Generate WebP version for modern browsers');
    }
    if (ext !== 'avif' && config.generateAVIF) {
      result.optimizations.push('Generate AVIF version for best compression');
    }

    // Check for retina support
    if (!filePath.includes('@2x')) {
      result.optimizations.push('Generate @2x retina version');
    }
  } catch (error) {
    result.errors.push(
      `Failed to validate: ${error instanceof Error ? error.message : String(error)}`,
    );
    result.valid = false;
  }

  return result;
}

/**
 * Validates an audio asset against quality standards
 */
export async function validateAudio(
  filePath: string,
  config: AssetOptimizationConfig['audio'] = ASSET_STANDARDS.audio,
): Promise<AssetValidationResult> {
  const result: AssetValidationResult = {
    valid: true,
    warnings: [],
    errors: [],
    optimizations: [],
    stats: {
      originalSize: 0,
      optimizedSize: 0,
      compressionRatio: 1.0,
    },
  };

  try {
    const fs = await import('fs/promises');
    const stats = await fs.stat(filePath);
    result.stats.originalSize = stats.size;

    // Check file size
    const sizeKB = stats.size / 1024;
    if (sizeKB > config.maxSizeKB) {
      result.errors.push(
        `Audio size ${sizeKB.toFixed(2)}KB exceeds limit of ${config.maxSizeKB}KB`,
      );
      result.valid = false;
    }

    // Check format
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (ext && !config.formats.includes(ext)) {
      result.warnings.push(
        `Format .${ext} not in recommended formats: ${config.formats.join(', ')}`,
      );
    }

    // Suggest optimizations
    if (sizeKB > config.maxSizeKB * 0.8) {
      result.optimizations.push(`Consider reducing bitrate to ${config.bitrate}kbps`);
    }
  } catch (error) {
    result.errors.push(
      `Failed to validate: ${error instanceof Error ? error.message : String(error)}`,
    );
    result.valid = false;
  }

  return result;
}

/**
 * Validates a 3D model asset against quality standards
 */
export async function validate3DModel(
  filePath: string,
  config: AssetOptimizationConfig['models'] = ASSET_STANDARDS.models,
): Promise<AssetValidationResult> {
  const result: AssetValidationResult = {
    valid: true,
    warnings: [],
    errors: [],
    optimizations: [],
    stats: {
      originalSize: 0,
      optimizedSize: 0,
      compressionRatio: 1.0,
    },
  };

  try {
    const fs = await import('fs/promises');
    const stats = await fs.stat(filePath);
    result.stats.originalSize = stats.size;

    // Check format (should be GLTF/GLB)
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (ext !== 'glb' && ext !== 'gltf') {
      result.warnings.push('Recommended format is GLB or GLTF for web');
    }

    // Suggest optimizations
    result.optimizations.push('Use Draco compression for geometry');
    result.optimizations.push('Use KTX2 compression for textures');

    if (config.requireLODs) {
      result.optimizations.push('Generate LOD (Level of Detail) versions: high, medium, low');
    }

    // Check file size
    const sizeMB = stats.size / (1024 * 1024);
    if (sizeMB > 5) {
      result.warnings.push(`Model size ${sizeMB.toFixed(2)}MB is large. Consider optimization.`);
    }
  } catch (error) {
    result.errors.push(
      `Failed to validate: ${error instanceof Error ? error.message : String(error)}`,
    );
    result.valid = false;
  }

  return result;
}

/**
 * Batch validate all assets in a directory
 */
export async function validateAssetDirectory(
  directoryPath: string,
): Promise<Map<string, AssetValidationResult>> {
  const results = new Map<string, AssetValidationResult>();

  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const files = await fs.readdir(directoryPath, { recursive: true });

    for (const file of files) {
      if (typeof file !== 'string') continue;

      const fullPath = path.join(directoryPath, file);
      const stats = await fs.stat(fullPath);

      if (stats.isFile()) {
        const ext = file.split('.').pop()?.toLowerCase();

        let result: AssetValidationResult;
        if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg'].includes(ext || '')) {
          result = await validateImage(fullPath);
        } else if (['mp3', 'ogg', 'wav'].includes(ext || '')) {
          result = await validateAudio(fullPath);
        } else if (['glb', 'gltf'].includes(ext || '')) {
          result = await validate3DModel(fullPath);
        } else {
          continue; // Skip unknown file types
        }

        results.set(file, result);
      }
    }
  } catch (error) {
    console.error('Failed to validate directory:', error);
  }

  return results;
}

/**
 * Generate optimization report
 */
export function generateOptimizationReport(results: Map<string, AssetValidationResult>): {
  summary: {
    totalAssets: number;
    validAssets: number;
    assetsWithErrors: number;
    assetsWithWarnings: number;
    totalOriginalSize: number;
    potentialSavings: number;
  };
  details: Array<{
    file: string;
    status: 'valid' | 'warning' | 'error';
    issues: string[];
    optimizations: string[];
  }>;
} {
  const summary = {
    totalAssets: results.size,
    validAssets: 0,
    assetsWithErrors: 0,
    assetsWithWarnings: 0,
    totalOriginalSize: 0,
    potentialSavings: 0,
  };

  const details: Array<{
    file: string;
    status: 'valid' | 'warning' | 'error';
    issues: string[];
    optimizations: string[];
  }> = [];

  for (const [file, result] of results.entries()) {
    summary.totalOriginalSize += result.stats.originalSize;

    if (result.valid && result.warnings.length === 0) {
      summary.validAssets++;
    }
    if (result.errors.length > 0) {
      summary.assetsWithErrors++;
    }
    if (result.warnings.length > 0) {
      summary.assetsWithWarnings++;
    }

    // Estimate potential savings (assume 30% compression on average)
    const potentialSaving = result.stats.originalSize * 0.3;
    summary.potentialSavings += potentialSaving;

    details.push({
      file,
      status: result.errors.length > 0 ? 'error' : result.warnings.length > 0 ? 'warning' : 'valid',
      issues: [...result.errors, ...result.warnings],
      optimizations: result.optimizations,
    });
  }

  return { summary, details };
}
