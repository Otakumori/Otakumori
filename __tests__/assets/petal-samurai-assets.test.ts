import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

type RuntimeAsset = {
  path: string;
  sha256: string;
  dimensions: { width: number; height: number };
};

type PetalSamuraiManifest = {
  integrationState: string;
  audioState: string;
  assets: Array<{
    id: string;
    ownerApprovalState: string;
    runtime: RuntimeAsset[] | string;
    runtimeSha256?: string;
    dimensions?: { width: number; height: number };
    alpha?: boolean;
  }>;
};

const root = process.cwd();
const manifest = JSON.parse(
  readFileSync(join(root, 'content/petal-samurai-assets.manifest.json'), 'utf8'),
) as PetalSamuraiManifest;

const checksum = (repositoryPath: string) =>
  createHash('sha256')
    .update(readFileSync(join(root, repositoryPath)))
    .digest('hex')
    .toUpperCase();

describe('Petal Samurai visual family', () => {
  it('integrates one approved arena while keeping result and VFX derivatives in owner review', () => {
    expect(manifest.integrationState).toBe('OWNER_VISUAL_REVIEW_REQUIRED');
    expect(manifest.audioState).toBe('EXTERNAL_ARTIST_REQUIRED');
    expect(manifest.assets).toHaveLength(8);

    const arena = manifest.assets.find(({ id }) => id === 'petal_samurai_moonlit_shrine_arena_v1');
    expect(arena?.ownerApprovalState).toBe('OWNER_APPROVED_SOURCE');

    const candidates = manifest.assets.filter(({ id }) => id !== arena?.id);
    expect(candidates).toHaveLength(7);
    expect(
      candidates.every(
        ({ ownerApprovalState }) => ownerApprovalState === 'CANDIDATE_OWNER_REVIEW_REQUIRED',
      ),
    ).toBe(true);
  });

  it('matches every runtime checksum and declared geometry', async () => {
    const runtimeAssets = manifest.assets.flatMap((asset) =>
      Array.isArray(asset.runtime)
        ? asset.runtime
        : [
            {
              path: asset.runtime,
              sha256: asset.runtimeSha256!,
              dimensions: asset.dimensions!,
            },
          ],
    );

    expect(runtimeAssets).toHaveLength(9);
    for (const runtime of runtimeAssets) {
      const absolutePath = join(root, runtime.path);
      expect(existsSync(absolutePath), runtime.path).toBe(true);
      expect(checksum(runtime.path), runtime.path).toBe(runtime.sha256);
      const metadata = await sharp(absolutePath).metadata();
      expect(metadata.width, runtime.path).toBe(runtime.dimensions.width);
      expect(metadata.height, runtime.path).toBe(runtime.dimensions.height);
    }
  });

  it('preserves alpha on every split VFX derivative', async () => {
    const vfx = manifest.assets.filter(({ id }) => id.startsWith('petal_samurai_slash_'));
    expect(vfx).toHaveLength(6);
    expect(vfx.every(({ alpha }) => alpha)).toBe(true);

    for (const asset of vfx) {
      const metadata = await sharp(join(root, asset.runtime as string)).metadata();
      expect(metadata.hasAlpha, asset.id).toBe(true);
    }
  });
});
