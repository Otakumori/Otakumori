/**
 * Registry Builder
 * Builds registry.json from scan results
 * Finds safe fallbacks per slot
 * Validates fallback availability
 * Generates procedural fallbacks if needed
 */

import type { AssetRegistry, AssetMeta } from '../types/avatar';
import type { ScanResults } from './scanner';

/**
 * Build registry.json from scan results
 */
export function buildRegistry(scanResults: ScanResults): AssetRegistry {
  const assets: Record<string, AssetMeta> = {};

  // Convert scanned assets to registry format
  for (const scanned of scanResults.assets) {
    if (!scanned.slot) continue; // Skip assets without slot

    const meta: AssetMeta = {
      id: scanned.id,
      slot: scanned.slot,
      nsfw: scanned.nsfw,
      url: scanned.path,
      host: 'local',
      hash: scanned.hash,
      coverage: 'standard', // Could be determined from file size/type
    };

    assets[scanned.id] = meta;
  }

  // Find safe fallbacks per slot
  const fallbacks = findFallbacks(assets);

  // Validate fallbacks
  validateFallbacks(fallbacks, assets);

  return {
    version: 1,
    assets,
    fallbacks,
  };
}

/**
 * Find safe fallbacks for each slot
 */
function findFallbacks(
  assets: Record<string, AssetMeta>,
): Record<'Head' | 'Torso' | 'Legs' | 'Accessory', string> {
  const fallbacks: Record<'Head' | 'Torso' | 'Legs' | 'Accessory', string> = {
    Head: '',
    Torso: '',
    Legs: '',
    Accessory: '',
  };

  const slots: Array<'Head' | 'Torso' | 'Legs' | 'Accessory'> = [
    'Head',
    'Torso',
    'Legs',
    'Accessory',
  ];

  for (const slot of slots) {
    // Find first safe (non-NSFW) asset for this slot
    const safeAsset = Object.values(assets).find((asset) => asset.slot === slot && !asset.nsfw);

    if (safeAsset) {
      fallbacks[slot] = safeAsset.id;
    } else {
      // No safe asset found, use procedural fallback ID
      fallbacks[slot] = `${slot.toLowerCase()}_default`;
    }
  }

  return fallbacks;
}

/**
 * Validate fallback availability
 */
function validateFallbacks(
  fallbacks: Record<'Head' | 'Torso' | 'Legs' | 'Accessory', string>,
  assets: Record<string, AssetMeta>,
): void {
  const slots: Array<'Head' | 'Torso' | 'Legs' | 'Accessory'> = [
    'Head',
    'Torso',
    'Legs',
    'Accessory',
  ];

  for (const slot of slots) {
    const fallbackId = fallbacks[slot];
    if (!fallbackId) {
      console.warn(`Warning: No fallback found for slot ${slot}`);
      continue;
    }

    const fallback = assets[fallbackId];
    if (!fallback) {
      // Procedural fallback - this is OK
      continue;
    }

    if (fallback.nsfw) {
      console.warn(`Warning: Fallback asset ${fallbackId} for slot ${slot} is NSFW`);
    }
  }
}
