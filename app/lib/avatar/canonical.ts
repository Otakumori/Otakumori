import type { AvatarConfiguration, AvatarPartType } from '@/app/lib/3d/avatar-parts';
import type { CreatorAvatarConfig } from '@/app/lib/creator/types';

export const CANONICAL_AVATAR_ROUTE = '/creator';
export const CANONICAL_AVATAR_READ_API = '/api/v1/creator/load';
export const CANONICAL_AVATAR_WRITE_API = '/api/v1/creator/save';

export interface CanonicalAvatarReadModel {
  config: CreatorAvatarConfig | null;
  avatarId: string | null;
  rendering: '3d' | '2d';
  model3dUrl: string | null;
  spritesheetUrl: string | null;
}

const CREATOR_PART_KEYS = [
  'Head', 'Face', 'Eyes', 'Eyebrows', 'Nose', 'Mouth', 'Ears', 'Hair', 'FacialHair',
  'Eyelashes', 'Torso', 'Chest', 'Arms', 'Hands', 'Legs', 'Feet', 'Underwear', 'InnerWear',
  'OuterWear', 'Pants', 'Shoes', 'Gloves', 'Headwear', 'Eyewear', 'Neckwear', 'Earrings',
  'Bracelets', 'Rings', 'Horns', 'Tail', 'Wings', 'AnimalEars', 'Halo', 'Back',
  'WeaponPrimary', 'WeaponSecondary', 'Shield', 'NSFWChest', 'NSFWGroin', 'NSFWAccessory',
] as const;

const CREATOR_PART_KEY_BY_LOWER = new Map(
  CREATOR_PART_KEYS.map((key) => [key.toLowerCase(), key]),
);

export function avatarConfigurationPartsToCreatorParts(
  parts: AvatarConfiguration['parts'],
): CreatorAvatarConfig['parts'] {
  return Object.entries(parts).reduce((result, [key, value]) => {
    const creatorKey = CREATOR_PART_KEY_BY_LOWER.get(key.toLowerCase());
    if (creatorKey && value) result[creatorKey] = value;
    return result;
  }, {} as CreatorAvatarConfig['parts']);
}

function isCreatorConfig(value: unknown): value is CreatorAvatarConfig {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CreatorAvatarConfig>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.version === 'string' &&
    typeof candidate.baseModel === 'string' &&
    !!candidate.body &&
    !!candidate.face &&
    !!candidate.hair
  );
}

/** Normalizes canonical and historical read envelopes without creating another storage authority. */
export function normalizeAvatarReadResponse(payload: unknown): CanonicalAvatarReadModel {
  const root = payload && typeof payload === 'object' ? (payload as Record<string, any>) : {};
  const data = root.data && typeof root.data === 'object' ? root.data : root;
  const candidate = data.config ?? data.avatarConfig ?? data.user?.avatarConfig ?? data;
  const config = isCreatorConfig(candidate) ? candidate : null;

  return {
    config,
    avatarId: typeof data.avatarId === 'string' ? data.avatarId : (config?.id ?? null),
    rendering: data.rendering === '2d' ? '2d' : '3d',
    model3dUrl: typeof data.model3dUrl === 'string' ? data.model3dUrl : null,
    spritesheetUrl: typeof data.spritesheetUrl === 'string' ? data.spritesheetUrl : null,
  };
}

/** Renderer adapter. Adult verification is deliberately never derived from saved preferences. */
export function creatorConfigToAvatarConfiguration(
  creatorConfig: CreatorAvatarConfig,
): AvatarConfiguration {
  const parts = Object.entries(creatorConfig.parts).reduce(
    (result, [key, value]) => {
      if (value) result[key.toLowerCase() as AvatarPartType] = value;
      return result;
    },
    {} as Partial<Record<AvatarPartType, string>>,
  );

  return {
    id: creatorConfig.id,
    userId: creatorConfig.userId,
    baseModel: creatorConfig.baseModel,
    baseAssetId: creatorConfig.baseAssetId,
    baseModelUrl: creatorConfig.baseModelUrl,
    animationSetId: creatorConfig.animationSetId,
    contentPolicy: creatorConfig.contentPolicy,
    parts,
    morphTargets: {
      ...creatorConfig.body,
      faceShape: creatorConfig.face.faceShape,
      jawline: creatorConfig.face.jawline,
      cheekbones: creatorConfig.face.cheekbones,
      chinShape: creatorConfig.face.chinShape,
      eyeSize: creatorConfig.face.eyeSize,
      eyeSpacing: creatorConfig.face.eyeSpacing,
      eyeHeight: creatorConfig.face.eyeHeight,
      eyeAngle: creatorConfig.face.eyeAngle,
      eyelidShape: creatorConfig.face.eyelidShape,
      eyebrowThickness: creatorConfig.face.eyebrowThickness,
      eyebrowAngle: creatorConfig.face.eyebrowAngle,
      noseSize: creatorConfig.face.noseSize,
      noseWidth: creatorConfig.face.noseWidth,
      noseHeight: creatorConfig.face.noseHeight,
      bridgeWidth: creatorConfig.face.bridgeWidth,
      nostrilSize: creatorConfig.face.nostrilSize,
      noseTip: creatorConfig.face.noseTip,
      mouthSize: creatorConfig.face.mouthSize,
      mouthWidth: creatorConfig.face.mouthWidth,
      lipThickness: creatorConfig.face.lipThickness,
      lipShape: creatorConfig.face.lipShape,
      cupidBow: creatorConfig.face.cupidBow,
      mouthAngle: creatorConfig.face.mouthAngle,
    },
    materialOverrides: {
      skin: {
        slot: 'skin',
        type: 'color',
        value: creatorConfig.skin.tone,
        opacity: 1,
        roughness: 1 - creatorConfig.skin.glossiness,
      },
      hair: {
        slot: 'hair',
        type: 'color',
        value: creatorConfig.hair.color.primary,
        opacity: 1,
      },
    },
    contentRating: 'sfw',
    showNsfwContent: false,
    ageVerified: false,
    defaultAnimation: creatorConfig.animationSetId ?? 'idle',
    idleAnimations: ['idle'],
    allowExport: true,
    exportFormat: 'glb',
    createdAt: new Date(creatorConfig.createdAt),
    updatedAt: new Date(creatorConfig.updatedAt),
  };
}
