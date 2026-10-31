import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type AudioRecord = {
  id: string;
  relativePath: string;
  sha256: string;
  duplicate: { status: string; canonicalId: string | null; contentGroup: string | null };
  licenseState: string;
  runtimeRecommendation: string;
  provenance: {
    publisherEvidenceId: string | null;
    sourceUrl: string | null;
    licenseId: string | null;
    sourceMatch: { state: string };
    commercialRights: string;
    publicationState: string;
  };
};

type AudioManifest = {
  generatedAt: string;
  summary: {
    rootFiles: number;
    audioFiles: number;
    uniqueContentAssets: number;
    binaryDuplicateAliases: number;
    contentDuplicateGroups: number;
    licenseStates: Record<string, number>;
  };
  contentDuplicateGroups: Array<{
    sourceCanonicalId: string;
    runtimePreferredId: string;
    members: string[];
  }>;
  files: AudioRecord[];
};

type AvatarManifest = {
  generatedAt: string;
  summary: {
    relevantFiles: number;
    strongestFemaleBase: string;
    strongestMaleBase: string;
    productionStatus: string;
  };
  rejectedFamilies: Array<{ pathPrefix: string; state: string }>;
  files: Array<{
    relativePath: string;
    licenseState: string;
    details: Record<string, unknown>;
  }>;
};

const load = <T>(path: string): T =>
  JSON.parse(readFileSync(join(process.cwd(), path), 'utf8')) as T;

const audio = load<AudioManifest>('docs/design/production-authority/audio-library-manifest.json');
const avatar = load<AvatarManifest>('docs/design/production-authority/avatar-source-manifest.json');
const attributions = load<{ generatedAt: string; entries: unknown[] }>(
  'docs/legal/audio-attributions.json',
);

describe('owner-managed asset library manifests', () => {
  it('records the complete filtered audio inventory without absolute local paths', () => {
    expect(audio.generatedAt).toBe('2026-10-30T00:00:00+00:00');
    expect(avatar.generatedAt).toBe(audio.generatedAt);
    expect(attributions.generatedAt).toBe(audio.generatedAt);
    expect(audio.summary.rootFiles).toBe(1630);
    expect(audio.summary.audioFiles).toBe(975);
    expect(audio.files).toHaveLength(audio.summary.audioFiles);
    expect(new Set(audio.files.map(({ id }) => id)).size).toBeGreaterThanOrEqual(
      audio.summary.uniqueContentAssets,
    );
    expect(audio.files.every(({ relativePath }) => !/^[A-Za-z]:[\\/]/.test(relativePath))).toBe(
      true,
    );
  });

  it('preserves binary aliases and source/runtime format pairs without redundant runtime approval', () => {
    expect(audio.summary.binaryDuplicateAliases).toBe(2);
    expect(audio.contentDuplicateGroups).toHaveLength(audio.summary.contentDuplicateGroups);
    expect(audio.summary.contentDuplicateGroups).toBe(204);

    const ids = new Set(audio.files.map(({ id }) => id));
    for (const group of audio.contentDuplicateGroups) {
      expect(ids.has(group.sourceCanonicalId)).toBe(true);
      expect(ids.has(group.runtimePreferredId)).toBe(true);
      expect(group.members.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('does not recommend license-blocked audio for runtime shipment', () => {
    const blocked = audio.files.filter(({ licenseState }) =>
      [
        'LICENSE_EVIDENCE_REQUIRED',
        'OWNER_STATES_LICENSED_EVIDENCE_PENDING',
        'OWNER_AUTHORED_RIGHTS_ATTESTATION_PENDING',
      ].includes(licenseState),
    );
    expect(blocked.length).toBeGreaterThan(0);
    expect(
      blocked.every(({ runtimeRecommendation }) =>
        ['HOLD_LICENSE_EVIDENCE', 'ALIAS_ONLY'].includes(runtimeRecommendation),
      ),
    ).toBe(true);
  });

  it('separates verified pack rights, exact-file matching, placement, and publication authority', () => {
    expect(audio.summary.licenseStates).toEqual({
      ATTRIBUTION_REQUIRED: 557,
      LICENSE_EVIDENCE_REQUIRED: 2,
      LICENSE_VERIFIED: 413,
      OWNER_AUTHORED_RIGHTS_ATTESTATION_PENDING: 2,
      OWNER_STATES_LICENSED_EVIDENCE_PENDING: 1,
    });

    const tomMusic = audio.files.filter(
      ({ provenance }) => provenance.publisherEvidenceId === 'tommusic-free-fantasy-200',
    );
    expect(tomMusic).toHaveLength(408);
    expect(
      tomMusic.every(
        ({ licenseState, provenance }) =>
          licenseState === 'LICENSE_VERIFIED' &&
          provenance.sourceMatch.state === 'VERIFIED_PACK_MEMBERSHIP' &&
          provenance.commercialRights === 'CLEARED' &&
          provenance.publicationState === 'NOT_AUTHORIZED',
      ),
    ).toBe(true);

    const bubblePops = audio.files.find(({ relativePath }) =>
      relativePath.includes('497198__abacagi__bubble-pops'),
    );
    expect(bubblePops).toMatchObject({
      licenseState: 'ATTRIBUTION_REQUIRED',
      provenance: {
        publisherEvidenceId: 'freesound-bubble-pops-497198',
        sourceMatch: { state: 'VERIFIED_SOURCE_ID_MATCH' },
        commercialRights: 'CLEARED',
      },
    });

    const ownerAuthored = audio.files.filter(
      ({ licenseState }) => licenseState === 'OWNER_AUTHORED_RIGHTS_ATTESTATION_PENDING',
    );
    expect(ownerAuthored).toHaveLength(2);
    expect(
      ownerAuthored.every(
        ({ runtimeRecommendation }) => runtimeRecommendation === 'HOLD_LICENSE_EVIDENCE',
      ),
    ).toBe(true);
  });

  it('classifies the Maya source as an adaptation candidate and rejects Code Vein assets', () => {
    expect(avatar.summary.relevantFiles).toBe(39);
    expect(avatar.summary.strongestFemaleBase).toBe('anime_base_male_female.ma');
    expect(avatar.summary.strongestMaleBase).toBe('anime_base_male_female.ma');
    expect(avatar.summary.productionStatus).toBe('ADAPTATION_SOURCE_LICENSE_BLOCKED');

    const maya = avatar.files.find(
      ({ relativePath }) => relativePath === 'anime_base_male_female.ma',
    );
    expect(maya?.licenseState).toBe('LICENSE_EVIDENCE_REQUIRED');
    expect(maya?.details).toMatchObject({
      containsMaleGroup: true,
      containsFemaleGroup: true,
      skinClusters: 12,
      blendShapeNodes: 0,
      canonicalRig: false,
      canonicalMorphs: false,
    });
    expect(avatar.rejectedFamilies).toContainEqual(
      expect.objectContaining({ pathPrefix: 'Code Vein Base Edit/', state: 'DO_NOT_SHIP' }),
    );
  });
});
