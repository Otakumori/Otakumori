export {
  AvatarSpecV2,
  AvatarV2BodyFamily,
  AvatarV2CameraMode,
  AvatarV2Color,
  AvatarV2DressState,
  AvatarV2EquipmentSlot,
  AvatarV2MorphMap,
  AvatarV2PresentationStyle,
  createDefaultAvatarSpecV2,
  parseAvatarSpecV2,
} from './spec';
export type {
  AvatarSpecV2Type,
  AvatarV2BodyFamilyType,
  AvatarV2CameraModeType,
  AvatarV2DressStateType,
  AvatarV2EquipmentSlotType,
  AvatarV2PresentationStyleType,
} from './spec';

export {
  AvatarAssetKind,
  AvatarAssetManifestV2,
  AvatarAssetSource,
  AvatarBodyRegion,
  AvatarContentRating,
  AvatarLodEntry,
  AvatarPhysicsProfile,
  AvatarTextureCodec,
  AvatarTextureEntry,
} from './assetManifest';
export type {
  AvatarAssetKindType,
  AvatarAssetManifestV2Type,
  AvatarBodyRegionType,
} from './assetManifest';

export {
  OM_HUMANOID_V1_REQUIRED_BONES,
  OM_HUMANOID_V1_RIG_ID,
  OM_HUMANOID_V1_SOCKET_NAMES,
  normalizeSkeletonSignaturePayload,
  validateRequiredBoneHierarchy,
} from './skeleton';
export type {
  CanonicalBoneDefinition,
  SkeletonSignatureInput,
  SkeletonValidationResult,
} from './skeleton';

export {
  chooseRequestedLod,
  createRuntimeQualityState,
  resolveAdaptiveDpr,
} from './runtimeQuality';
export type {
  AvatarLodLevel,
  AvatarPerformanceTier,
  AvatarRuntimeQualityState,
  FrameBudgetSample,
} from './runtimeQuality';

export {
  ResolvedAvatarAssetV2,
  ResolvedAvatarV2,
} from './resolved';
export type {
  ResolvedAvatarAssetV2Type,
  ResolvedAvatarV2Type,
} from './resolved';

export {
  isSlotVisibleForDressState,
  resolveOccludedBodyRegions,
} from './coverage';
export type {
  EquippedManifest,
} from './coverage';

export {
  isAvatarAssetRatingAllowed,
  resolveAvatarV2Policy,
} from './policy';
export type {
  AvatarV2PolicyContext,
  AvatarV2PolicyResult,
} from './policy';
