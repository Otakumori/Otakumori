import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { HOME_SCENE_ASSETS } from '@/app/components/hero/homeScene';

const candidateRoot = path.join(
  process.cwd(),
  'docs/design/references/home-world-portrait-candidates',
);
const metadataPath = path.join(
  candidateRoot,
  'om-home-world-04-late-afternoon-portrait.metadata.json',
);
describe('Home late-afternoon portrait candidate authority', () => {
  it('keeps the candidate review-only and checksum-addressable', () => {
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as {
      assetId: string;
      sourcePath: string;
      status: string;
      sha256: string;
      provenance: { ownerApproval: boolean };
      runtimePreparation: { activated: boolean; wideFallback: string };
    };
    const candidatePath = path.resolve(process.cwd(), metadata.sourcePath);
    const checksum = createHash('sha256').update(readFileSync(candidatePath)).digest('hex');

    expect(metadata.assetId).toBe('home.world.late-afternoon.portrait-v1');
    expect(candidatePath).toBe(
      path.join(candidateRoot, 'om-home-world-04-late-afternoon-portrait.png'),
    );
    expect(metadata.status).toBe('CANDIDATE');
    expect(metadata.provenance.ownerApproval).toBe(false);
    expect(metadata.runtimePreparation.activated).toBe(false);
    expect(metadata.runtimePreparation.wideFallback).toBe(
      'om-home-world-04-late-afternoon-wide.png',
    );
    expect(checksum.toUpperCase()).toBe(metadata.sha256);
    expect(HOME_SCENE_ASSETS.lateAfternoon.src).toBe(
      '/assets/home/world/combined/om-home-world-04-late-afternoon-wide.png',
    );
    expect(HOME_SCENE_ASSETS.lateAfternoon.src).not.toContain('portrait');
  });
});
