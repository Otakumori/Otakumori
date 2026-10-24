import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const PRODUCTION_ASSET_STATES = [
  'MISSING',
  'CONCEPT',
  'CANDIDATE',
  'OWNER_APPROVED',
  'RUNTIME_READY',
  'INTEGRATED',
  'QA_PASSED',
  'DEFERRED',
  'REJECTED',
] as const;

export type ProductionAssetState = (typeof PRODUCTION_ASSET_STATES)[number];
export type AssetAvailability = 'LOCAL' | 'PENDING_MERGE' | 'EXTERNAL';

export interface ProductionAssetSource {
  path: string;
  availability: AssetAvailability;
  sha256?: string;
  sourceRef?: string;
  provenance: string;
  licenseStatus: 'OWNER_PROVIDED' | 'LICENSED' | 'CC0' | 'UNKNOWN' | 'NOT_APPLICABLE';
  licenseReference?: string;
}

export interface ProductionAssetRuntime {
  path: string;
  sha256: string;
  availability?: AssetAvailability;
  sourceRef?: string;
  integrated: boolean;
  integrationReferences: string[];
}

export interface ProductionAssetRecord {
  id: string;
  family: string;
  surface: string;
  purpose: string;
  state: ProductionAssetState;
  format?: string;
  dimensions?: { width: number; height: number };
  technical?: {
    bytes?: number | null;
    triangles?: number | null;
    vertices?: number | null;
    nodes?: number | null;
    skins?: number | null;
    jointsPerSkin?: number[] | null;
    bones?: number | null;
    materials?: number | null;
    animations?: number | null;
    morphTargetNames?: string[];
    compression?: string[];
  };
  avatar?: {
    role: 'base' | 'hair' | 'outfit' | 'accessory';
    sourceMaster: string | null;
    author: string | null;
    licenseStatus: 'OWNER_PROVIDED' | 'LICENSED' | 'CC0' | 'UNKNOWN';
    checksum: string | null;
    runtimePath: string | null;
    skeletonVersion: string;
    compatibleBases: string[];
    slot: string;
    conflicts: string[];
    textures: Array<{ slot: string; path: string | null; dimensions: string | null }>;
    lods: string[];
    morphCoverage: string[];
    physics: 'NONE' | 'OPTIONAL_SECONDARY' | 'REQUIRED';
    qaState: 'NOT_RUN' | 'FAILED' | 'PASSED';
  };
  source?: ProductionAssetSource;
  runtime?: ProductionAssetRuntime;
  ownerApproval: {
    required: boolean;
    approved: boolean;
    geometryApproved?: boolean;
    evidence?: string;
  };
  qa: {
    passed: boolean;
    evidence: string[];
  };
  notes?: string;
}

export interface ProductionAssetRegistry {
  version: number;
  stateModel: ProductionAssetState[];
  legacyAuthorities: Array<{
    path: string;
    role: string;
  }>;
  assets: ProductionAssetRecord[];
}

export interface RegistryValidationResult {
  errors: string[];
  warnings: string[];
  counts: Record<ProductionAssetState, number>;
}

const orderedStates: ProductionAssetState[] = [
  'MISSING',
  'CONCEPT',
  'CANDIDATE',
  'OWNER_APPROVED',
  'RUNTIME_READY',
  'INTEGRATED',
  'QA_PASSED',
];

const stateRank = (state: ProductionAssetState) => orderedStates.indexOf(state);

function resolveRepositoryPath(root: string, repositoryPath: string): string | null {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, repositoryPath);
  const relative = path.relative(resolvedRoot, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return resolved;
}

function checksum(filePath: string): string {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex').toUpperCase();
}

function validateFile(
  root: string,
  assetId: string,
  label: string,
  repositoryPath: string,
  expectedSha256: string | undefined,
  errors: string[],
): void {
  const resolved = resolveRepositoryPath(root, repositoryPath);
  if (!resolved) {
    errors.push(`${assetId}: ${label} escapes the repository root`);
    return;
  }
  if (!existsSync(resolved)) {
    errors.push(`${assetId}: ${label} does not exist at ${repositoryPath}`);
    return;
  }
  if (!expectedSha256) {
    errors.push(`${assetId}: ${label} is missing a SHA-256 checksum`);
    return;
  }
  if (checksum(resolved) !== expectedSha256.toUpperCase()) {
    errors.push(`${assetId}: ${label} checksum does not match ${repositoryPath}`);
  }
}

export function loadProductionAssetRegistry(
  root = process.cwd(),
  registryPath = 'content/production-assets.registry.json',
): ProductionAssetRegistry {
  const resolved = resolveRepositoryPath(root, registryPath);
  if (!resolved) throw new Error('Production asset registry path escapes the repository root');
  return JSON.parse(readFileSync(resolved, 'utf8')) as ProductionAssetRegistry;
}

