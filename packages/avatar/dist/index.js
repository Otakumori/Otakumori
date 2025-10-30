// Core spec and types
export {
  AvatarSpecV15,
  EquipmentSlot,
  STANDARD_RIG_BONES,
  clampMorph,
  clampAllMorphs,
} from './spec.js';
// Serialization
export { serializeAvatar, deserializeAvatar, createDefaultAvatarSpec } from './serialize.js';
// Policy resolution
export { resolvePolicy, isNSFWSlot } from './policy.js';
// Renderer (R3F component)
export { AvatarRenderer, preloadAvatar, createRenderer } from './renderer/index.js';
// Validation helper
import { AvatarSpecV15 } from './spec.js';
export function validateAvatar(spec) {
  const result = AvatarSpecV15.safeParse(spec);
  return result.success;
}
