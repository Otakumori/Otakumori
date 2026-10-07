import type { AvatarAssetManifestV2Type, AvatarBodyRegionType } from './assetManifest';
import type { AvatarV2DressStateType, AvatarV2EquipmentSlotType } from './spec';

const OUTERWEAR_SLOTS = new Set<AvatarV2EquipmentSlotType>([
  'innerWear',
  'upper',
  'lower',
  'outerWear',
  'gloves',
  'shoes',
  'headwear',
]);

const UNDERWEAR_SLOTS = new Set<AvatarV2EquipmentSlotType>([
  'underwearTop',
  'underwearBottom',
]);

export interface EquippedManifest {
  slot: AvatarV2EquipmentSlotType;
  manifest: AvatarAssetManifestV2Type;
}

export function isSlotVisibleForDressState(
  slot: AvatarV2EquipmentSlotType,
  dress: AvatarV2DressStateType,
): boolean {
  if (dress === 'full') return true;

  if (dress === 'underwear') {
    return !OUTERWEAR_SLOTS.has(slot);
  }

  if (dress === 'nude') {
    return !OUTERWEAR_SLOTS.has(slot) && !UNDERWEAR_SLOTS.has(slot);
  }

  return true;
}

/**
 * Resolves coarse body-region suppression. Fine-cut garments may additionally
 * use authored per-vertex/body-mask data; coarse regions are intentionally not
 * expected to represent every neckline or cutout.
 */
export function resolveOccludedBodyRegions(
  equipped: readonly EquippedManifest[],
  dress: AvatarV2DressStateType,
): Set<AvatarBodyRegionType> {
  const hidden = new Set<AvatarBodyRegionType>();

  for (const { slot, manifest } of equipped) {
    if (!isSlotVisibleForDressState(slot, dress)) continue;

    for (const region of manifest.occludes) {
      hidden.add(region);
    }
  }

  return hidden;
}
