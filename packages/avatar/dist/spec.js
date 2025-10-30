import { z } from 'zod';
/**
 * Comprehensive equipment slots covering all avatar customization points
 */
export const EquipmentSlot = z.enum([
  // Head & Face
  'Head',
  'Face',
  'Eyes',
  'Eyebrows',
  'Nose',
  'Mouth',
  'Ears',
  // Hair & Facial
  'Hair',
  'FacialHair',
  'Eyelashes',
  // Body Base
  'Torso',
  'Chest',
  'Arms',
  'Hands',
  'Legs',
  'Feet',
  // Clothing Layers
  'Underwear',
  'InnerWear',
  'OuterWear',
  'Pants',
  'Shoes',
  'Gloves',
  // Accessories
  'Headwear',
  'Eyewear',
  'Neckwear',
  'Earrings',
  'Bracelets',
  'Rings',
  // Fantasy/Anime
  'Horns',
  'Tail',
  'Wings',
  'AnimalEars',
  'Halo',
  // Back & Weapons
  'Back',
  'WeaponPrimary',
  'WeaponSecondary',
  'Shield',
  // NSFW (gated by policy)
  'NSFWChest',
  'NSFWGroin',
  'NSFWAccessory',
]);
/**
 * Standard humanoid rig bones
 */
export const STANDARD_RIG_BONES = [
  'Hips',
  'Spine',
  'Spine1',
  'Spine2',
  'Chest',
  'Neck',
  'Head',
  'LeftShoulder',
  'LeftArm',
  'LeftForeArm',
  'LeftHand',
  'RightShoulder',
  'RightArm',
  'RightForeArm',
  'RightHand',
  'LeftUpLeg',
  'LeftLeg',
  'LeftFoot',
  'LeftToeBase',
  'RightUpLeg',
  'RightLeg',
  'RightFoot',
  'RightToeBase',
];
/**
 * Avatar specification v1.5 with comprehensive equipment and safety
 */
export const AvatarSpecV15 = z.object({
  version: z.literal('1.5'),
  baseMeshUrl: z.string().url(),
  rig: z.object({
    root: z.string(),
    bones: z.array(z.string()).default([...STANDARD_RIG_BONES]),
  }),
  morphs: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      min: z.number().min(0).max(1).default(0),
      max: z.number().min(0).max(1).default(1),
    }),
  ),
  morphWeights: z.record(z.string(), z.number().min(0).max(1)),
  // Equipment uses asset IDs, not URLs (resolved server-side)
  equipment: z.record(EquipmentSlot, z.string().nullable()).optional(),
  palette: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string().optional(),
  }),
  nsfwPolicy: z.object({
    allowNudity: z.literal(false),
  }),
  animationMap: z.object({
    idle: z.string().optional(),
    walk: z.string().optional(),
    run: z.string().optional(),
    jump: z.string().optional(),
    fall: z.string().optional(),
    land: z.string().optional(),
    attack: z.string().optional(),
    emote: z.string().optional(),
  }),
  metadata: z
    .object({
      name: z.string().optional(),
      author: z.string().optional(),
    })
    .optional(),
});
/**
 * Clamps a morph weight value to the defined min/max range
 */
export function clampMorph(spec, morphId, value) {
  const morph = spec.morphs.find((m) => m.id === morphId);
  if (!morph) {
    // Unknown morph, clamp to 0-1
    return Math.max(0, Math.min(1, value));
  }
  return Math.max(morph.min, Math.min(morph.max, value));
}
/**
 * Validates and clamps all morph weights in a spec
 */
export function clampAllMorphs(spec) {
  const clampedWeights = {};
  for (const [morphId, weight] of Object.entries(spec.morphWeights)) {
    clampedWeights[morphId] = clampMorph(spec, morphId, weight);
  }
  return {
    ...spec,
    morphWeights: clampedWeights,
  };
}
