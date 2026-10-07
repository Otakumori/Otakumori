export {
  AvatarAssetRepository,
} from './AssetRepository';
export type {
  AvatarAssetLoader,
  AvatarAssetRecord,
  AvatarAssetRepositoryOptions,
  AvatarLoadedAsset,
  AvatarRepositoryEvent,
} from './AssetRepository';

export {
  AvatarResourceRegistry,
} from './ResourceRegistry';

export {
  collectAvatarResources,
  disposeAvatarResource,
} from './collectResources';
export type {
  AvatarDisposableResource,
} from './collectResources';

export {
  createAvatarLoader,
} from './createAvatarLoader';
export type {
  AvatarLoaderBundle,
} from './createAvatarLoader';

export {
  prewarmAvatarAsset,
} from './prewarmAsset';

export {
  bindCanonicalSkeleton,
} from './bindCanonicalSkeleton';
export type {
  BindCanonicalSkeletonResult,
  CanonicalSkeletonBinding,
} from './bindCanonicalSkeleton';

export {
  projectedDiameterPx,
  resolveProjectedLodWithHysteresis,
  DEFAULT_PROJECTED_LOD_THRESHOLDS,
} from './projectedLod';
export type {
  ProjectedLodThresholds,
  RuntimeLod,
} from './projectedLod';

export {
  readAvatarRendererTelemetry,
} from './telemetry';
export type {
  AvatarRendererTelemetry,
} from './telemetry';

export {
  AvatarSelectionController,
} from './SelectionController';
export type {
  AvatarSelectionRequest,
} from './SelectionController';
