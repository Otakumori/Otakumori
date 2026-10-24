import { STANDARD_RIG_BONES } from './spec';

export const AVATAR_SKELETON_VERSION = 'om-humanoid-v1' as const;
export const AVATAR_RIG_ROOT = 'Hips' as const;

export const REQUIRED_RIG_HIERARCHY: Readonly<Record<string, string | null>> = {
  Hips: null,
  Spine: 'Hips',
  Spine1: 'Spine',
  Spine2: 'Spine1',
  Chest: 'Spine2',
  Neck: 'Chest',
  Head: 'Neck',
  LeftShoulder: 'Chest',
  LeftArm: 'LeftShoulder',
  LeftForeArm: 'LeftArm',
  LeftHand: 'LeftForeArm',
  RightShoulder: 'Chest',
  RightArm: 'RightShoulder',
  RightForeArm: 'RightArm',
  RightHand: 'RightForeArm',
  LeftUpLeg: 'Hips',
  LeftLeg: 'LeftUpLeg',
  LeftFoot: 'LeftLeg',
  LeftToeBase: 'LeftFoot',
  RightUpLeg: 'Hips',
  RightLeg: 'RightUpLeg',
  RightFoot: 'RightLeg',
  RightToeBase: 'RightFoot',
};

/** Source-DCC aliases are normalized once at intake; runtime GLBs use STANDARD_RIG_BONES only. */
export const SOURCE_BONE_ALIASES: Readonly<Record<string, string>> = {
  pelvis: 'Hips',
  spine_01: 'Spine',
  spine_02: 'Spine1',
  chest: 'Chest',
  neck: 'Neck',
  head: 'Head',
  clavicle_l: 'LeftShoulder',
  upperarm_l: 'LeftArm',
  lowerarm_l: 'LeftForeArm',
  hand_l: 'LeftHand',
  clavicle_r: 'RightShoulder',
  upperarm_r: 'RightArm',
  lowerarm_r: 'RightForeArm',
  hand_r: 'RightHand',
  thigh_l: 'LeftUpLeg',
  calf_l: 'LeftLeg',
  foot_l: 'LeftFoot',
  toe_l: 'LeftToeBase',
  thigh_r: 'RightUpLeg',
  calf_r: 'RightLeg',
  foot_r: 'RightFoot',
  toe_r: 'RightToeBase',
};

export const BODY_MORPH_TARGETS = {
  height: 'om_body_height',
  weight: 'om_body_weight',
  muscleMass: 'om_body_muscle_mass',
  bodyFat: 'om_body_fat',
  shoulderWidth: 'om_body_shoulder_width',
  chestSize: 'om_body_chest_size',
  waistSize: 'om_body_waist_size',
  hipWidth: 'om_body_hip_width',
  armLength: 'om_body_arm_length',
  legLength: 'om_body_leg_length',
  thighSize: 'om_body_thigh_size',
  calfSize: 'om_body_calf_size',
  headSize: 'om_body_head_size',
  neckLength: 'om_body_neck_length',
} as const;

export const FACE_MORPH_TARGETS = {
  faceShape: 'om_face_shape',
  jawline: 'om_face_jawline',
  cheekbones: 'om_face_cheekbones',
  chinShape: 'om_face_chin_shape',
  eyeSize: 'om_face_eye_size',
  eyeSpacing: 'om_face_eye_spacing',
  eyeHeight: 'om_face_eye_height',
  eyeAngle: 'om_face_eye_angle',
  eyelidShape: 'om_face_eyelid_shape',
  eyebrowThickness: 'om_face_eyebrow_thickness',
  eyebrowAngle: 'om_face_eyebrow_angle',
  noseSize: 'om_face_nose_size',
  noseWidth: 'om_face_nose_width',
  noseHeight: 'om_face_nose_height',
  bridgeWidth: 'om_face_bridge_width',
  nostrilSize: 'om_face_nostril_size',
  noseTip: 'om_face_nose_tip',
  mouthSize: 'om_face_mouth_size',
  mouthWidth: 'om_face_mouth_width',
  lipThickness: 'om_face_lip_thickness',
  lipShape: 'om_face_lip_shape',
  cupidBow: 'om_face_cupid_bow',
  mouthAngle: 'om_face_mouth_angle',
} as const;

export const AVATAR_MORPH_TARGETS = {
  ...BODY_MORPH_TARGETS,
  ...FACE_MORPH_TARGETS,
} as const;

export type AvatarSemanticMorph = keyof typeof AVATAR_MORPH_TARGETS;
export type AvatarGlbMorphTarget = (typeof AVATAR_MORPH_TARGETS)[AvatarSemanticMorph];

export const REQUIRED_GLTF_MORPH_TARGETS = Object.freeze(Object.values(AVATAR_MORPH_TARGETS));

export const AVATAR_MATERIAL_SLOTS = ['skin', 'eyes', 'hair', 'outfit'] as const;
export type AvatarMaterialSlot = (typeof AVATAR_MATERIAL_SLOTS)[number];

export const AVATAR_ANIMATION_SEMANTICS = [
  'idle',
  'walk',
  'run',
  'jump',
  'fall',
  'land',
  'attack',
  'emote',
] as const;
export type AvatarAnimationSemantic = (typeof AVATAR_ANIMATION_SEMANTICS)[number];

export const AVATAR_ATTACHMENT_BONES: Readonly<Record<string, string>> = {
  Hair: 'Head',
  Headwear: 'Head',
  Eyewear: 'Head',
  Earrings: 'Head',
  Neckwear: 'Neck',
  Back: 'Chest',
  WeaponPrimary: 'RightHand',
  WeaponSecondary: 'LeftHand',
  Shield: 'LeftHand',
};

export function isCanonicalRigBone(value: string): value is (typeof STANDARD_RIG_BONES)[number] {
  return (STANDARD_RIG_BONES as readonly string[]).includes(value);
}
