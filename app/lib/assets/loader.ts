/**
 * Asset loader - Runtime loading using registry
 */

import type { AssetMeta, AssetSlot } from '@om/game-kit';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}
import {
  loadRegistry as loadRegistryFromPackage,
  getAsset,
  getSafeAlternative,
} from '@om/game-kit';

/**
 * Load an asset with policy enforcement
 */
export async function loadAssetWithPolicy(
  assetId: string,
  nsfwAllowed: boolean,
): Promise<AssetMeta | null> {
  const registry = await loadRegistryFromPackage();
  let asset = getAsset(registry, assetId);

  if (!asset) {
    return null;
  }

  // If NSFW not allowed and asset is NSFW, get safe alternative
  if (!nsfwAllowed && asset.nsfw) {
    asset = getSafeAlternative(registry, assetId);
  }

  return asset || null;
}

/**
 * Load assets for all equipment slots
 */
export async function loadEquipmentAssets(
  equipment: Record<AssetSlot, string>,
  nsfwAllowed: boolean,
): Promise<Record<AssetSlot, AssetMeta | null>> {
  const results: Record<AssetSlot, AssetMeta | null> = {
    Head: null,
    Torso: null,
    Legs: null,
    Accessory: null,
  };

  for (const [slot, assetId] of Object.entries(equipment)) {
    results[slot as AssetSlot] = await loadAssetWithPolicy(assetId, nsfwAllowed);
  }

  return results;
}

/**
 * Get thumbnail URL for an asset
 */
export function getThumbnailUrl(assetId: string): string {
  return `/assets/thumbs/${assetId}.svg`;
}

/**
 * Preload asset (e.g., for 3D models)
 */
export async function preloadAsset(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to preload ${url}: ${response.statusText}`);
    }
    // Asset is now in browser cache
  } catch (error) {
    getLogger().then((logger) => {
      logger.warn(`Failed to preload asset ${url}:`, undefined, { error: error instanceof Error ? error : new Error(String(error)) });
    });
  }
}

/**
 * Batch preload multiple assets
 */
export async function preloadAssets(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => preloadAsset(url)));
}
