/**
 * Avatar validation and equipment resolution
 * Enforces NSFW policies and ensures all equipment resolves to valid URLs
 */

import type { AvatarSpecV15Type, EquipmentSlotType, PolicyResult } from '@om/avatar';
import { clampAllMorphs, isNSFWSlot } from '@om/avatar';
import type { AssetSlot } from '@om/game-kit';
import { getAssetsByIds, getCachedFallbackForSlot } from './db';

/**
 * Allowed asset hosts for equipment URLs (whitelist)
 */
export const ALLOWED_ASSET_HOSTS = ['assets.otakumori.com', 'public.blob.vercel-storage.com'];

/**
 * Resolved equipment with validated URLs
 */
export interface ResolvedEquipment {
  id: string;
  url: string;
}

/**
 * Result of rendering validation with resolved equipment
 */
export interface RenderableResult {
  resolved: Partial<Record<EquipmentSlotType, ResolvedEquipment | null>>;
  hadNSFWSwaps: boolean;
}

const HEAD_SLOTS = new Set<EquipmentSlotType>([
  'Head',
  'Face',
  'Eyes',
  'Eyebrows',
  'Nose',
  'Mouth',
  'Ears',
  'Hair',
  'FacialHair',
  'Eyelashes',
  'Headwear',
  'Eyewear',
  'Earrings',
  'AnimalEars',
  'Halo',
  'Horns',
]);

const TORSO_SLOTS = new Set<EquipmentSlotType>([
  'Torso',
  'Chest',
  'Arms',
  'Hands',
  'Underwear',
  'InnerWear',
  'OuterWear',
  'Gloves',
  'Back',
  'NSFWChest',
  'Shield',
]);

const LEG_SLOTS = new Set<EquipmentSlotType>([
  'Legs',
  'Feet',
  'Pants',
  'Shoes',
  'Tail',
  'NSFWGroin',
]);

function mapSlotToAssetSlot(slot: EquipmentSlotType): AssetSlot | null {
  if (HEAD_SLOTS.has(slot)) return 'Head';
  if (TORSO_SLOTS.has(slot)) return 'Torso';
  if (LEG_SLOTS.has(slot)) return 'Legs';
  return 'Accessory';
}

function isAssetNSFW(asset: any, slot: EquipmentSlotType): boolean {
  if (typeof asset?.nsfw === 'boolean') {
    return asset.nsfw || isNSFWSlot(slot);
  }
  if (typeof asset?.contentRating === 'string') {
    return asset.contentRating === 'nsfw' || isNSFWSlot(slot);
  }
  return isNSFWSlot(slot);
}

/**
 * Validates that a URL is from an allowed host
 */
export function isAllowedHost(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ALLOWED_ASSET_HOSTS.some((host) => urlObj.hostname === host);
  } catch {
    return false;
  }
}

/**
 * Resolves equipment IDs to URLs, applying NSFW policy and fallbacks
 * This is the core function that ensures safe rendering
 *
 * @param spec - Avatar specification with equipment IDs
 * @param policy - Resolved NSFW policy for this request
 * @returns Resolved equipment map with all URLs validated
 */
