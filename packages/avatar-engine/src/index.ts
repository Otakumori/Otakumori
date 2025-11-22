/**
 * @om/avatar-engine
 * Procedural WebGL Avatar Rendering Engine
 */

// Types
export type {
  AvatarProfile,
  ColorPalette,
  AvatarRepresentationConfig,
  RepresentationMode,
  ShadingConfig,
  AssetMeta,
  AssetRegistry,
} from './types/avatar';

// Config
export {
  resolveAvatarFlags,
  isAvatarsEnabled,
  isNsfwAvatarsEnabled,
  clearFlagsCache,
} from './config/flags';
export type { AvatarFlags } from './config/flags';

// Materials
export * from './materials';

// Renderer
export * from './renderer';

// Pipeline
export * from './pipeline';

// Game Integration
export * from './gameIntegration';

// Registry
export * from './registry';

// Layers
export * from './layers';

// Validation
export * from './validation';
