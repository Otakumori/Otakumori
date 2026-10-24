import { describe, expect, it } from 'vitest';
import path from 'node:path';

import { inspectAvatarGlbBuffer, inspectAvatarGlbFile } from '@/lib/avatar/glb-intake';
import { loadProductionAssetRegistry } from '@/lib/assets/production-registry';
import {
  AVATAR_ANIMATION_SEMANTICS,
  BODY_MORPH_TARGETS,
  FACE_MORPH_TARGETS,
  REQUIRED_RIG_HIERARCHY,
} from '@/packages/avatar/src/productionContract';

function glb(json: Record<string, unknown>): Buffer {
  const encoded = Buffer.from(JSON.stringify(json));
  const paddedLength = Math.ceil(encoded.length / 4) * 4;
  const jsonChunk = Buffer.alloc(paddedLength, 0x20);
  encoded.copy(jsonChunk);
  const output = Buffer.alloc(20 + paddedLength);
  output.writeUInt32LE(0x46546c67, 0);
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(output.length, 8);
  output.writeUInt32LE(paddedLength, 12);
  output.writeUInt32LE(0x4e4f534a, 16);
  jsonChunk.copy(output, 20);
  return output;
}

function validFixture() {
  const names = Object.keys(REQUIRED_RIG_HIERARCHY);
  const indices = new Map(names.map((name, index) => [name, index]));
  const nodes = names.map((name) => ({ name, children: [] as number[] }));
  for (const [name, parent] of Object.entries(REQUIRED_RIG_HIERARCHY)) {
    if (parent) nodes[indices.get(parent)!].children.push(indices.get(name)!);
  }
  nodes.push({ name: 'BodyMesh', mesh: 0, skin: 0, children: [] });
  nodes.push({ name: 'FaceMesh', mesh: 1, skin: 0, children: [] });
  const body = Object.values(BODY_MORPH_TARGETS);
  const face = Object.values(FACE_MORPH_TARGETS);
  const ranges = (targets: string[]) =>
    Object.fromEntries(targets.map((target) => [target, [0, 1]]));
  const animations = AVATAR_ANIMATION_SEMANTICS.map((semantic, index) => ({
    name: semantic,
    extras: { avatarSemantic: semantic },
    samplers: [{ input: index + 2, output: 0 }],
    channels: [],
  }));
  return {
    asset: {
      version: '2.0',
      extras: { avatarSkeletonVersion: 'om-humanoid-v1', metersPerUnit: 1 },
    },
    scene: 0,
    scenes: [{ nodes: [0, names.length, names.length + 1] }],
    nodes,
    accessors: [
      { count: 60_000, type: 'VEC3' },
      { count: 60_000, type: 'SCALAR' },
      ...AVATAR_ANIMATION_SEMANTICS.map(() => ({ count: 2, type: 'SCALAR', min: [0], max: [1] })),
    ],
    skins: [{ joints: names.map((_, index) => index), skeleton: 0 }],
    meshes: [
      {
        name: 'BodyMesh',
        extras: { targetNames: body, avatarMorphRanges: ranges(body) },
        primitives: [
          { attributes: { POSITION: 0 }, indices: 1, material: 0, targets: body.map(() => ({})) },
        ],
      },
      {
        name: 'FaceMesh',
        extras: { targetNames: face, avatarMorphRanges: ranges(face) },
        primitives: [
          { attributes: { POSITION: 0 }, indices: 1, material: 1, targets: face.map(() => ({})) },
        ],
      },
    ],
    materials: [
      { name: 'Skin', extras: { avatarSlot: 'skin' } },
      { name: 'Eyes', extras: { avatarSlot: 'eyes' } },
    ],
    animations,
  };
}

const authority = {
  assetId: 'female_base_v1',
  role: 'base' as const,
  registry: { state: 'CANDIDATE', provenance: 'owner source', licenseStatus: 'OWNER_PROVIDED' },
};

