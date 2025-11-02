#!/usr/bin/env node

/**
 * Asset Verification Script - Enterprise Implementation
 */

import { readFileSync, statSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface AssetEntry {
  path: string;
  size?: string;
  format: string;
  description: string;
  count?: number;
  duration?: string;
}

interface AssetManifestEntry {
  path: string;
  size?: number;
  hash?: string;
  type?: string;
  [key: string]: any;
}

interface AssetManifest {
  [key: string]: AssetManifestEntry | null;
}

// Size limits in bytes
const SIZE_LIMITS = {
  png: 500 * 1024, // 500KB
  webp: 300 * 1024, // 300KB
  svg: 50 * 1024, // 50KB
  ogg: 2 * 1024 * 1024, // 2MB
  mp3: 2 * 1024 * 1024, // 2MB
};

const ALLOWED_FORMATS = {
  images: ['png', 'webp', 'svg', 'jpg', 'jpeg'],
  audio: ['ogg', 'mp3', 'wav'],
};

class AssetVerifier {
  private manifest: AssetManifest;
  private errors: string[] = [];
  private warnings: string[] = [];
  private stats = {
    totalAssets: 0,
    missingAssets: 0,
    oversizedAssets: 0,
    invalidFormats: 0,
    validated: 0,
  };

  constructor(manifest: AssetManifest) {
    this.manifest = manifest;
  }

  async verify(): Promise<boolean> {
    // '⌕ Starting asset verification...'
    // ` Manifest version: ${this.manifest.version}`

    await this.verifyAssetSection('ui', this.manifest.ui);
    await this.verifyAssetSection('shared', this.manifest.shared);

    // Verify game assets
    for (const [gameId, gameAssets] of Object.entries(this.manifest.games)) {
      await this.verifyGameAssets(gameId, gameAssets);
    }

    this.printResults();
    return this.errors.length === 0;
  }

  private async verifyAssetSection(section: string, assets: any): Promise<void> {
    // `\n Verifying ${section} assets...`

    for (const [key, asset] of Object.entries(assets)) {
      if (typeof asset === 'object' && asset.path) {
        await this.verifyAsset(section, key, asset as AssetEntry);
      } else if (typeof asset === 'object') {
        // Nested assets (like shared.icons, shared.audio)
        for (const [subKey, subAsset] of Object.entries(asset)) {
          if (typeof subAsset === 'object' && subAsset.path) {
            await this.verifyAsset(`${section}.${key}`, subKey, subAsset as AssetEntry);
          }
        }
      }
    }
  }

  private async verifyGameAssets(gameId: string, gameAssets: any): Promise<void> {
    // `\n Verifying ${gameId} assets...`

    const processAssets = async (obj: any, prefix = ''): Promise<void> => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value.path) {
          await this.verifyAsset(`games.${gameId}${prefix}`, key, value as AssetEntry);
        } else if (typeof value === 'object' && !value.path) {
          await processAssets(value, `${prefix}.${key}`);
        }
      }
    };

    await processAssets(gameAssets);
  }

  private async verifyAsset(section: string, key: string, asset: AssetEntry): Promise<void> {
    this.stats.totalAssets++;
    const assetPath = asset.path.replace('public/', '');
    const fullPath = join(process.cwd(), 'public', assetPath.replace('public/assets/', 'assets/'));

    try {
      // Handle glob patterns
      if (asset.path.includes('*')) {
        await this.verifyGlobAsset(section, key, asset);
        return;
      }

      // Check if file exists
      const stats = statSync(fullPath);

      if (!stats.isFile()) {
        this.errors.push(` ${section}.${key}: Not a file - ${asset.path}`);
        this.stats.missingAssets++;
        return;
      }

      // Verify file format
      const ext = join(process.cwd(), 'public', assetPath).split('.').pop()?.toLowerCase() || '';
      if (!this.isValidFormat(ext)) {
        this.errors.push(` ${section}.${key}: Invalid format '${ext}' - ${asset.path}`);
        this.stats.invalidFormats++;
        return;
      }

      // Check file size
      const sizeLimit = SIZE_LIMITS[ext as keyof typeof SIZE_LIMITS];
      if (sizeLimit && stats.size > sizeLimit) {
        this.errors.push(
          ` ${section}.${key}: File too large (${this.formatBytes(stats.size)} > ${this.formatBytes(sizeLimit)}) - ${asset.path}`,
        );
        this.stats.oversizedAssets++;
        return;
      }

      // Validate expected format matches actual
      if (asset.format !== ext) {
        this.warnings.push(
          `  ${section}.${key}: Format mismatch (expected ${asset.format}, got ${ext}) - ${asset.path}`,
        );
      }

      this.stats.validated++;
      // ` ${section}.${key} - ${this.formatBytes(stats.size}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';
      this.errors.push(
        ` ${section}.${key}: File not found - ${asset.path} (${reason})`,
      );
      this.stats.missingAssets++;
    }
  }

  private async verifyGlobAsset(section: string, key: string, asset: AssetEntry): Promise<void> {
    const globPattern = asset.path.replace('public/', '');
    const matches = await glob(globPattern, { cwd: join(process.cwd(), 'public') });

    if (matches.length === 0) {
      this.errors.push(` ${section}.${key}: No files match pattern - ${asset.path}`);
      this.stats.missingAssets++;
      return;
    }

    if (asset.count && matches.length !== asset.count) {
      this.warnings.push(
        `  ${section}.${key}: Expected ${asset.count} files, found ${matches.length} - ${asset.path}`,
      );
    }

    // Verify each matched file
    for (const match of matches) {
      const fullPath = join(process.cwd(), 'public', match);
      try {
        const stats = statSync(fullPath);
        const ext = join(process.cwd(), 'public', match).split('.').pop()?.toLowerCase() || '';

        const sizeLimit = SIZE_LIMITS[ext as keyof typeof SIZE_LIMITS];
        if (sizeLimit && stats.size > sizeLimit) {
          this.errors.push(
            ` ${section}.${key}: File too large (${this.formatBytes(stats.size)}) - ${match}`,
          );
          this.stats.oversizedAssets++;
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'unknown error';
        this.errors.push(` ${section}.${key}: File error - ${match} (${reason})`);
      }
    }

    this.stats.validated += matches.length;
    // ` ${section}.${key} - ${matches.length} files`
  }

  private isValidFormat(ext: string): boolean {
    return [...ALLOWED_FORMATS.images, ...ALLOWED_FORMATS.audio].includes(ext);
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  private printResults(): void {
    console.warn('\nAsset Verification Results');
    console.warn('===========================');
    console.warn(`Total assets: ${this.stats.totalAssets}`);
    console.warn(`Validated: ${this.stats.validated}`);
    console.warn(`Missing: ${this.stats.missingAssets}`);
    console.warn(`Oversized: ${this.stats.oversizedAssets}`);
    console.warn(`Invalid formats: ${this.stats.invalidFormats}`);

    if (this.warnings.length > 0) {
      console.warn('\nWarnings:');
      this.warnings.forEach((warning) => {
        console.warn(`  • ${warning}`);
      });
    }

    if (this.errors.length > 0) {
      console.error('\nErrors:');
      this.errors.forEach((error) => {
        console.error(`  • ${error}`);
      });
      console.error(`\nAsset verification failed with ${this.errors.length} error(s).`);
    } else {
      console.warn('\nAll assets verified successfully ✅');
    }
  }
}

async function main() {
  try {
    // Load manifest
    const manifestPath = join(process.cwd(), 'public/assets/manifest.json');
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    const manifest: AssetManifest = JSON.parse(manifestContent);

    // Verify assets
    const verifier = new AssetVerifier(manifest);
    const success = await verifier.verify();

    // Exit with appropriate code
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(' Asset verification script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { AssetVerifier };
