import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

type BubbleManifest = {
  integrationState: string;
  audioState: string;
  assets: Array<{
    id: string;
    ownerApprovalState: string;
    runtime: Array<{
      path: string;
      sha256: string;
      dimensions: { width: number; height: number };
    }>;
  }>;
};

const root = process.cwd();
const manifest = JSON.parse(
  readFileSync(join(root, 'content/bubble-ragdoll-assets.manifest.json'), 'utf8'),
) as BubbleManifest;

const checksum = (repositoryPath: string) =>
  createHash('sha256')
    .update(readFileSync(join(root, repositoryPath)))
    .digest('hex')
    .toUpperCase();

describe('Bubble Ragdoll visual family', () => {
  it('keeps the integrated arena in owner review and audio license-blocked', () => {
    expect(manifest.integrationState).toBe('OWNER_VISUAL_REVIEW_REQUIRED');
    expect(manifest.audioState).toBe('LICENSE_EVIDENCE_REQUIRED');
    expect(manifest.assets).toHaveLength(1);
    expect(manifest.assets[0]).toMatchObject({
      id: 'bubble_ragdoll_moonlit_bubble_arena_candidate_v1',
      ownerApprovalState: 'CANDIDATE_OWNER_REVIEW_REQUIRED',
    });
  });

  it('matches both responsive runtime derivatives', async () => {
    const runtimeAssets = manifest.assets[0]!.runtime;
    expect(runtimeAssets).toHaveLength(2);

    for (const runtime of runtimeAssets) {
      expect(existsSync(join(root, runtime.path)), runtime.path).toBe(true);
      expect(checksum(runtime.path), runtime.path).toBe(runtime.sha256);
      const metadata = await sharp(join(root, runtime.path)).metadata();
      expect(metadata.width, runtime.path).toBe(runtime.dimensions.width);
      expect(metadata.height, runtime.path).toBe(runtime.dimensions.height);
    }
  });

  it('uses stable callback refs so HUD updates do not restart the scene engine', () => {
    const scene = readFileSync(
      join(root, 'app/mini-games/(games)/bubble-ragdoll/Scene.tsx'),
      'utf8',
    );

    expect(scene).toContain('onGameEndRef.current?.');
    expect(scene).toContain('onStatsUpdateRef.current');
    const effectDependencies = scene.match(/\}, \[avatarEnabled,[^\]]+\]\);/)?.[0];
    expect(effectDependencies).toBeTruthy();
    expect(effectDependencies).not.toContain('onGameEnd');
    expect(effectDependencies).not.toContain('onStatsUpdate');
    expect(scene).not.toContain('const img = new Image();');
  });
});
