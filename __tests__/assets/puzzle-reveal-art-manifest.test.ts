import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type Artwork = {
  id: string;
  subjectCategory: string;
  master: string | null;
  runtime: string | null;
  masterSha256: string | null;
  runtimeSha256: string | null;
  authorityState: 'INTEGRATED' | 'RUNTIME_READY' | 'MISSING';
  supersedes?: string;
};

type PuzzleRevealManifest = {
  targetArtworkCount: number;
  runtimeReadyArtworkCount: number;
  integrationState: string;
  integrationBlockedBy: string | null;
  artworks: Artwork[];
  superseded: Array<{
    id: string;
    source: string;
    sourceSha256: string;
    supersededBy: string;
  }>;
};

const root = process.cwd();
const manifest = JSON.parse(
  readFileSync(join(root, 'content/puzzle-reveal-art.manifest.json'), 'utf8'),
) as PuzzleRevealManifest;

const checksum = (repositoryPath: string) =>
  createHash('sha256')
    .update(readFileSync(join(root, repositoryPath)))
    .digest('hex')
    .toUpperCase();

describe('Puzzle Reveal production art authority', () => {
  it('defines and activates exactly eight distinct approved pack slots', () => {
    expect(manifest.targetArtworkCount).toBe(8);
    expect(manifest.artworks).toHaveLength(8);
    expect(new Set(manifest.artworks.map(({ id }) => id)).size).toBe(8);
    expect(manifest.runtimeReadyArtworkCount).toBe(8);
    expect(manifest.integrationState).toBe('INTEGRATED');
    expect(manifest.integrationBlockedBy).toBeNull();

    const foxV2 = manifest.artworks.find(
      ({ id }) => id === 'puzzle_reveal_foxfire_data_reliquary_v2',
    );
    expect(foxV2).toMatchObject({
      authorityState: 'INTEGRATED',
      master:
        'docs/design/references/approved/batch-3/games/puzzle-reveal/reveal-art/puzzle-reveal-foxfire-data-reliquary-v2.png',
      runtime:
        'public/assets/games/puzzle-reveal/reveal-art/puzzle-reveal-foxfire-data-reliquary-v2.webp',
      supersedes: 'puzzle_reveal_foxfire_data_reliquary_v1',
    });
  });

  it('keeps the superseded fox v1 out of the active pack while preserving its source evidence', () => {
    expect(
      manifest.artworks.some(({ id }) => id === 'puzzle_reveal_foxfire_data_reliquary_v1'),
    ).toBe(false);

    const foxV1 = manifest.superseded.find(
      ({ id }) => id === 'puzzle_reveal_foxfire_data_reliquary_v1',
    );
    expect(foxV1?.supersededBy).toBe('puzzle_reveal_foxfire_data_reliquary_v2');
    expect(foxV1 && existsSync(join(root, foxV1.source))).toBe(true);
    expect(foxV1 && checksum(foxV1.source)).toBe(foxV1?.sourceSha256);
  });

  it('matches every available master and runtime artifact to its recorded checksum', () => {
    for (const artwork of manifest.artworks) {
      expect(artwork.master).not.toBeNull();
      expect(artwork.runtime).not.toBeNull();
      expect(artwork.master && existsSync(join(root, artwork.master))).toBe(true);
      expect(artwork.runtime && existsSync(join(root, artwork.runtime))).toBe(true);
      expect(artwork.master && checksum(artwork.master)).toBe(artwork.masterSha256);
      expect(artwork.runtime && checksum(artwork.runtime)).toBe(artwork.runtimeSha256);
    }
  });

  it('preserves subject diversity rather than cloning one visual template', () => {
    const categories = manifest.artworks.map(({ subjectCategory }) => subjectCategory);
    expect(new Set(categories).size).toBe(categories.length);
  });
});
