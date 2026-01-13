/**
 * Asset curator - Builds registry.json and generates thumbnails
 * Run with: pnpm assets:curate
 */

import { logger } from '@/app/lib/logger';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import type { ScanResults, ScannedAsset } from './scan';

interface AssetMeta {
  id: string;
  slot: 'Head' | 'Torso' | 'Legs' | 'Accessory';
  nsfw: boolean;
  url: string;
  host: 'local' | 'cdn';
  hash: string;
  coverage: 'standard' | 'minimal' | 'full';
  }

interface AssetRegistry {
  version: number;
  assets: Record<string, AssetMeta>;
  fallbacks: Record<string, string>;
}

/**
 * Main curate function
 */
async function curateAssets(): Promise<AssetRegistry> {
  logger.warn('🎨 Curating assets...');

  // Load scan results
  const scanPath = 'app/lib/assets/scan-results.json';
  if (!existsSync(scanPath)) {
    throw new Error('Scan results not found. Run "pnpm assets:scan" first.');
  }

  const scanData = await readFile(scanPath, 'utf-8');
  const scanResults: ScanResults = JSON.parse(scanData);

  logger.warn(`Processing ${scanResults.totalAssets} assets...`);

  // Filter valid assets (must have slot)
  const validAssets = scanResults.assets.filter((a) => a.slot !== null);

  // Build asset registry
  const assets: Record<string, AssetMeta> = {};

  for (const scanned of validAssets) {
    const meta: AssetMeta = {
      id: scanned.id,
      slot: scanned.slot as any,
      nsfw: scanned.nsfw,
      url: scanned.path,
      host: 'local',
      hash: scanned.hash,
      coverage: determineCoverage(scanned),
    };

    assets[scanned.id] = meta;
  }

  // Find fallbacks (first safe asset per slot)
  const fallbacks = findFallbacks(assets);

  // Validate fallbacks
  validateFallbacks(fallbacks);

  const registry: AssetRegistry = {
    version: 1,
    assets,
    fallbacks,
  };

  logger.warn(`✅ Created registry with ${Object.keys(assets).length} assets`);

  return registry;
}

/**
 * Determine asset coverage level
 */
function determineCoverage(asset: ScannedAsset): 'standard' | 'minimal' | 'full' {
  // Simple heuristic based on filename
  if (asset.filename.includes('_full')) return 'full';
  if (asset.filename.includes('_minimal')) return 'minimal';
  return 'standard';
}

/**
 * Find fallback assets (first safe asset per slot)
 */
function findFallbacks(assets: Record<string, AssetMeta>): Record<string, string> {
  const fallbacks: Record<string, string> = {
    Head: '',
    Torso: '',
    Legs: '',
    Accessory: '',
  };

  const slots = ['Head', 'Torso', 'Legs', 'Accessory'];

  for (const slot of slots) {
    // Find first safe asset for this slot
    const safeAsset = Object.values(assets).find((a) => a.slot === slot && !a.nsfw);

    if (safeAsset) {
      fallbacks[slot] = safeAsset.id;
    }
  }

  return fallbacks;
}

/**
 * Validate fallbacks exist and are safe
 */
function validateFallbacks(fallbacks: Record<string, string>): void {
  const slots = ['Head', 'Torso', 'Legs', 'Accessory'];
  const missing: string[] = [];

  for (const slot of slots) {
    if (!fallbacks[slot]) {
      missing.push(slot);
    }
  }

  if (missing.length > 0) {
    logger.warn(`⚠️  Missing safe fallbacks for slots: ${missing.join(', ')}`);
    logger.warn('   Assets in these slots will not be usable without fallbacks.');
  }
}

/**
 * Generate SVG placeholder thumbnail
 */
function generateSVGThumbnail(asset: AssetMeta): string {
  // Slot colors
  const colors: Record<string, string> = {
    Head: '#3B82F6', // Blue
    Torso: '#10B981', // Green
    Legs: '#F59E0B', // Orange
    Accessory: '#A855F7', // Purple
  };

  const bgColor = colors[asset.slot] || '#6B7280';
  const nsfwTint = asset.nsfw ? 'rgba(239, 68, 68, 0.3)' : 'transparent';

  return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="${bgColor}"/>
  <rect width="200" height="200" fill="${nsfwTint}"/>
  <text x="100" y="90" font-family="Arial" font-size="16" fill="white" text-anchor="middle" font-weight="bold">
    ${asset.slot}
  </text>
  <text x="100" y="110" font-family="Arial" font-size="12" fill="white" text-anchor="middle">
    ${asset.id}
  </text>
  ${
    asset.nsfw
      ? '<text x="100" y="130" font-family="Arial" font-size="10" fill="#FCA5A5" text-anchor="middle">NSFW</text>'
      : ''
  }
</svg>`;
}

/**
 * Save registry and generate thumbnails
 */
async function saveRegistry(registry: AssetRegistry): Promise<void> {
  // Save registry JSON
  const registryPath = 'app/lib/assets/registry.json';
  await writeFile(registryPath, JSON.stringify(registry, null, 2));
  logger.warn(`✅ Registry saved to ${registryPath}`);

  // Create thumbs directory
  const thumbsDir = 'app/lib/assets/thumbs';
  if (!existsSync(thumbsDir)) {
    await mkdir(thumbsDir, { recursive: true });
  }

  // Generate SVG thumbnails
  let thumbCount = 0;
  for (const [id, asset] of Object.entries(registry.assets)) {
    const svg = generateSVGThumbnail(asset);
    const thumbPath = `${thumbsDir}/${id}.svg`;
    await writeFile(thumbPath, svg);
    thumbCount++;
  }

  logger.warn(`✅ Generated ${thumbCount} SVG thumbnails in ${thumbsDir}/`);
}

/**
 * Main execution
 */
async function main() {
  try {
    const registry = await curateAssets();
    await saveRegistry(registry);
    logger.warn('\n✨ Asset curation complete!');
  } catch (error) {
    logger.error('❌ Curation failed:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { curateAssets, saveRegistry };
