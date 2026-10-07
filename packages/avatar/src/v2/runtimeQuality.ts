export type AvatarPerformanceTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
export type AvatarLodLevel = 0 | 1 | 2;

export interface AvatarRuntimeQualityState {
  tier: AvatarPerformanceTier;
  dpr: number;
  minDpr: number;
  maxDpr: number;
  maxLod: AvatarLodLevel;
  secondaryPhysics: boolean;
  secondaryBoneBudget: number;
  secondaryPhysicsHz: 30 | 60;
  outlineQuality: 0 | 1 | 2;
  shadowQuality: 0 | 1 | 2;
  postProcessing: boolean;
  swapCacheBudgetBytes: number;
}

const MIB = 1024 * 1024;

export function createRuntimeQualityState(
  tier: AvatarPerformanceTier,
  nativeDpr = 1,
): AvatarRuntimeQualityState {
  const caps = {
    LOW: {
      maxDpr: 1,
      maxLod: 2 as const,
      secondaryPhysics: true,
      secondaryBoneBudget: 32,
      secondaryPhysicsHz: 30 as const,
      outlineQuality: 1 as const,
      shadowQuality: 0 as const,
      postProcessing: false,
      swapCacheBudgetBytes: 80 * MIB,
    },
    MEDIUM: {
      maxDpr: 1.25,
      maxLod: 1 as const,
      secondaryPhysics: true,
      secondaryBoneBudget: 48,
      secondaryPhysicsHz: 30 as const,
      outlineQuality: 1 as const,
      shadowQuality: 1 as const,
      postProcessing: false,
      swapCacheBudgetBytes: 144 * MIB,
    },
    HIGH: {
      maxDpr: 1.5,
      maxLod: 0 as const,
      secondaryPhysics: true,
      secondaryBoneBudget: 72,
      secondaryPhysicsHz: 60 as const,
      outlineQuality: 2 as const,
      shadowQuality: 1 as const,
      postProcessing: true,
      swapCacheBudgetBytes: 256 * MIB,
    },
    ULTRA: {
      maxDpr: 2,
      maxLod: 0 as const,
      secondaryPhysics: true,
      secondaryBoneBudget: 96,
      secondaryPhysicsHz: 60 as const,
      outlineQuality: 2 as const,
      shadowQuality: 2 as const,
      postProcessing: true,
      swapCacheBudgetBytes: 384 * MIB,
    },
  } satisfies Record<AvatarPerformanceTier, Omit<AvatarRuntimeQualityState, 'tier' | 'dpr' | 'minDpr'>>;

  const selected = caps[tier];
  const minDpr = 0.75;

  return {
    tier,
    dpr: Math.max(minDpr, Math.min(nativeDpr, selected.maxDpr)),
    minDpr,
    ...selected,
  };
}

export interface FrameBudgetSample {
  p95Ms: number;
}

/**
 * Pure DPR controller. Callers are responsible for using asymmetric sampling
 * windows so recovery is substantially slower than degradation.
 */
export function resolveAdaptiveDpr(
  state: AvatarRuntimeQualityState,
  sample: FrameBudgetSample,
  step = 0.125,
): number {
  if (sample.p95Ms > 18) {
    return Math.max(state.minDpr, state.dpr - step);
  }

  if (sample.p95Ms < 14) {
    return Math.min(state.maxDpr, state.dpr + step);
  }

  return state.dpr;
}

/**
 * Returns the highest-detail LOD allowed by the current tier and projected
 * character diameter. 10-15% hysteresis should be applied by the stateful
 * selector that owns the previous result.
 */
export function chooseRequestedLod(
  projectedDiameterPx: number,
  tier: AvatarPerformanceTier,
): AvatarLodLevel {
  const requested: AvatarLodLevel =
    projectedDiameterPx > 700 ? 0 : projectedDiameterPx > 280 ? 1 : 2;

  if (tier === 'LOW') return Math.max(requested, 2) as AvatarLodLevel;
  if (tier === 'MEDIUM') return Math.max(requested, 1) as AvatarLodLevel;
  return requested;
}
