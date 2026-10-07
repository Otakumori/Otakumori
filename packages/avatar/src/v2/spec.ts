import { z } from 'zod';

/**
 * Avatar V2 is the durable user-facing character configuration.
 * Authorization is intentionally NOT stored here. Restricted asset resolution
 * remains a server-side policy concern.
 */
export const AvatarV2PresentationStyle = z.enum(['anime-hq', 'retro64']);
export const AvatarV2CameraMode = z.enum([
  'fullBody',
  'portrait',
  'face',
  'torso',
  'lowerBody',
  'firstPerson',
]);
export const AvatarV2DressState = z.enum(['full', 'underwear', 'nude']);
export const AvatarV2BodyFamily = z.enum(['feminine-01', 'masculine-01']);

export const AvatarV2EquipmentSlot = z.enum([
  'hair',
  'eyebrows',
  'eyelashes',
  'headwear',
  'eyewear',
  'earrings',
  'neckwear',
  'innerWear',
  'upper',
  'lower',
  'outerWear',
  'underwearTop',
  'underwearBottom',
  'gloves',
  'bracelets',
  'rings',
  'shoes',
  'back',
  'tail',
  'wings',
  'horns',
  'animalEars',
  'weaponPrimary',
  'weaponSecondary',
  'shield',
  'anatomyChest',
  'anatomyGroin',
  'adultAccessory',
]);

export const AvatarV2Color = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/, 'Expected #RRGGBB or #RRGGBBAA');

export const AvatarV2MorphMap = z.record(
  z.string().min(1),
  z.number().finite().min(0).max(1),
);

export const AvatarSpecV2 = z.object({
  version: z.literal('2.0'),
  rigId: z.literal('OM_Humanoid_v1'),
  bodyFamily: AvatarV2BodyFamily,

  /**
   * Stable normalized semantic parameters. These are not required to have a
   * 1:1 mapping to glTF morph targets. Runtime resolution may drive primary
   * and corrective morphs from one parameter.
   */
  morphs: AvatarV2MorphMap.default({}),

  colors: z
    .object({
      skin: AvatarV2Color,
      hairPrimary: AvatarV2Color,
      hairSecondary: AvatarV2Color.optional(),
      irisLeft: AvatarV2Color,
      irisRight: AvatarV2Color,
      sclera: AvatarV2Color.optional(),
      lip: AvatarV2Color.optional(),
      makeupPrimary: AvatarV2Color.optional(),
      makeupSecondary: AvatarV2Color.optional(),
    })
    .strict(),

  equipment: z
    .record(AvatarV2EquipmentSlot, z.string().min(1).nullable())
    .default({}),

  face: z
    .object({
      makeupPresetId: z.string().min(1).nullable().optional(),
      markingIds: z.array(z.string().min(1)).max(16).default([]),
      tattooIds: z.array(z.string().min(1)).max(32).default([]),
    })
    .strict()
    .default({ markingIds: [], tattooIds: [] }),

  /**
   * This block is a CHARACTER REQUEST, not an entitlement record.
   * Restricted asset URLs must only be supplied after server policy resolution.
   */
  anatomy: z
    .object({
      presetId: z.string().min(1).nullable().default(null),
      morphs: AvatarV2MorphMap.default({}),
    })
    .strict()
    .default({ presetId: null, morphs: {} }),

  presentation: z
    .object({
      style: AvatarV2PresentationStyle.default('anime-hq'),
      camera: AvatarV2CameraMode.default('fullBody'),
      dress: AvatarV2DressState.default('full'),
    })
    .strict()
    .default({
      style: 'anime-hq',
      camera: 'fullBody',
      dress: 'full',
    }),

  metadata: z
    .object({
      name: z.string().trim().min(1).max(80).optional(),
      presetId: z.string().min(1).optional(),
      createdFromVersion: z.string().optional(),
    })
    .strict()
    .optional(),
});

export type AvatarSpecV2Type = z.infer<typeof AvatarSpecV2>;
export type AvatarV2EquipmentSlotType = z.infer<typeof AvatarV2EquipmentSlot>;
export type AvatarV2DressStateType = z.infer<typeof AvatarV2DressState>;
export type AvatarV2PresentationStyleType = z.infer<typeof AvatarV2PresentationStyle>;
export type AvatarV2CameraModeType = z.infer<typeof AvatarV2CameraMode>;
export type AvatarV2BodyFamilyType = z.infer<typeof AvatarV2BodyFamily>;

export function createDefaultAvatarSpecV2(
  bodyFamily: AvatarV2BodyFamilyType = 'feminine-01',
): AvatarSpecV2Type {
  return AvatarSpecV2.parse({
    version: '2.0',
    rigId: 'OM_Humanoid_v1',
    bodyFamily,
    morphs: {},
    colors: {
      skin: '#D6A48F',
      hairPrimary: '#241C22',
      irisLeft: '#6C526F',
      irisRight: '#6C526F',
    },
    equipment: {},
    face: {
      markingIds: [],
      tattooIds: [],
    },
    anatomy: {
      presetId: null,
      morphs: {},
    },
    presentation: {
      style: 'anime-hq',
      camera: 'fullBody',
      dress: 'full',
    },
  });
}

export function parseAvatarSpecV2(input: unknown): AvatarSpecV2Type {
  return AvatarSpecV2.parse(input);
}
