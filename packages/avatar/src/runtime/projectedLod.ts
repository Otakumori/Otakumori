export interface ProjectedLodThresholds {
  lod0EnterPx: number;
  lod0ExitPx: number;
  lod1EnterPx: number;
  lod1ExitPx: number;
}

export const DEFAULT_PROJECTED_LOD_THRESHOLDS: ProjectedLodThresholds = {
  lod0EnterPx: 735,
  lod0ExitPx: 665,
  lod1EnterPx: 294,
  lod1ExitPx: 266,
};

export function projectedDiameterPx(
  boundingRadiusWorld: number,
  cameraDistanceWorld: number,
  viewportHeightPx: number,
  verticalFovDegrees: number,
): number {
  if (
    boundingRadiusWorld <= 0 ||
    cameraDistanceWorld <= 0 ||
    viewportHeightPx <= 0 ||
    verticalFovDegrees <= 0 ||
    verticalFovDegrees >= 180
  ) {
    return 0;
  }

  const fovRadians = (verticalFovDegrees * Math.PI) / 180;
  const focalLengthPx = viewportHeightPx / (2 * Math.tan(fovRadians / 2));

  return (2 * boundingRadiusWorld * focalLengthPx) / cameraDistanceWorld;
}

export type RuntimeLod = 0 | 1 | 2;

/**
 * Stateful hysteresis resolver. The caller applies quality-tier max LOD after
 * this visual selector so LOW/MEDIUM tiers never accidentally request LOD0.
 */
export function resolveProjectedLodWithHysteresis(
  projectedPx: number,
  previous: RuntimeLod,
  thresholds: ProjectedLodThresholds = DEFAULT_PROJECTED_LOD_THRESHOLDS,
): RuntimeLod {
  switch (previous) {
    case 0:
      if (projectedPx < thresholds.lod0ExitPx) {
        return projectedPx >= thresholds.lod1EnterPx ? 1 : 2;
      }
      return 0;

    case 1:
      if (projectedPx >= thresholds.lod0EnterPx) return 0;
      if (projectedPx < thresholds.lod1ExitPx) return 2;
      return 1;

    case 2:
      if (projectedPx >= thresholds.lod0EnterPx) return 0;
      if (projectedPx >= thresholds.lod1EnterPx) return 1;
      return 2;
  }
}
