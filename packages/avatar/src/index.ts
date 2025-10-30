// Core spec and types
export {
  AvatarSpecV15,
  EquipmentSlot,
  STANDARD_RIG_BONES,
  clampMorph,
  clampAllMorphs,
} from './spec';
export type { AvatarSpecV15Type, EquipmentSlotType } from './spec';

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
