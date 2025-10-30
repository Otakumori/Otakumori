import { type AvatarSpecV15Type } from './spec.js';
/**
 * Serializes an avatar spec to a compact JSON string
 * @param spec - Avatar specification to serialize
 * @returns JSON string representation
 */
export declare function serializeAvatar(spec: AvatarSpecV15Type): string;
/**
 * Deserializes and validates an avatar spec from a JSON string
 * @param data - JSON string to deserialize
 * @returns Validated avatar spec or null if invalid
 */
export declare function deserializeAvatar(data: string): AvatarSpecV15Type | null;
/**
 * Creates a minimal default avatar spec for fallback scenarios
 */
export declare function createDefaultAvatarSpec(): AvatarSpecV15Type;
//# sourceMappingURL=serialize.d.ts.map