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
};

type AudioManifest = {
  summary: {
    rootFiles: number;
    audioFiles: number;
    uniqueContentAssets: number;
    binaryDuplicateAliases: number;
    contentDuplicateGroups: number;
  };
  contentDuplicateGroups: Array<{
    sourceCanonicalId: string;
    runtimePreferredId: string;
    members: string[];
  }>;
  files: AudioRecord[];
};

type AvatarManifest = {
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

describe('owner-managed asset library manifests', () => {
  it('records the complete filtered audio inventory without absolute local paths', () => {
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
      ['LICENSE_EVIDENCE_REQUIRED', 'OWNER_STATES_LICENSED_EVIDENCE_PENDING'].includes(
        licenseState,
      ),
    );
    expect(blocked.length).toBeGreaterThan(0);
    expect(
      blocked.every(({ runtimeRecommendation }) =>
        ['HOLD_LICENSE_EVIDENCE', 'ALIAS_ONLY'].includes(runtimeRecommendation),
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
