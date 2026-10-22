import { describe, expect, it } from 'vitest';

import {
  loadProductionAssetRegistry,
  validateProductionAssetRegistry,
  type ProductionAssetRegistry,
} from '@/lib/assets/production-registry';

const cloneRegistry = (registry: ProductionAssetRegistry): ProductionAssetRegistry =>
  structuredClone(registry);

describe('production asset registry', () => {
  it('validates the source-backed Home authority without promoting review-only art', () => {
    const registry = loadProductionAssetRegistry();
    const result = validateProductionAssetRegistry(registry);

    expect(result.errors).toEqual([]);
    expect(result.counts.INTEGRATED).toBe(6);
    expect(result.counts.CANDIDATE).toBe(2);
    expect(result.counts.MISSING).toBe(5);
  });

  it('keeps the legacy avatar base as an unapproved candidate despite runtime references', () => {
    const registry = loadProductionAssetRegistry();
    const candidate = registry.assets.find(
      (asset) => asset.id === 'avatar.base.legacy-human-male-female-v1',
    );

    expect(candidate?.state).toBe('CANDIDATE');
    expect(candidate?.ownerApproval.approved).toBe(false);
    expect(candidate?.runtime?.integrated).toBe(false);
    expect(candidate?.technical?.morphTargetNames).toEqual([]);
    expect(candidate?.technical?.jointsPerSkin).toEqual([707, 701]);
  });

  it('keeps the late-afternoon portrait candidate unapproved and inactive', () => {
    const registry = loadProductionAssetRegistry();
    const candidate = registry.assets.find(
      (asset) => asset.id === 'home.world.late-afternoon.portrait-v1',
    );

    expect(candidate?.state).toBe('CANDIDATE');
    expect(candidate?.ownerApproval.approved).toBe(false);
    expect(candidate?.runtime).toBeUndefined();
    expect(candidate?.source?.sourceRef).toBe(
      'codex/home-flagship-closure@c32ff62dd85ae215d032f42108bf47ce45eb32d0',
    );
  });

  it('rejects an owner-approval promotion without explicit approval', () => {
    const registry = cloneRegistry(loadProductionAssetRegistry());
    const candidate = registry.assets.find(
      (asset) => asset.id === 'home.world.late-afternoon.portrait-v1',
    );
    if (!candidate) throw new Error('Expected portrait candidate');
    candidate.state = 'OWNER_APPROVED';

    expect(validateProductionAssetRegistry(registry).errors).toContain(
      'home.world.late-afternoon.portrait-v1: OWNER_APPROVED requires explicit owner approval',
    );
  });

  it('rejects duplicate stable IDs', () => {
    const registry = cloneRegistry(loadProductionAssetRegistry());
    registry.assets.push(structuredClone(registry.assets[0]));

    expect(validateProductionAssetRegistry(registry).errors).toContain(
      `Duplicate production asset ID: ${registry.assets[0].id}`,
    );
  });
});
