// Core spec and types
export {
  AvatarSpecV15,
  EquipmentSlot,
  STANDARD_RIG_BONES,
  clampMorph,
  clampAllMorphs,
} from './spec';
export type { AvatarSpecV15Type, EquipmentSlotType } from './spec';
export {
  AVATAR_ANIMATION_SEMANTICS,
  AVATAR_ATTACHMENT_BONES,
  AVATAR_MATERIAL_SLOTS,
  AVATAR_MORPH_TARGETS,
  AVATAR_RIG_ROOT,
  AVATAR_SKELETON_VERSION,
  BODY_MORPH_TARGETS,
  FACE_MORPH_TARGETS,
  REQUIRED_GLTF_MORPH_TARGETS,
  REQUIRED_RIG_HIERARCHY,
  SOURCE_BONE_ALIASES,
} from './productionContract';
export type {
  AvatarAnimationSemantic,
  AvatarGlbMorphTarget,
  AvatarMaterialSlot,
  AvatarSemanticMorph,
} from './productionContract';

// Serialization
export { serializeAvatar, deserializeAvatar, createDefaultAvatarSpec } from './serialize';

// Policy resolution
export { resolvePolicy, isNSFWSlot } from './policy';
export type { PolicyContext, PolicyResult } from './policy';

// Renderer (R3F component)
export { AvatarRenderer, preloadAvatar, createRenderer } from './renderer/index';
export type {
  AvatarRendererProps,
  ResolvedEquipment,
  RendererProps,
  AvatarRendererLegacy,
} from './renderer/index';

// Validation helper
import { AvatarSpecV15 } from './spec';
import type { AvatarSpecV15Type } from './spec';

export function validateAvatar(spec: unknown): spec is AvatarSpecV15Type {
  const result = AvatarSpecV15.safeParse(spec);
  return result.success;
}
