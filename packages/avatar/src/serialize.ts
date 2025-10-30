import { AvatarSpecV15, type AvatarSpecV15Type } from './spec';

/**
 * Serializes an avatar spec to a compact JSON string
 * @param spec - Avatar specification to serialize
 * @returns JSON string representation
 */
export function serializeAvatar(spec: AvatarSpecV15Type): string {
  return JSON.stringify(spec);
}

/**
 * Deserializes and validates an avatar spec from a JSON string
 * @param data - JSON string to deserialize
 * @returns Validated avatar spec or null if invalid
 */
export function deserializeAvatar(data: string): AvatarSpecV15Type | null {
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

/**
 * Creates a minimal default avatar spec for fallback scenarios
 */
export function createDefaultAvatarSpec(): AvatarSpecV15Type {
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
