export const OM_HUMANOID_V1_RIG_ID = 'OM_Humanoid_v1' as const;

export interface CanonicalBoneDefinition {
  name: string;
  parent: string | null;
  required: boolean;
}

/**
 * Minimal frozen runtime hierarchy. Finger/face/physics helper bones may extend
 * this list under the documented parents but must never rename or re-parent
 * these required bones in OM_Humanoid_v1.
 */
export const OM_HUMANOID_V1_REQUIRED_BONES: readonly CanonicalBoneDefinition[] = [
  { name: 'root', parent: null, required: true },
  { name: 'hips', parent: 'root', required: true },
  { name: 'spine_01', parent: 'hips', required: true },
  { name: 'spine_02', parent: 'spine_01', required: true },
  { name: 'chest', parent: 'spine_02', required: true },
  { name: 'neck', parent: 'chest', required: true },
  { name: 'head', parent: 'neck', required: true },

  { name: 'clavicle_l', parent: 'chest', required: true },
  { name: 'upperarm_l', parent: 'clavicle_l', required: true },
  { name: 'lowerarm_l', parent: 'upperarm_l', required: true },
  { name: 'hand_l', parent: 'lowerarm_l', required: true },

  { name: 'clavicle_r', parent: 'chest', required: true },
  { name: 'upperarm_r', parent: 'clavicle_r', required: true },
  { name: 'lowerarm_r', parent: 'upperarm_r', required: true },
  { name: 'hand_r', parent: 'lowerarm_r', required: true },

  { name: 'thigh_l', parent: 'hips', required: true },
  { name: 'shin_l', parent: 'thigh_l', required: true },
  { name: 'foot_l', parent: 'shin_l', required: true },
  { name: 'toe_l', parent: 'foot_l', required: true },

  { name: 'thigh_r', parent: 'hips', required: true },
  { name: 'shin_r', parent: 'thigh_r', required: true },
  { name: 'foot_r', parent: 'shin_r', required: true },
  { name: 'toe_r', parent: 'foot_r', required: true },
] as const;

export const OM_HUMANOID_V1_SOCKET_NAMES = [
  'socket_fp_camera',
  'socket_head',
  'socket_back',
  'socket_hand_l',
  'socket_hand_r',
  'socket_hip_l',
  'socket_hip_r',
] as const;

export interface SkeletonSignatureInput {
  name: string;
  parent: string | null;
  /**
   * Bind matrix flattened in column-major order. Values are normalized here so
   * a build-side SHA-256 implementation can hash deterministic payloads without
   * importing Node-only crypto into the browser package.
   */
  bindMatrix: readonly number[];
}

export function normalizeSkeletonSignaturePayload(
  entries: readonly SkeletonSignatureInput[],
): string {
  return JSON.stringify(
    entries.map((entry) => ({
      name: entry.name,
      parent: entry.parent,
      bindMatrix: entry.bindMatrix.map((value) => Number(value.toFixed(6))),
    })),
  );
}

export interface SkeletonValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateRequiredBoneHierarchy(
  bones: readonly { name: string; parent: string | null }[],
): SkeletonValidationResult {
  const byName = new Map(bones.map((bone) => [bone.name, bone]));
  const errors: string[] = [];

  for (const required of OM_HUMANOID_V1_REQUIRED_BONES) {
    const actual = byName.get(required.name);

    if (!actual) {
      errors.push(`Missing required bone: ${required.name}`);
      continue;
    }

    if (actual.parent !== required.parent) {
      errors.push(
        `Bone ${required.name} expected parent ${String(required.parent)}, received ${String(actual.parent)}`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}