export function validateProductionAssetRegistry(
  registry: ProductionAssetRegistry,
  root = process.cwd(),
): RegistryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const counts = Object.fromEntries(PRODUCTION_ASSET_STATES.map((state) => [state, 0])) as Record<
    ProductionAssetState,
    number
  >;
  const ids = new Set<string>();

  if (registry.version !== 1) errors.push(`Unsupported registry version: ${registry.version}`);
  if (JSON.stringify(registry.stateModel) !== JSON.stringify(PRODUCTION_ASSET_STATES)) {
    errors.push('Registry state model does not match the canonical production state model');
  }

  for (const authority of registry.legacyAuthorities) {
    const resolved = resolveRepositoryPath(root, authority.path);
    if (!resolved || !existsSync(resolved)) {
      errors.push(`Legacy authority is missing: ${authority.path}`);
    }
  }

  for (const asset of registry.assets) {
    if (ids.has(asset.id)) errors.push(`Duplicate production asset ID: ${asset.id}`);
    ids.add(asset.id);

    if (!PRODUCTION_ASSET_STATES.includes(asset.state)) {
      errors.push(`${asset.id}: unknown state ${asset.state}`);
      continue;
    }
    counts[asset.state] += 1;

    const rank = stateRank(asset.state);
    const requiresSource = rank >= stateRank('CANDIDATE');
    const requiresApproval = rank >= stateRank('OWNER_APPROVED');
    const requiresRuntime = rank >= stateRank('RUNTIME_READY');
    const requiresIntegration = rank >= stateRank('INTEGRATED');

    if (requiresSource && !asset.source) {
      errors.push(`${asset.id}: ${asset.state} requires source authority`);
    }

    if (asset.source) {
      if (asset.source.availability === 'LOCAL') {
        validateFile(root, asset.id, 'source', asset.source.path, asset.source.sha256, errors);
      } else if (!asset.source.sourceRef) {
        errors.push(`${asset.id}: ${asset.source.availability} source requires sourceRef`);
      }
      if (requiresApproval && asset.source.licenseStatus === 'UNKNOWN') {
        warnings.push(`${asset.id}: approved-or-later asset has unresolved license status`);
      }
    }

    if (requiresApproval && !asset.ownerApproval.approved) {
      errors.push(`${asset.id}: ${asset.state} requires explicit owner approval`);
    }
    if (!requiresApproval && asset.ownerApproval.approved) {
      errors.push(`${asset.id}: owner approval must advance the canonical state`);
    }

    if (requiresRuntime && !asset.runtime) {
      errors.push(`${asset.id}: ${asset.state} requires a runtime artifact`);
    }
    if (asset.runtime) {
      if ((asset.runtime.availability ?? 'LOCAL') === 'LOCAL') {
        validateFile(root, asset.id, 'runtime', asset.runtime.path, asset.runtime.sha256, errors);
      } else if (!asset.runtime.sourceRef) {
        errors.push(`${asset.id}: ${asset.runtime.availability} runtime requires sourceRef`);
      }
      for (const reference of asset.runtime.integrationReferences) {
        const resolved = resolveRepositoryPath(root, reference);
        if (!resolved || !existsSync(resolved)) {
          errors.push(`${asset.id}: integration reference is missing: ${reference}`);
        }
      }
    }

    if (requiresIntegration && !asset.runtime?.integrated) {
      errors.push(`${asset.id}: ${asset.state} requires an integrated runtime artifact`);
    }
    if (asset.state === 'QA_PASSED' && (!asset.qa.passed || asset.qa.evidence.length === 0)) {
      errors.push(`${asset.id}: QA_PASSED requires QA evidence`);
    }
    if (asset.qa.passed && asset.state !== 'QA_PASSED') {
      errors.push(`${asset.id}: QA approval must advance the canonical state`);
    }

    if (asset.avatar) {
      const requiredAvatarFields = [
        'role',
        'sourceMaster',
        'author',
        'licenseStatus',
        'checksum',
        'runtimePath',
        'skeletonVersion',
        'compatibleBases',
        'slot',
        'conflicts',
        'textures',
        'lods',
        'morphCoverage',
        'physics',
        'qaState',
      ];
      for (const field of requiredAvatarFields) {
        if (!(field in asset.avatar))
          errors.push(`${asset.id}: avatar metadata is missing ${field}`);
      }
      if (asset.state === 'MISSING' && (asset.avatar.sourceMaster || asset.avatar.runtimePath)) {
        errors.push(`${asset.id}: MISSING asset cannot claim source or runtime availability`);
      }
      if (
        !asset.ownerApproval.approved &&
        ['OWNER_APPROVED', 'RUNTIME_READY', 'INTEGRATED', 'QA_PASSED'].includes(asset.state)
      ) {
        errors.push(`${asset.id}: unapproved avatar asset cannot be promoted to ${asset.state}`);
      }
    }
  }

  return { errors, warnings, counts };
}
