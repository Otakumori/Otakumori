export const AVATAR_V2_MORPH_IDS = {
  bodyHeight: 'body.height',
  bodyMass: 'body.mass',
  bodyMuscle: 'body.muscle',
  shoulderWidth: 'body.shoulderWidth',
  torsoLength: 'body.torsoLength',
  waist: 'body.waist',
  hipWidth: 'body.hipWidth',
  legLength: 'body.legLength',
  armLength: 'body.armLength',

  jawWidth: 'face.jawWidth',
  chinLength: 'face.chinLength',
  cheekVolume: 'face.cheekVolume',
  eyeSize: 'face.eyeSize',
  eyeSpacing: 'face.eyeSpacing',
  noseWidth: 'face.noseWidth',
  noseLength: 'face.noseLength',
  lipFullness: 'face.lipFullness',
  mouthWidth: 'face.mouthWidth',
} as const;

export type AvatarV2KnownMorphId =
  (typeof AVATAR_V2_MORPH_IDS)[keyof typeof AVATAR_V2_MORPH_IDS];
