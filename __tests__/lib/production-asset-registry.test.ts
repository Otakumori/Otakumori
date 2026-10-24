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
    expect(result.counts.CANDIDATE).toBe(6);
    expect(result.counts.MISSING).toBe(6);
    expect(result.counts.REJECTED).toBe(1);
  });

  it('registers the six first-slice Avatar IDs without false approval', () => {
    const registry = loadProductionAssetRegistry();
    const ids = [
      'female_base_v1',
      'male_base_v1',
      'medium_wolf_01',
      'short_texture_01',
      'commander_combat_01',
      'urban_fantasy_01',
    ];

    for (const id of ids) {
      const asset = registry.assets.find((candidate) => candidate.id === id);
      expect(asset?.state).toBe('MISSING');
      expect(asset?.ownerApproval.approved).toBe(false);
      expect(asset?.qa.passed).toBe(false);
      expect(asset?.runtime).toBeUndefined();
      expect(asset?.avatar?.qaState).toBe('NOT_RUN');
    }
  });

  it('keeps the legacy avatar base rejected and unapproved despite runtime references', () => {
    const registry = loadProductionAssetRegistry();
    const candidate = registry.assets.find(
      (asset) => asset.id === 'avatar.base.legacy-human-male-female-v1',
    );

    expect(candidate?.state).toBe('REJECTED');
    expect(candidate?.ownerApproval.approved).toBe(false);
    expect(candidate?.runtime?.integrated).toBe(false);
    expect(candidate?.technical?.morphTargetNames).toEqual([]);
    expect(candidate?.technical?.jointsPerSkin).toEqual([707, 701]);
  });

  it('records approved portrait geometry without self-approving final Home art', () => {
    const registry = loadProductionAssetRegistry();
    const candidate = registry.assets.find(
      (asset) => asset.id === 'home.world.late-afternoon.portrait-v1',
    );

    expect(candidate?.state).toBe('CANDIDATE');
    expect(candidate?.ownerApproval.approved).toBe(false);
    expect(candidate?.ownerApproval.geometryApproved).toBe(true);
    expect(candidate?.runtime?.integrated).toBe(true);
    expect(candidate?.runtime?.availability).toBe('PENDING_MERGE');
    expect(candidate?.source?.sourceRef).toBe(
      'codex/home-flagship-closure@acc131fddd5db5ea5d8e8dccf3e8b51563639861',
    );
  });

  it('requires an exact ref for pending runtime artifacts', () => {
    const registry = cloneRegistry(loadProductionAssetRegistry());
    const candidate = registry.assets.find((asset) => asset.id === 'home.world.night.portrait-v1');
    if (!candidate?.runtime) throw new Error('Expected pending portrait runtime');
    candidate.runtime.sourceRef = undefined;

    expect(validateProductionAssetRegistry(registry).errors).toContain(
      'home.world.night.portrait-v1: PENDING_MERGE runtime requires sourceRef',
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
