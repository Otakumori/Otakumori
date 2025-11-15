/**
 * Runtime Registry Loader
 * Loads registry.json with procedural fallback
 * Never throws, always returns valid registry
 */

import type { AssetRegistry } from '../types/avatar';

let cachedRegistry: AssetRegistry | null = null;

/**
 * Load asset registry from JSON
 * If missing/empty → return procedural fallback registry
 * Cache registry in memory
 * Never throw, always return valid registry
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
    
    // Validate registry structure
    if (registry.version && registry.assets && registry.fallbacks) {
      cachedRegistry = registry as AssetRegistry;
      return cachedRegistry;
    } else {
      // Invalid structure, use fallback
      return createFallbackRegistry();
    }
  } catch (error) {
    // Log warning but don't throw
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to load asset registry, using procedural fallback:', error);
    }

    return createFallbackRegistry();
  }
}

/**
 * Create minimal fallback registry with procedural assets
 */
function createFallbackRegistry(): AssetRegistry {
  return {
    version: 1,
    assets: {
      head_default: {
        id: 'head_default',
        slot: 'Head',
        nsfw: false,
        url: '', // Empty = use procedural
        host: 'local',
        hash: '',
        coverage: 'minimal',
      },
      torso_default: {
        id: 'torso_default',
        slot: 'Torso',
        nsfw: false,
        url: '',
        host: 'local',
        hash: '',
        coverage: 'minimal',
      },
      legs_default: {
        id: 'legs_default',
        slot: 'Legs',
        nsfw: false,
        url: '',
        host: 'local',
        hash: '',
        coverage: 'minimal',
      },
      accessory_none: {
        id: 'accessory_none',
        slot: 'Accessory',
        nsfw: false,
        url: '',
        host: 'local',
        hash: '',
        coverage: 'minimal',
      },
    },
    fallbacks: {
      Head: 'head_default',
      Torso: 'torso_default',
      Legs: 'legs_default',
      Accessory: 'accessory_none',
    },
  };
}

/**
 * Get asset by ID from registry
 */
export function getAsset(registry: AssetRegistry, id: string) {
  return registry.assets[id];
}

/**
 * Get fallback asset for a slot
 */
export function getFallback(registry: AssetRegistry, slot: 'Head' | 'Torso' | 'Legs' | 'Accessory') {
  const fallbackId = registry.fallbacks[slot];
  return fallbackId ? getAsset(registry, fallbackId) : undefined;
}

/**
 * Clear cached registry (useful for testing)
 */
export function clearRegistryCache(): void {
  cachedRegistry = null;
}

