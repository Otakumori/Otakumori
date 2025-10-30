/**
 * Asset registry types and runtime loader
 */

export type AssetSlot = 'Head' | 'Torso' | 'Legs' | 'Accessory';
export type AssetHost = 'local' | 'cdn';
export type AssetCoverage = 'standard' | 'minimal' | 'full';

export interface AssetMeta {
  id: string;
  slot: AssetSlot;
  nsfw: boolean;
  url: string;
  host: AssetHost;
  hash: string;
  coverage: AssetCoverage;
}

export interface AssetRegistry {
  version: number;
  assets: Record<string, AssetMeta>;
  fallbacks: Record<AssetSlot, string>; // slot -> asset id
}

let cachedRegistry: AssetRegistry | null = null;

/**
 * Load asset registry from JSON
 */
export async function loadRegistry(): Promise<AssetRegistry> {
  if (cachedRegistry) {
    return cachedRegistry;
  }

  try {
    const response = await fetch('/assets/registry.json');
    if (!response.ok) {
      throw new Error(`Failed to load registry: ${response.statusText}`);
    }

    const registry = await response.json();
    cachedRegistry = registry as AssetRegistry;
    return cachedRegistry;
  } catch (error) {
    console.error('Failed to load asset registry:', error);

    // Return minimal fallback registry
    return createFallbackRegistry();
  }
}

/**
 * Get asset by ID
 */
export function getAsset(registry: AssetRegistry, id: string): AssetMeta | undefined {
  return registry.assets[id];
}

/**
 * List assets by slot
 */
export function listAssetsBySlot(
  registry: AssetRegistry,
  slot: AssetSlot,
  options: { nsfw?: boolean } = {},
): AssetMeta[] {
  const assets = Object.values(registry.assets);

  return assets.filter((asset) => {
    if (asset.slot !== slot) {
      return false;
    }

    // Filter by NSFW if specified
    if (options.nsfw !== undefined && asset.nsfw !== options.nsfw) {
      return false;
    }

    return true;
  });
}

/**
 * Get fallback asset for a slot
 */
export function getFallback(registry: AssetRegistry, slot: AssetSlot): AssetMeta | undefined {
  const fallbackId = registry.fallbacks[slot];
  return fallbackId ? getAsset(registry, fallbackId) : undefined;
}

/**
 * Get safe alternative for an asset
 */
export function getSafeAlternative(
  registry: AssetRegistry,
  assetId: string,
): AssetMeta | undefined {
  const asset = getAsset(registry, assetId);
  if (!asset) {
    return undefined;
  }

  // If already safe, return it
  if (!asset.nsfw) {
    return asset;
  }

  // Find safe alternative in same slot
  const safeAssets = listAssetsBySlot(registry, asset.slot, { nsfw: false });
  return safeAssets[0] || getFallback(registry, asset.slot);
}

/**
 * Validate registry
 */
export function validateRegistry(registry: AssetRegistry): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check version
  if (registry.version !== 1) {
    errors.push(`Invalid registry version: ${registry.version}`);
  }

  // Check fallbacks exist for all slots
  const slots: AssetSlot[] = ['Head', 'Torso', 'Legs', 'Accessory'];
  for (const slot of slots) {
    const fallbackId = registry.fallbacks[slot];
    if (!fallbackId) {
      errors.push(`Missing fallback for slot: ${slot}`);
      continue;
    }

    const fallback = getAsset(registry, fallbackId);
    if (!fallback) {
      errors.push(`Fallback asset not found: ${fallbackId} for slot ${slot}`);
    } else if (fallback.nsfw) {
      errors.push(`Fallback asset is NSFW: ${fallbackId} for slot ${slot}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a minimal fallback registry
 */
function createFallbackRegistry(): AssetRegistry {
  return {
    version: 1,
    assets: {},
    fallbacks: {
      Head: '',
      Torso: '',
      Legs: '',
      Accessory: '',
    },
  };
}
