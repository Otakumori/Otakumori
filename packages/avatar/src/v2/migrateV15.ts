import type { AvatarSpecV15Type, EquipmentSlotType } from '../spec';
import {
  createDefaultAvatarSpecV2,
  type AvatarSpecV2Type,
  type AvatarV2BodyFamilyType,
  type AvatarV2EquipmentSlotType,
} from './spec';
import { AVATAR_V2_MORPH_IDS } from './morphs';

const EQUIPMENT_MAP: Partial<
  Record<EquipmentSlotType, AvatarV2EquipmentSlotType>
> = {
  Hair: 'hair',
  Eyebrows: 'eyebrows',
  Eyelashes: 'eyelashes',
  Headwear: 'headwear',
  Eyewear: 'eyewear',
  Earrings: 'earrings',
  Neckwear: 'neckwear',
  InnerWear: 'innerWear',
  OuterWear: 'outerWear',
  Pants: 'lower',
  Shoes: 'shoes',
  Gloves: 'gloves',
  Bracelets: 'bracelets',
  Rings: 'rings',
  Back: 'back',
  Tail: 'tail',
  Wings: 'wings',
  Horns: 'horns',
  AnimalEars: 'animalEars',
  WeaponPrimary: 'weaponPrimary',
  WeaponSecondary: 'weaponSecondary',
  Shield: 'shield',
  NSFWChest: 'anatomyChest',
  NSFWGroin: 'anatomyGroin',
  NSFWAccessory: 'adultAccessory',
};

const MORPH_MAP: Record<string, string> = {
  height: AVATAR_V2_MORPH_IDS.bodyHeight,
};

export interface AvatarV15MigrationOptions {
  /**
   * V1.5 does not reliably encode canonical body-family identity, so callers
   * must choose it from trusted record/context rather than URL/name heuristics.
   */
  bodyFamily: AvatarV2BodyFamilyType;
  colors?: Partial<AvatarSpecV2Type['colors']>;
}

export interface AvatarV15MigrationResult {
  spec: AvatarSpecV2Type;
  warnings: string[];
  unmappedEquipment: Partial<Record<EquipmentSlotType, string>>;
  unmappedMorphs: Record<string, number>;
}

/**
 * Non-destructive in-memory migration. No database row is mutated here.
 */
export function migrateAvatarSpecV15ToV2(
  legacy: AvatarSpecV15Type,
  options: AvatarV15MigrationOptions,
): AvatarV15MigrationResult {
  const defaults = createDefaultAvatarSpecV2(options.bodyFamily);
  const equipment: AvatarSpecV2Type['equipment'] = {};
  const morphs: Record<string, number> = {};
  const unmappedEquipment: Partial<Record<EquipmentSlotType, string>> = {};
  const unmappedMorphs: Record<string, number> = {};
  const warnings: string[] = [];

  for (const [slot, assetId] of Object.entries(legacy.equipment ?? {}) as Array<
    [EquipmentSlotType, string | null]
  >) {
    if (!assetId) continue;

    const nextSlot = EQUIPMENT_MAP[slot];

    if (nextSlot) {
      equipment[nextSlot] = assetId;
    } else {
      unmappedEquipment[slot] = assetId;
    }
  }

  if (Object.keys(unmappedEquipment).length > 0) {
    warnings.push(
      'Some V1.5 equipment cannot be mapped safely to V2 and requires an explicit migration rule.',
    );
  }

  for (const [legacyId, value] of Object.entries(legacy.morphWeights)) {
    const nextId = MORPH_MAP[legacyId];

    if (nextId) {
      morphs[nextId] = value;
    } else {
      unmappedMorphs[legacyId] = value;
    }
  }

  if (Object.keys(unmappedMorphs).length > 0) {
    warnings.push(
      'Some V1.5 morph weights are raw/ambiguous and were not guessed into V2 semantic parameters.',
    );
  }

  if (
    legacy.palette.primary !== defaults.colors.hairPrimary ||
    legacy.palette.secondary !== defaults.colors.irisLeft
  ) {
    warnings.push(
      'V1.5 primary/secondary palette values are not semantically typed and were not guessed into skin/hair/eye colors.',
    );
  }

  if (legacy.baseMeshUrl) {
    warnings.push(
      'V1.5 baseMeshUrl is intentionally not copied. V2 body assets resolve from bodyFamily and server-approved asset manifests.',
    );
  }

  const spec: AvatarSpecV2Type = {
    ...defaults,
    bodyFamily: options.bodyFamily,
    morphs,
    colors: {
      ...defaults.colors,
      ...options.colors,
    },
    equipment,
    metadata: {
      ...(legacy.metadata?.name ? { name: legacy.metadata.name } : {}),
      createdFromVersion: '1.5',
    },
  };

  return {
    spec,
    warnings,
    unmappedEquipment,
    unmappedMorphs,
  };
}
