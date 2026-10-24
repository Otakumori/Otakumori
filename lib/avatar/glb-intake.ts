import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import {
  AVATAR_ANIMATION_SEMANTICS,
  AVATAR_MATERIAL_SLOTS,
  AVATAR_RIG_ROOT,
  AVATAR_SKELETON_VERSION,
  BODY_MORPH_TARGETS,
  FACE_MORPH_TARGETS,
  REQUIRED_GLTF_MORPH_TARGETS,
  REQUIRED_RIG_HIERARCHY,
} from '../../packages/avatar/src/productionContract';
import { STANDARD_RIG_BONES } from '../../packages/avatar/src/spec';

export type AvatarAssetRole = 'base' | 'hair' | 'outfit' | 'accessory';
export type IntakeSeverity = 'ERROR' | 'WARNING' | 'REVIEW';

export interface IntakeIssue {
  code: string;
  severity: IntakeSeverity;
  message: string;
}

export interface AvatarGlbIntakeOptions {
  assetId: string;
  role: AvatarAssetRole;
  registry?: {
    state: string;
    provenance?: string;
    licenseStatus?: string;
  };
}

export interface AvatarGlbIntakeReport {
  schemaVersion: 1;
  assetId: string;
  role: AvatarAssetRole;
  sha256: string;
  bytes: number;
  gltfVersion: string;
  skeletonVersion: typeof AVATAR_SKELETON_VERSION;
  geometry: {
    triangles: number;
    vertices: number;
    primitives: number;
    meshes: number;
    skinnedMeshes: number;
    hiddenMeshes: string[];
    cameras: number;
    lights: number;
  };
  rig: {
    skins: number;
    boneCount: number;
    declaredSkeletonVersion: string | null;
    roots: string[];
    requiredBones: readonly string[];
    missingBones: string[];
    duplicateBoneNames: string[];
    hierarchyCompatible: boolean;
    rootTransformCompatible: boolean;
  };
  morphs: {
    available: string[];
    missing: string[];
    duplicates: string[];
    unsupported: string[];
    wrongMesh: string[];
    invalidRanges: string[];
  };
  materials: {
    names: string[];
    semanticSlots: string[];
    missingSlots: string[];
    alphaMaterials: string[];
  };
  textures: {
    count: number;
    embedded: number;
    external: number;
    approximateMemoryBytes: number | null;
    inventory: Array<{
      name: string;
      mimeType: string | null;
      width: number | null;
      height: number | null;
      embedded: boolean;
    }>;
  };
  animation: {
    clips: Array<{ name: string; durationSeconds: number | null; semantic: string | null }>;
    missingSemantics: string[];
  };
  performance: {
    drawCallEstimate: number;
    materialCount: number;
    packageBytes: number;
    budgetExceptions: string[];
  };
  provenance: {
    registryRecordPresent: boolean;
    sourceAttributable: boolean;
    checksumAvailable: boolean;
    licenseStatus: string | null;
  };
  issues: IntakeIssue[];
  accepted: boolean;
  recommendedState: 'CANDIDATE' | 'REJECTED';
}

type Gltf = Record<string, any>;

function parseGlb(buffer: Buffer): { json: Gltf; binary: Buffer | null } {
  if (buffer.length < 20 || buffer.readUInt32LE(0) !== 0x46546c67) {
    throw new Error('Not a valid GLB container');
  }
  const version = buffer.readUInt32LE(4);
  if (version !== 2) throw new Error(`Unsupported GLB version: ${version}`);
  const declaredLength = buffer.readUInt32LE(8);
  if (declaredLength !== buffer.length) throw new Error('GLB byte length does not match header');

  let offset = 12;
  let json: Gltf | null = null;
  let binary: Buffer | null = null;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4e4f534a) json = JSON.parse(data.toString('utf8').replace(/\0+$/g, '').trim());
    if (type === 0x004e4942) binary = data;
    offset += 8 + length;
  }
  if (!json) throw new Error('GLB is missing its JSON chunk');
  return { json, binary };
}

function triangleCount(primitive: Gltf, accessors: Gltf[]): number {
  const count =
    primitive.indices !== undefined
      ? (accessors[primitive.indices]?.count ?? 0)
      : (accessors[primitive.attributes?.POSITION]?.count ?? 0);
  const mode = primitive.mode ?? 4;
  if (mode === 4) return Math.floor(count / 3);
  if (mode === 5 || mode === 6) return Math.max(0, count - 2);
  return 0;
}

