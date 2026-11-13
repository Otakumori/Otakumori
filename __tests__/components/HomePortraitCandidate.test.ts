import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { HOME_SCENE_ASSETS, resolveHomeSceneImageSrc } from '@/app/components/hero/homeScene';

const candidateRoot = path.join(
  process.cwd(),
  'docs/design/references/home-world-portrait-candidates',
);
const metadataPath = path.join(
  candidateRoot,
  'om-home-world-04-late-afternoon-portrait.metadata.json',
);
describe('Home portrait family authority', () => {
  it('records the owner-approved late-afternoon geometry and its runtime derivative', () => {
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as {
      assetId: string;
      sourcePath: string;
      status: string;
      sha256: string;
      provenance: { ownerApproval: boolean };
      runtimePreparation: { activated: boolean; runtimePath: string; wideFallback: string };
    };
    const candidatePath = path.resolve(process.cwd(), metadata.sourcePath);
    const checksum = createHash('sha256').update(readFileSync(candidatePath)).digest('hex');

    expect(metadata.assetId).toBe('home.world.late-afternoon.portrait-v1');
    expect(candidatePath).toBe(
      path.join(candidateRoot, 'om-home-world-04-late-afternoon-portrait.png'),
    );
    expect(metadata.status).toBe('OWNER_APPROVED');
    expect(metadata.provenance.ownerApproval).toBe(true);
    expect(metadata.runtimePreparation.activated).toBe(true);
    expect(metadata.runtimePreparation.wideFallback).toBe(
      'om-home-world-04-late-afternoon-wide.png',
    );
    expect(checksum.toUpperCase()).toBe(metadata.sha256);
    expect(metadata.runtimePreparation.runtimePath).toBe(
      'public/assets/home/world/combined/om-home-world-04-late-afternoon-portrait.webp',
    );
    expect(resolveHomeSceneImageSrc(HOME_SCENE_ASSETS.lateAfternoon, 'wide').src).toBe(
      '/assets/home/world/combined/om-home-world-04-late-afternoon-wide.png',
    );
    expect(resolveHomeSceneImageSrc(HOME_SCENE_ASSETS.lateAfternoon, 'portrait').src).toBe(
      '/assets/home/world/combined/om-home-world-04-late-afternoon-portrait.webp',
    );
  });

  it('keeps all five derived lighting states explicitly pending final owner approval', () => {
    const family = JSON.parse(
      readFileSync(path.join(candidateRoot, 'home-world-portrait-family.metadata.json'), 'utf8'),
    ) as {
      assets: Array<{
        assetId: string;
        sourcePath: string;
        runtimePath: string;
        sourceSha256: string;
        runtimeSha256: string;
        status: string;
        ownerApproval: boolean;
        runtimeActivatedForReview: boolean;
      }>;
    };

    expect(family.assets).toHaveLength(6);
    for (const asset of family.assets) {
      const sourceChecksum = createHash('sha256')
        .update(readFileSync(path.resolve(process.cwd(), asset.sourcePath)))
        .digest('hex')
        .toUpperCase();
      const runtimeChecksum = createHash('sha256')
        .update(readFileSync(path.resolve(process.cwd(), asset.runtimePath)))
        .digest('hex')
        .toUpperCase();

      expect(sourceChecksum).toBe(asset.sourceSha256);
      expect(runtimeChecksum).toBe(asset.runtimeSha256);
      expect(asset.runtimeActivatedForReview).toBe(true);
      expect(asset.ownerApproval).toBe(asset.assetId.includes('late-afternoon'));
      expect(asset.status).toBe(asset.ownerApproval ? 'OWNER_APPROVED' : 'CANDIDATE');
    }
  });
});
