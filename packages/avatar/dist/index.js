import { AvatarRenderer, preloadAvatar } from './chunk-ABXYW7BK.js';

// src/spec.ts
import { z } from 'zod';
var EquipmentSlot = z.enum([
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
var STANDARD_RIG_BONES = [
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
var AvatarSpecV15 = z.object({
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
function clampMorph(spec, morphId, value) {
  const morph = spec.morphs.find((m) => m.id === morphId);
  if (!morph) {
    return Math.max(0, Math.min(1, value));
  }
  return Math.max(morph.min, Math.min(morph.max, value));
}
function clampAllMorphs(spec) {
  const clampedWeights = {};
  for (const [morphId, weight] of Object.entries(spec.morphWeights)) {
    clampedWeights[morphId] = clampMorph(spec, morphId, weight);
  }
  return {
    ...spec,
    morphWeights: clampedWeights,
  };
}

// src/serialize.ts
function serializeAvatar(spec) {
  return JSON.stringify(spec);
}
function deserializeAvatar(data) {
  try {
    const parsed = JSON.parse(data);
    const result = AvatarSpecV15.safeParse(parsed);
    if (!result.success) {
      console.warn('Avatar deserialization failed:', result.error);
      return null;
    }
    return result.data;
  } catch (error) {
    console.warn('Avatar deserialization JSON parse error:', error);
    return null;
  }
}
function createDefaultAvatarSpec() {
  return {
    version: '1.5',
    baseMeshUrl: 'https://assets.otakumori.com/default-avatar.glb',
    rig: {
      root: 'Hips',
      bones: [
        'Hips',
        'Spine',
        'Chest',
        'Neck',
        'Head',
        'LeftArm',
        'RightArm',
        'LeftLeg',
        'RightLeg',
      ],
    },
    morphs: [],
    morphWeights: {},
    equipment: {},
    palette: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
    },
    nsfwPolicy: {
      allowNudity: false,
    },
    animationMap: {},
  };
}

// src/policy.ts
function resolvePolicy(ctx) {
  if (!ctx.cookieValue || !ctx.adultVerified) {
    return { nsfwAllowed: false };
  }
  const cookieOptIn = ctx.cookieValue === 'enabled';
  const verified = ctx.adultVerified === true;
  return {
    nsfwAllowed: cookieOptIn && verified,
  };
}
function isNSFWSlot(slot) {
  return slot.startsWith('NSFW');
}

// src/renderer/index.ts
function createRenderer(_props) {
  return {
    mount: (_el) => {
      console.warn('Legacy createRenderer is deprecated. Use AvatarRenderer component instead.');
    },
    dispose: () => {},
  };
}

// src/index.ts
function validateAvatar(spec) {
  const result = AvatarSpecV15.safeParse(spec);
  return result.success;
}
export {
  AvatarRenderer,
  AvatarSpecV15,
  EquipmentSlot,
  STANDARD_RIG_BONES,
  clampAllMorphs,
  clampMorph,
  createDefaultAvatarSpec,
  createRenderer,
  deserializeAvatar,
  isNSFWSlot,
  preloadAvatar,
  resolvePolicy,
  serializeAvatar,
  validateAvatar,
};
