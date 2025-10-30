// Core spec and types
export {
  AvatarSpecV15,
  EquipmentSlot,
  STANDARD_RIG_BONES,
  clampMorph,
  clampAllMorphs,
} from './spec.js';
export type { AvatarSpecV15Type, EquipmentSlotType } from './spec.js';

// Serialization
export { serializeAvatar, deserializeAvatar, createDefaultAvatarSpec } from './serialize.js';

// Policy resolution
export { resolvePolicy, isNSFWSlot } from './policy.js';
export type { PolicyContext, PolicyResult } from './policy.js';

// Renderer (R3F component)
export { AvatarRenderer, preloadAvatar, createRenderer } from './renderer/index.js';
export type {
  AvatarRendererProps,
  ResolvedEquipment,
  RendererProps,
  AvatarRendererLegacy,
} from './renderer/index.js';

// Validation helper
import { AvatarSpecV15 } from './spec.js';
import type { AvatarSpecV15Type } from './spec.js';

export function validateAvatar(spec: unknown): spec is AvatarSpecV15Type {
  const result = AvatarSpecV15.safeParse(spec);
  return result.success;
}
