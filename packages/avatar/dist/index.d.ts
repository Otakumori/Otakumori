export {
  AvatarSpecV15,
  EquipmentSlot,
  STANDARD_RIG_BONES,
  clampMorph,
  clampAllMorphs,
} from './spec.js';
export type { AvatarSpecV15Type, EquipmentSlotType } from './spec.js';
export { serializeAvatar, deserializeAvatar, createDefaultAvatarSpec } from './serialize.js';
export { resolvePolicy, isNSFWSlot } from './policy.js';
export type { PolicyContext, PolicyResult } from './policy.js';
export { AvatarRenderer, preloadAvatar, createRenderer } from './renderer/index.js';
export type {
  AvatarRendererProps,
  ResolvedEquipment,
  RendererProps,
  AvatarRendererLegacy,
} from './renderer/index.js';
import type { AvatarSpecV15Type } from './spec.js';
export declare function validateAvatar(spec: unknown): spec is AvatarSpecV15Type;
//# sourceMappingURL=index.d.ts.map