export async function assertRenderable(
  spec: AvatarSpecV15Type,
  policy: PolicyResult,
): Promise<RenderableResult> {
  const resolved: Partial<Record<EquipmentSlotType, ResolvedEquipment | null>> = {};
  let hadNSFWSwaps = false;

  // Ensure morphs are clamped
  const clampedSpec = clampAllMorphs(spec);

  // If no equipment, return empty result
  if (!clampedSpec.equipment || Object.keys(clampedSpec.equipment).length === 0) {
    return { resolved: {}, hadNSFWSwaps: false };
  }

  // Collect all equipment IDs
  const equipmentEntries = Object.entries(clampedSpec.equipment).filter(
    ([_slot, id]) => id !== null && id !== undefined,
  ) as [EquipmentSlotType, string][];

  if (equipmentEntries.length === 0) {
    return { resolved: {}, hadNSFWSwaps: false };
  }

  const ids = equipmentEntries.map(([_slot, id]) => id);

  // Fetch all assets in one query
  const assetsMap = await getAssetsByIds(ids);

  // Process each equipment slot
  for (const [slot, assetId] of equipmentEntries) {
    const asset = assetsMap.get(assetId);

    // Unknown asset - use fallback
    if (!asset) {
      const fallbackSlot = mapSlotToAssetSlot(slot);
      if (fallbackSlot) {
        const fallback = await getCachedFallbackForSlot(fallbackSlot);
        resolved[slot] = {
          id: fallback.id,
          url: fallback.url,
        };
        hadNSFWSwaps = true;
      } else {
        resolved[slot] = null;
        hadNSFWSwaps = true;
      }
      continue;
    }

    // Check if URL is from allowed host
    if (!isAllowedHost(asset.url)) {
      const fallbackSlot = mapSlotToAssetSlot(slot);
      if (fallbackSlot) {
        const fallback = await getCachedFallbackForSlot(fallbackSlot);
        resolved[slot] = {
          id: fallback.id,
          url: fallback.url,
        };
      } else {
        resolved[slot] = null;
      }
      hadNSFWSwaps = true;
      continue;
    }

    // NSFW content check
    const nsfw = isAssetNSFW(asset, slot);

    if (nsfw && !policy.nsfwAllowed) {
      // Swap to safe fallback
      const fallbackSlot = mapSlotToAssetSlot(slot);
      if (fallbackSlot) {
        const fallback = await getCachedFallbackForSlot(fallbackSlot);
        resolved[slot] = {
          id: fallback.id,
          url: fallback.url,
        };
      } else {
        resolved[slot] = null;
      }
      hadNSFWSwaps = true;
    } else {
      // Asset is safe or policy allows it
      resolved[slot] = {
        id: asset.id,
        url: asset.url,
      };
    }
  }

  return { resolved, hadNSFWSwaps };
}

/**
 * Error codes for publishable validation
 */
export const VALIDATION_ERROR_CODES = {
  NSFW_NOT_ALLOWED: 'NSFW_NOT_ALLOWED',
  INVALID_ASSET: 'INVALID_ASSET',
  DISALLOWED_HOST: 'DISALLOWED_HOST',
} as const;

/**
 * Validation error for publishable checks
 */
export class ValidationError extends Error {
  constructor(
    public code: keyof typeof VALIDATION_ERROR_CODES,
    message: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates that a spec can be published with the given policy
 * Throws ValidationError if NSFW content is present when policy disallows
 *
 * @param spec - Avatar specification to validate
 * @param policy - Resolved NSFW policy
 * @throws ValidationError if validation fails
 */
export async function assertPublishable(
  spec: AvatarSpecV15Type,
  policy: PolicyResult,
): Promise<void> {
  if (!spec.equipment) {
    return;
  }

  const equipmentEntries = Object.entries(spec.equipment).filter(
    ([_slot, id]) => id !== null && id !== undefined,
  ) as [EquipmentSlotType, string][];

  if (equipmentEntries.length === 0) {
    return;
  }

  const ids = equipmentEntries.map(([_slot, id]) => id);
  const assetsMap = await getAssetsByIds(ids);

  for (const [slot, assetId] of equipmentEntries) {
    const asset = assetsMap.get(assetId);

    if (!asset) {
      throw new ValidationError('INVALID_ASSET', `Asset ${assetId} not found for slot ${slot}`);
    }

    if (!isAllowedHost(asset.url)) {
      throw new ValidationError(
        'DISALLOWED_HOST',
        `Asset ${assetId} URL is not from an allowed host`,
      );
    }

    const nsfw = isAssetNSFW(asset, slot);

    if (nsfw && !policy.nsfwAllowed) {
      throw new ValidationError(
        'NSFW_NOT_ALLOWED',
        `NSFW content in slot ${slot} is not allowed by current policy`,
      );
    }
  }
}