describe('Avatar GLB intake', () => {
  it('accepts a contract-complete fixture', () => {
    const report = inspectAvatarGlbBuffer(glb(validFixture()), authority);
    expect(report.accepted).toBe(true);
    expect(report.rig.missingBones).toEqual([]);
    expect(report.morphs.missing).toEqual([]);
    expect(report.materials.semanticSlots).toEqual(['skin', 'eyes']);
  });

  it('rejects a missing skeleton and reports missing morphs', () => {
    const fixture = validFixture();
    fixture.skins = [];
    fixture.meshes = [];
    const report = inspectAvatarGlbBuffer(glb(fixture), authority);
    expect(report.accepted).toBe(false);
    expect(report.issues.map((entry) => entry.code)).toEqual(
      expect.arrayContaining(['RIG_MISSING_BONES', 'MORPH_MISSING']),
    );
  });

  it('reports performance review exceptions', () => {
    const fixture = validFixture();
    fixture.accessors[1].count = 600_000;
    const report = inspectAvatarGlbBuffer(glb(fixture), authority);
    expect(report.performance.budgetExceptions).toContain('BASE_TRIANGLE_REVIEW');
  });

  it('rejects a bad semantic material contract', () => {
    const fixture = validFixture();
    fixture.materials = [{ name: 'Generic' }];
    const report = inspectAvatarGlbBuffer(glb(fixture), authority);
    expect(report.materials.missingSlots).toEqual(['skin', 'eyes']);
    expect(report.issues.map((entry) => entry.code)).toContain('MATERIAL_SLOT_MISSING');
  });

  it('reports unsupported, duplicate, misplaced, and unsafe morph declarations', () => {
    const fixture = validFixture();
    const bodyMesh = fixture.meshes[0];
    const faceMesh = fixture.meshes[1];
    bodyMesh.name = 'UnknownMesh';
    bodyMesh.extras.targetNames.push('dcc_only_target');
    bodyMesh.extras.avatarMorphRanges.dcc_only_target = [0, 1];
    bodyMesh.primitives[0].targets.push({});
    bodyMesh.extras.avatarMorphRanges.om_body_height = [-1, 2];
    faceMesh.extras.targetNames.push('om_body_height');
    faceMesh.extras.avatarMorphRanges.om_body_height = [0, 1];
    faceMesh.primitives[0].targets.push({});

    const report = inspectAvatarGlbBuffer(glb(fixture), authority);
    expect(report.morphs.unsupported).toContain('dcc_only_target');
    expect(report.morphs.duplicates).toContain('om_body_height');
    expect(report.morphs.wrongMesh).toContain('om_body_height');
    expect(report.morphs.invalidRanges).toContain('om_body_height');
    expect(report.accepted).toBe(false);
  });

  it('rejects missing provenance', () => {
    const report = inspectAvatarGlbBuffer(glb(validFixture()), {
      assetId: 'female_base_v1',
      role: 'base',
    });
    expect(report.accepted).toBe(false);
    expect(report.issues.map((entry) => entry.code)).toContain('PROVENANCE_MISSING');
  });

  it('rejects corrupt containers and unsupported skeleton versions', () => {
    expect(() => inspectAvatarGlbBuffer(Buffer.from('not a glb'), authority)).toThrow(/valid GLB/);
    const fixture = validFixture();
    fixture.asset.extras.avatarSkeletonVersion = 'foreign-rig-v2';
    const report = inspectAvatarGlbBuffer(glb(fixture), authority);
    expect(report.issues.map((entry) => entry.code)).toContain('RIG_VERSION');
    expect(report.accepted).toBe(false);
  });

  it('rejects the legacy GLB as a production base without promoting it', () => {
    const registry = loadProductionAssetRegistry();
    const record = registry.assets.find(
      (asset) => asset.id === 'avatar.base.legacy-human-male-female-v1',
    );
    if (!record?.source) throw new Error('Legacy registry authority missing');
    const report = inspectAvatarGlbFile(path.resolve(record.source.path), {
      assetId: record.id,
      role: 'base',
      registry: {
        state: record.state,
        provenance: record.source.provenance,
        licenseStatus: record.source.licenseStatus,
      },
    });
    expect(report.accepted).toBe(false);
    expect(report.recommendedState).toBe('REJECTED');
    expect(report.morphs.available).toEqual([]);
    expect(report.rig.boneCount).toBeGreaterThan(700);
    expect(record.ownerApproval.approved).toBe(false);
  });
});
