import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

type AssetRecord = {
  id: string;
  game: string;
  role: string;
  source: string;
  dimensions: { width: number; height: number };
  alpha: boolean;
  sha256: string;
  approvalState: 'OWNER_APPROVED_SOURCE' | 'CANDIDATE_OWNER_REVIEW_REQUIRED';
  provenance: string;
};

type GameAssetManifest = {
  assets: AssetRecord[];
};

const root = process.cwd();
const manifest = JSON.parse(
  readFileSync(join(root, 'content/game-production-assets-v1.manifest.json'), 'utf8'),
) as GameAssetManifest;

const checksum = (repositoryPath: string) =>
  createHash('sha256')
    .update(readFileSync(join(root, repositoryPath)))
    .digest('hex')
    .toUpperCase();

describe('game production asset source intake', () => {
  it('records four approved sources and fourteen owner-review candidates', () => {
    expect(manifest.assets).toHaveLength(18);
    expect(new Set(manifest.assets.map(({ id }) => id)).size).toBe(18);
    expect(
      manifest.assets.filter(({ approvalState }) => approvalState === 'OWNER_APPROVED_SOURCE'),
    ).toHaveLength(4);
    expect(
      manifest.assets.filter(
        ({ approvalState }) => approvalState === 'CANDIDATE_OWNER_REVIEW_REQUIRED',
      ),
    ).toHaveLength(14);
  });

  it('matches every source path, checksum, dimension, and alpha declaration', async () => {
    for (const asset of manifest.assets) {
      const absolutePath = join(root, asset.source);
      expect(existsSync(absolutePath), asset.source).toBe(true);
      expect(checksum(asset.source), asset.id).toBe(asset.sha256);

      const metadata = await sharp(absolutePath).metadata();
      expect(metadata.width, asset.id).toBe(asset.dimensions.width);
      expect(metadata.height, asset.id).toBe(asset.dimensions.height);
      expect(Boolean(metadata.hasAlpha), asset.id).toBe(asset.alpha);
      expect(asset.provenance.length, asset.id).toBeGreaterThan(0);
    }
  });

  it('does not promote cinematic character concepts into runtime assets', () => {
    const characterConcepts = manifest.assets.filter(({ id }) =>
      /wraith|staff_family|fighter_enemy_lineup/.test(id),
    );

    expect(characterConcepts.length).toBeGreaterThan(0);
    expect(
      characterConcepts.every(
        ({ approvalState }) => approvalState === 'CANDIDATE_OWNER_REVIEW_REQUIRED',
      ),
    ).toBe(true);
    expect(characterConcepts.every(({ source }) => source.includes('/provisional/'))).toBe(true);
  });
});
