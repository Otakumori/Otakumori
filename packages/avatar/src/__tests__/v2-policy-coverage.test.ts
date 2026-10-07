import { describe, expect, it } from 'vitest';
import {
  AvatarAssetManifestV2,
  isAvatarAssetRatingAllowed,
  isSlotVisibleForDressState,
  resolveAvatarV2Policy,
  resolveOccludedBodyRegions,
} from '../v2/index';

function garment(
  assetId: string,
  occludes: Array<'chest' | 'abdomen' | 'pelvis'>,
) {
  return AvatarAssetManifestV2.parse({
    schemaVersion: 2,
    assetId,
    kind: 'garment',
    displayName: assetId,
    rigId: 'OM_Humanoid_v1',
    bodyFamilies: ['feminine-01'],
    lods: {
      lod2: {
        url: `/avatar/v2/garments/${assetId}/lod2.glb`,
        triangles: 10_000,
      },
    },
    textures: [],
    supportedMorphs: [],
    correctiveMorphs: [],
    occludes,
    contentRating: 'sfw',
    contentTags: [],
    source: {
      title: 'Test Fixture',
      author: 'Otaku-mori',
      sourceUrl: 'https://otaku-mori.com/',
      licenseSpdx: 'LicenseRef-OtakuMori',
    },
    immutableRevision: 'test',
    generatedAt: '2026-10-07T00:00:00.000Z',
  });
}

describe('Avatar V2 policy and dress coverage', () => {
  it('fails closed unless all adult-policy conditions are true', () => {
    expect(
      resolveAvatarV2Policy({
        adultAssetsEnabled: true,
        adultVerified: true,
        userOptedIn: false,
      }).adultAssetsAllowed,
    ).toBe(false);

    expect(
      resolveAvatarV2Policy({
        adultAssetsEnabled: false,
        adultVerified: true,
        userOptedIn: true,
      }).adultAssetsAllowed,
    ).toBe(false);

    const adult = resolveAvatarV2Policy({
      adultAssetsEnabled: true,
      adultVerified: true,
      userOptedIn: true,
    });

    expect(adult.mode).toBe('adult');
    expect(isAvatarAssetRatingAllowed('adult', adult)).toBe(true);
  });

  it('does not render outer garments in underwear or nude states', () => {
    expect(isSlotVisibleForDressState('upper', 'full')).toBe(true);
    expect(isSlotVisibleForDressState('upper', 'underwear')).toBe(false);
    expect(isSlotVisibleForDressState('underwearTop', 'underwear')).toBe(true);
    expect(isSlotVisibleForDressState('underwearTop', 'nude')).toBe(false);
  });

  it('derives coarse body suppression only from visible garments', () => {
    const upper = garment('upper-test-001', ['chest', 'abdomen']);
    const underwear = garment('underwear-test-001', ['chest']);

    const full = resolveOccludedBodyRegions(
      [
        { slot: 'upper', manifest: upper },
        { slot: 'underwearTop', manifest: underwear },
      ],
      'full',
    );

    expect(full).toEqual(new Set(['chest', 'abdomen']));

    const underwearState = resolveOccludedBodyRegions(
      [
        { slot: 'upper', manifest: upper },
        { slot: 'underwearTop', manifest: underwear },
      ],
      'underwear',
    );

    expect(underwearState).toEqual(new Set(['chest']));

    const nude = resolveOccludedBodyRegions(
      [
        { slot: 'upper', manifest: upper },
        { slot: 'underwearTop', manifest: underwear },
      ],
      'nude',
    );

    expect(nude.size).toBe(0);
  });
});
