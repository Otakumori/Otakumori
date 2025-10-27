/**
 * Equipment resolver - Bridges policy with asset loading
 */

import type { ContentPolicy } from '../policy/fromRequest';
import type { AssetMeta, AssetSlot } from '@om/game-kit';
import { loadRegistry, getAsset, getSafeAlternative, getFallback } from '@om/game-kit';

export interface EquipmentSpec {
  head?: string;
  torso?: string;
  legs?: string;
  accessory?: string;
}

export interface ResolvedEquipment {
  head: AssetMeta | null;
  torso: AssetMeta | null;
  legs: AssetMeta | null;
  accessory: AssetMeta | null;
  urls: Record<AssetSlot, string>;
  wasFiltered: boolean; // True if any NSFW was replaced
}

/**
 * Resolve equipment for game with policy enforcement
 */
export async function resolveEquipmentForGame(
  spec: EquipmentSpec,
  policy: ContentPolicy,
): Promise<ResolvedEquipment> {
  const registry = await loadRegistry();
  let wasFiltered = false;

  const resolved: ResolvedEquipment = {
    head: null,
    torso: null,
    legs: null,
    accessory: null,
    urls: {
      Head: '',
      Torso: '',
      Legs: '',
      Accessory: '',
    },
    wasFiltered: false,
  };

  // Resolve each slot
  const slots: Array<{ key: keyof EquipmentSpec; slot: AssetSlot }> = [
    { key: 'head', slot: 'Head' },
    { key: 'torso', slot: 'Torso' },
    { key: 'legs', slot: 'Legs' },
    { key: 'accessory', slot: 'Accessory' },
  ];

  for (const { key, slot } of slots) {
    const assetId = spec[key];

    if (!assetId) {
      // Use fallback
      const fallback = getFallback(registry, slot);
      if (fallback) {
        resolved[key] = fallback;
        resolved.urls[slot] = fallback.url;
      }
      continue;
    }

    // Get asset
    let asset = getAsset(registry, assetId);

    if (!asset) {
      // Asset not found, use fallback
      const fallback = getFallback(registry, slot);
      if (fallback) {
        resolved[key] = fallback;
        resolved.urls[slot] = fallback.url;
      }
      continue;
    }

    // Apply NSFW policy
    if (asset.nsfw && !policy.nsfwAllowed) {
      const safeAlt = getSafeAlternative(registry, assetId);
      if (safeAlt) {
        asset = safeAlt;
        wasFiltered = true;
      }
    }

    resolved[key] = asset;
    resolved.urls[slot] = asset.url;
  }

  resolved.wasFiltered = wasFiltered;

  return resolved;
}

/**
 * Assert equipment is renderable (validation)
 */
export function assertRenderable(
  spec: EquipmentSpec,
  _policy: ContentPolicy,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate spec structure
  if (typeof spec !== 'object') {
    errors.push('Equipment spec must be an object');
    return { valid: false, errors };
  }

  // Validate slot IDs are strings (if provided)
  const slots: Array<keyof EquipmentSpec> = ['head', 'torso', 'legs', 'accessory'];
  for (const slot of slots) {
    const value = spec[slot];
    if (value !== undefined && typeof value !== 'string') {
      errors.push(`${slot} must be a string`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default equipment spec
 */
export function getDefaultEquipment(): EquipmentSpec {
  return {
    head: 'head_default',
    torso: 'torso_default',
    legs: 'legs_default',
    accessory: 'accessory_none',
  };
}