function imageDimensions(image: Gltf, views: Gltf[], binary: Buffer | null) {
  if (!binary || image.bufferView === undefined) return { width: null, height: null };
  const view = views[image.bufferView];
  if (!view) return { width: null, height: null };
  const start = view.byteOffset ?? 0;
  const data = binary.subarray(start, start + (view.byteLength ?? 0));
  if (image.mimeType === 'image/png' && data.length >= 24) {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }
  if (image.mimeType === 'image/ktx2' && data.length >= 28) {
    return { width: data.readUInt32LE(20), height: data.readUInt32LE(24) };
  }
  return { width: null, height: null };
}

function nodeParentMap(nodes: Gltf[]): Map<number, number> {
  const parents = new Map<number, number>();
  nodes.forEach((node, parent) => {
    for (const child of node.children ?? []) parents.set(child, parent);
  });
  return parents;
}

function exactIdentityTransform(node: Gltf | undefined): boolean {
  if (!node) return false;
  const translation = node.translation ?? [0, 0, 0];
  const rotation = node.rotation ?? [0, 0, 0, 1];
  const scale = node.scale ?? [1, 1, 1];
  return (
    translation.every((value: number) => value === 0) &&
    rotation.every((value: number, index: number) => value === [0, 0, 0, 1][index]) &&
    scale.every((value: number) => value === 1)
  );
}

function semanticMaterialSlot(material: Gltf): string | null {
  const declared = material.extras?.avatarSlot;
  if (AVATAR_MATERIAL_SLOTS.includes(declared)) return declared;
  const name = String(material.name ?? '').toLowerCase();
  if (/skin|body/.test(name)) return 'skin';
  if (/eye|iris|cornea|sclera/.test(name)) return 'eyes';
  if (/hair/.test(name)) return 'hair';
  if (/outfit|cloth|shirt|jacket|dress|trouser|skirt|boot/.test(name)) return 'outfit';
  return null;
}

function requiredMaterialSlots(role: AvatarAssetRole): string[] {
  if (role === 'base') return ['skin', 'eyes'];
  if (role === 'hair') return ['hair'];
  if (role === 'outfit') return ['outfit'];
  return [];
}

function issue(code: string, severity: IntakeSeverity, message: string): IntakeIssue {
  return { code, severity, message };
}

