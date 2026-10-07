import { describe, expect, it } from 'vitest';
import {
  AvatarAssetManifestV2,
  AvatarSpecV2,
  chooseRequestedLod,
  createDefaultAvatarSpecV2,
  createRuntimeQualityState,
  normalizeSkeletonSignaturePayload,
  validateRequiredBoneHierarchy,
} from '../v2/index.js';

describe('Avatar V2 production contracts', () => {
  it('creates a valid canonical default without embedding authorization', () => {
    const spec = createDefaultAvatarSpecV2();

    expect(AvatarSpecV2.safeParse(spec).success).toBe(true);
    expect(spec.version).toBe('2.0');
    expect(spec.rigId).toBe('OM_Humanoid_v1');
    expect(spec.presentation.dress).toBe('full');
    expect('adultVerified' in spec).toBe(false);
    expect('allowNudity' in spec).toBe(false);
  });

  it('accepts an adult dress request without treating it as permission', () => {
    const spec = createDefaultAvatarSpecV2();
    const parsed = AvatarSpecV2.parse({
      ...spec,
      presentation: {
        ...spec.presentation,
        dress: 'nude',
      },
    });

    expect(parsed.presentation.dress).toBe('nude');
  });

  it('requires the canonical rig on character manifests', () => {
    const result = AvatarAssetManifestV2.safeParse({
      schemaVersion: 2,
      assetId: 'hair-test-001',
      kind: 'hair',
      displayName: 'Test Hair',
      rigId: 'OM_Humanoid_v1',
      bodyFamilies: ['feminine-01'],
      lods: {
        lod2: {
          url: '/avatar/v2/hair/test/lod2.glb',
          triangles: 12000,
        },
      },
      textures: [],
      supportedMorphs: [],
      correctiveMorphs: [],
      occludes: [],
      contentRating: 'sfw',
      contentTags: [],
      source: {
        title: 'Fixture',
        author: 'Otaku-mori',
        sourceUrl: 'https://otaku-mori.com/',
        licenseSpdx: 'LicenseRef-OtakuMori',
      },
      immutableRevision: 'fixture-001',
      generatedAt: '2026-10-07T00:00:00.000Z',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a broken required bone hierarchy', () => {
    const result = validateRequiredBoneHierarchy([
      { name: 'root', parent: null },
      { name: 'hips', parent: 'WRONG' },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('hips'))).toBe(true);
  });

  it('normalizes skeleton signature floating point noise', () => {
    const a = normalizeSkeletonSignaturePayload([
      {
        name: 'root',
        parent: null,
        bindMatrix: [1.00000001, 0, 0, 0],
      },
    ]);

    const b = normalizeSkeletonSignaturePayload([
      {
        name: 'root',
        parent: null,
        bindMatrix: [1.00000002, 0, 0, 0],
      },
    ]);

    expect(a).toBe(b);
  });

  it('prevents LOW tier from requesting HQ LODs', () => {
    expect(chooseRequestedLod(1200, 'LOW')).toBe(2);
    expect(chooseRequestedLod(1200, 'MEDIUM')).toBe(1);
    expect(chooseRequestedLod(1200, 'HIGH')).toBe(0);
  });

  it('caps runtime DPR by tier', () => {
    expect(createRuntimeQualityState('LOW', 3).dpr).toBe(1);
    expect(createRuntimeQualityState('MEDIUM', 3).dpr).toBe(1.25);
    expect(createRuntimeQualityState('HIGH', 3).dpr).toBe(1.5);
    expect(createRuntimeQualityState('ULTRA', 3).dpr).toBe(2);
  });
});