export function inspectAvatarGlbBuffer(
  buffer: Buffer,
  options: AvatarGlbIntakeOptions,
): AvatarGlbIntakeReport {
  const { json, binary } = parseGlb(buffer);
  const nodes: Gltf[] = json.nodes ?? [];
  const meshes: Gltf[] = json.meshes ?? [];
  const accessors: Gltf[] = json.accessors ?? [];
  const skins: Gltf[] = json.skins ?? [];
  const materials: Gltf[] = json.materials ?? [];
  const images: Gltf[] = json.images ?? [];
  const views: Gltf[] = json.bufferViews ?? [];
  const parents = nodeParentMap(nodes);
  const primitives = meshes.flatMap((mesh) => mesh.primitives ?? []);
  const nodeNames = nodes.map((node, index) => String(node.name ?? `node-${index}`));
  const declaredSkeletonVersion = json.asset?.extras?.avatarSkeletonVersion ?? null;
  const boneIndices = new Set<number>(skins.flatMap((skin) => skin.joints ?? []));
  const boneNames = [...boneIndices].map((index) => nodeNames[index]);
  const duplicates = boneNames.filter((name, index) => boneNames.indexOf(name) !== index);
  const missingBones =
    options.role === 'base' ? STANDARD_RIG_BONES.filter((bone) => !boneNames.includes(bone)) : [];
  const roots = [...boneIndices]
    .filter((index) => !boneIndices.has(parents.get(index) ?? -1))
    .map((index) => nodeNames[index]);

  let hierarchyCompatible = missingBones.length === 0;
  if (options.role === 'base') {
    for (const [bone, requiredParent] of Object.entries(REQUIRED_RIG_HIERARCHY)) {
      if (!requiredParent) continue;
      const index = nodeNames.indexOf(bone);
      const actualParent = index >= 0 ? nodeNames[parents.get(index) ?? -1] : undefined;
      if (actualParent !== requiredParent) hierarchyCompatible = false;
    }
  }

  const morphLocations = new Map<string, string[]>();
  const targetCountMismatches: string[] = [];
  for (const mesh of meshes) {
    const meshTargets: string[] = mesh.extras?.targetNames ?? [];
    for (const primitive of mesh.primitives ?? []) {
      const names: string[] = primitive.extras?.targetNames ?? meshTargets;
      const targetCount = primitive.targets?.length ?? 0;
      if (names.length !== targetCount) targetCountMismatches.push(mesh.name ?? 'unnamed');
      names
        .slice(0, targetCount)
        .forEach((name) =>
          morphLocations.set(name, [...(morphLocations.get(name) ?? []), mesh.name ?? 'unnamed']),
        );
    }
  }
  const availableMorphs = [...morphLocations.keys()].sort();
  const requiredMorphs = options.role === 'base' ? [...REQUIRED_GLTF_MORPH_TARGETS] : [];
  const missingMorphs = requiredMorphs.filter((target) => !morphLocations.has(target));
  const duplicateMorphs = [...morphLocations.entries()]
    .filter(([, locations]) => locations.length > 1)
    .map(([name]) => name);
  const unsupportedMorphs = availableMorphs.filter(
    (name) => !REQUIRED_GLTF_MORPH_TARGETS.includes(name as never),
  );
  const bodyTargets = new Set(Object.values(BODY_MORPH_TARGETS));
  const faceTargets = new Set(Object.values(FACE_MORPH_TARGETS));
  const wrongMesh = [...morphLocations.entries()].flatMap(([name, locations]) => {
    const expected = bodyTargets.has(name as never)
      ? /body|torso/i
      : faceTargets.has(name as never)
        ? /face|head/i
        : null;
    return expected && locations.every((location) => !expected.test(location)) ? [name] : [];
  });
  const invalidRanges: string[] = [];
  for (const mesh of meshes) {
    const ranges = mesh.extras?.avatarMorphRanges ?? {};
    for (const name of mesh.extras?.targetNames ?? []) {
      const range = ranges[name];
      if (
        !Array.isArray(range) ||
        range.length !== 2 ||
        range[0] < 0 ||
        range[1] > 1 ||
        range[0] > range[1]
      ) {
        invalidRanges.push(name);
      }
    }
  }

  const semanticSlots = [
    ...new Set(materials.map(semanticMaterialSlot).filter(Boolean) as string[]),
  ];
  const missingSlots = requiredMaterialSlots(options.role).filter(
    (slot) => !semanticSlots.includes(slot),
  );
  const textureInventory = images.map((image, index) => {
    const dimensions = imageDimensions(image, views, binary);
    return {
      name: image.name ?? `image-${index}`,
      mimeType: image.mimeType ?? null,
      ...dimensions,
      embedded: image.bufferView !== undefined || String(image.uri ?? '').startsWith('data:'),
    };
  });
  const knownTextureMemory = textureInventory.every((texture) => texture.width && texture.height)
    ? textureInventory.reduce(
        (sum, texture) => sum + (texture.width! * texture.height! * 4 * 4) / 3,
        0,
      )
    : null;

  const animations = (json.animations ?? []).map((animation: Gltf, index: number) => {
    const semantic =
      animation.extras?.avatarSemantic ??
      AVATAR_ANIMATION_SEMANTICS.find((name) =>
        String(animation.name ?? '')
          .toLowerCase()
          .includes(name),
      ) ??
      null;
    const maxTimes = (animation.samplers ?? [])
      .map((sampler: Gltf) => accessors[sampler.input]?.max?.[0])
      .filter((value: unknown): value is number => typeof value === 'number');
    return {
      name: animation.name ?? `animation-${index}`,
      durationSeconds: maxTimes.length ? Math.max(...maxTimes) : null,
      semantic,
    };
  });
  const animationSemantics = animations
    .map((animation: { semantic: string | null }) => animation.semantic)
    .filter(Boolean);
  const budgetExceptions: string[] = [];
  const triangles = primitives.reduce(
    (sum, primitive) => sum + triangleCount(primitive, accessors),
    0,
  );
  const vertices = primitives.reduce(
    (sum, primitive) => sum + (accessors[primitive.attributes?.POSITION]?.count ?? 0),
    0,
  );
  if (options.role === 'base' && (triangles < 35_000 || triangles > 60_000))
    budgetExceptions.push('BASE_TRIANGLE_REVIEW');
  if (options.role === 'hair' && (triangles < 8_000 || triangles > 25_000))
    budgetExceptions.push('HAIR_TRIANGLE_REVIEW');
  if (options.role === 'outfit' && (triangles < 15_000 || triangles > 45_000))
    budgetExceptions.push('OUTFIT_TRIANGLE_REVIEW');
  if (primitives.length > 70) budgetExceptions.push('DRAW_CALL_REVIEW');
  if (materials.length > 30) budgetExceptions.push('MATERIAL_COUNT_REVIEW');
  if (buffer.length > 18 * 1024 * 1024) budgetExceptions.push('PACKAGE_SIZE_REVIEW');

  const issues: IntakeIssue[] = [];
  if (options.role === 'base' && roots.length !== 1)
    issues.push(
      issue('RIG_ROOT_COUNT', 'ERROR', `Expected one skeleton root; found ${roots.length}`),
    );
  if (options.role === 'base' && roots[0] !== AVATAR_RIG_ROOT)
    issues.push(issue('RIG_ROOT_NAME', 'ERROR', `Skeleton root must be ${AVATAR_RIG_ROOT}`));
  if (missingBones.length)
    issues.push(
      issue('RIG_MISSING_BONES', 'ERROR', `Missing ${missingBones.length} required bones`),
    );
  if (duplicates.length)
    issues.push(
      issue(
        'RIG_DUPLICATE_BONES',
        'ERROR',
        `Duplicate bone names: ${[...new Set(duplicates)].join(', ')}`,
      ),
    );
  if (!hierarchyCompatible)
    issues.push(issue('RIG_HIERARCHY', 'ERROR', 'Required humanoid hierarchy is incompatible'));
  const rootTransformCompatible = roots.every((root) =>
    exactIdentityTransform(nodes[nodeNames.indexOf(root)]),
  );
  if (options.role === 'base' && !rootTransformCompatible)
    issues.push(issue('RIG_ROOT_TRANSFORM', 'ERROR', 'Skeleton root transform must be identity'));
  if (missingMorphs.length)
    issues.push(
      issue('MORPH_MISSING', 'ERROR', `Missing ${missingMorphs.length} required morph targets`),
    );
  if (duplicateMorphs.length)
    issues.push(
      issue('MORPH_DUPLICATE', 'ERROR', `Duplicate morph targets: ${duplicateMorphs.join(', ')}`),
    );
  if (unsupportedMorphs.length)
    issues.push(
      issue('MORPH_UNSUPPORTED', 'WARNING', `Unsupported targets: ${unsupportedMorphs.join(', ')}`),
    );
  if (wrongMesh.length)
    issues.push(
      issue('MORPH_WRONG_MESH', 'ERROR', `Targets on wrong semantic mesh: ${wrongMesh.join(', ')}`),
    );
  if (invalidRanges.length)
    issues.push(
      issue('MORPH_RANGE', 'ERROR', `Missing or invalid safe ranges: ${invalidRanges.join(', ')}`),
    );
  if (targetCountMismatches.length)
    issues.push(
      issue(
        'MORPH_TARGET_COUNT',
        'ERROR',
        `Target names do not match target payloads on: ${targetCountMismatches.join(', ')}`,
      ),
    );
  if (declaredSkeletonVersion !== AVATAR_SKELETON_VERSION) {
    issues.push(
      issue(
        'RIG_VERSION',
        'ERROR',
        `Skeleton version must be ${AVATAR_SKELETON_VERSION}; found ${declaredSkeletonVersion ?? 'undeclared'}`,
      ),
    );
  }
  if (json.asset?.extras?.metersPerUnit !== undefined && json.asset.extras.metersPerUnit !== 1) {
    issues.push(
      issue('RIG_SCALE', 'ERROR', 'Runtime Avatar GLBs must use one meter per world unit'),
    );
  }
  if (missingSlots.length)
    issues.push(
      issue(
        'MATERIAL_SLOT_MISSING',
        'ERROR',
        `Missing semantic material slots: ${missingSlots.join(', ')}`,
      ),
    );
  if (json.cameras?.length)
    issues.push(
      issue('UNEXPECTED_CAMERAS', 'WARNING', 'Runtime avatar assets must not ship cameras'),
    );
  const lightCount = json.extensions?.KHR_lights_punctual?.lights?.length ?? 0;
  if (lightCount)
    issues.push(
      issue('UNEXPECTED_LIGHTS', 'WARNING', 'Runtime avatar assets must not ship lights'),
    );
  if (!animations.length)
    issues.push(issue('ANIMATION_ABSENT', 'REVIEW', 'No authored animation clips are present'));
  budgetExceptions.forEach((code) =>
    issues.push(
      issue(code, 'REVIEW', 'Asset exceeds or falls outside the production review target'),
    ),
  );
  const hiddenMeshes = nodes
    .filter(
      (node) =>
        node.mesh !== undefined &&
        (node.extras?.hidden || node.scale?.every((value: number) => value === 0)),
    )
    .map((node) => node.name ?? 'unnamed');
  if (hiddenMeshes.length) {
    issues.push(
      issue('HIDDEN_MESHES', 'WARNING', `Unexpected hidden meshes: ${hiddenMeshes.join(', ')}`),
    );
  }
  if (!options.registry?.provenance)
    issues.push(issue('PROVENANCE_MISSING', 'ERROR', 'Registry provenance is required'));
  if (!options.registry?.licenseStatus || options.registry.licenseStatus === 'UNKNOWN')
    issues.push(issue('LICENSE_UNRESOLVED', 'ERROR', 'Registry license authority is unresolved'));

  const accepted = !issues.some((entry) => entry.severity === 'ERROR');
  return {
    schemaVersion: 1,
    assetId: options.assetId,
    role: options.role,
    sha256: createHash('sha256').update(buffer).digest('hex').toUpperCase(),
    bytes: buffer.length,
    gltfVersion: String(json.asset?.version ?? 'unknown'),
    skeletonVersion: AVATAR_SKELETON_VERSION,
    geometry: {
      triangles,
      vertices,
      primitives: primitives.length,
      meshes: meshes.length,
      skinnedMeshes: nodes.filter((node) => node.mesh !== undefined && node.skin !== undefined)
        .length,
      hiddenMeshes,
      cameras: json.cameras?.length ?? 0,
      lights: lightCount,
    },
    rig: {
      skins: skins.length,
      boneCount: boneIndices.size,
      declaredSkeletonVersion,
      roots,
      requiredBones: STANDARD_RIG_BONES,
      missingBones,
      duplicateBoneNames: [...new Set(duplicates)],
      hierarchyCompatible,
      rootTransformCompatible,
    },
    morphs: {
      available: availableMorphs,
      missing: missingMorphs,
      duplicates: duplicateMorphs,
      unsupported: unsupportedMorphs,
      wrongMesh,
      invalidRanges,
    },
    materials: {
      names: materials.map((material, index) => material.name ?? `material-${index}`),
      semanticSlots,
      missingSlots,
      alphaMaterials: materials
        .filter((material) => material.alphaMode && material.alphaMode !== 'OPAQUE')
        .map((material, index) => material.name ?? `material-${index}`),
    },
    textures: {
      count: images.length,
      embedded: textureInventory.filter((texture) => texture.embedded).length,
      external: textureInventory.filter((texture) => !texture.embedded).length,
      approximateMemoryBytes: knownTextureMemory,
      inventory: textureInventory,
    },
    animation: {
      clips: animations,
      missingSemantics: AVATAR_ANIMATION_SEMANTICS.filter(
        (semantic) => !animationSemantics.includes(semantic),
      ),
    },
    performance: {
      drawCallEstimate: primitives.length,
      materialCount: materials.length,
      packageBytes: buffer.length,
      budgetExceptions,
    },
    provenance: {
      registryRecordPresent: Boolean(options.registry),
      sourceAttributable: Boolean(options.registry?.provenance),
      checksumAvailable: true,
      licenseStatus: options.registry?.licenseStatus ?? null,
    },
    issues,
    accepted,
    recommendedState: accepted ? 'CANDIDATE' : 'REJECTED',
  };
}

export function inspectAvatarGlbFile(path: string, options: AvatarGlbIntakeOptions) {
  return inspectAvatarGlbBuffer(readFileSync(path), options);
}
