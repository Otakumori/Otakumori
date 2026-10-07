#!/usr/bin/env tsx

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  AvatarAssetManifestV2,
  type AvatarAssetManifestV2Type,
} from '../../packages/avatar/src/v2/assetManifest';

const LOD2_TRIANGLE_BUDGETS: Partial<
  Record<AvatarAssetManifestV2Type['kind'], number>
> = {
  body: 55_000,
  head: 28_000,
  hair: 20_000,
  garment: 24_000,
  accessory: 8_000,
  anatomy: 20_000,
  'retro-proxy': 20_000,
};

const LOD1_TRIANGLE_BUDGETS: Partial<
  Record<AvatarAssetManifestV2Type['kind'], number>
> = {
  body: 110_000,
  head: 45_000,
  hair: 35_000,
  garment: 45_000,
  accessory: 16_000,
  anatomy: 35_000,
};

function validatePolicy(manifest: AvatarAssetManifestV2Type): string[] {
  const errors: string[] = [];

  const lod2Budget = LOD2_TRIANGLE_BUDGETS[manifest.kind];
  if (lod2Budget && manifest.lods.lod2.triangles > lod2Budget) {
    errors.push(
      `LOD2 triangles ${manifest.lods.lod2.triangles} exceed ${manifest.kind} budget ${lod2Budget}`,
    );
  }

  const lod1Budget = LOD1_TRIANGLE_BUDGETS[manifest.kind];
  if (
    lod1Budget &&
    manifest.lods.lod1 &&
    manifest.lods.lod1.triangles > lod1Budget
  ) {
    errors.push(
      `LOD1 triangles ${manifest.lods.lod1.triangles} exceed ${manifest.kind} budget ${lod1Budget}`,
    );
  }

  for (const texture of manifest.textures) {
    if (
      ['normal', 'orm', 'faceSdf'].includes(texture.semantic) &&
      texture.codec !== 'uastc'
    ) {
      errors.push(
        `${texture.id}: ${texture.semantic} textures must use UASTC in the V2 baseline`,
      );
    }

    if (
      texture.semantic === 'alpha' &&
      texture.codec === 'etc1s'
    ) {
      errors.push(
        `${texture.id}: critical alpha textures may not use ETC1S without an approved exception`,
      );
    }

    if (texture.width > 4096 || texture.height > 4096) {
      errors.push(
        `${texture.id}: delivery texture exceeds the 4096px absolute ceiling`,
      );
    }
  }

  if (
    manifest.kind !== 'environment' &&
    manifest.kind !== 'animation' &&
    manifest.kind !== 'material-set' &&
    manifest.lods.lod2.drawCallsExpected &&
    manifest.lods.lod2.drawCallsExpected > 12
  ) {
    errors.push(
      `LOD2 draw-call expectation ${manifest.lods.lod2.drawCallsExpected} is too high for one modular asset`,
    );
  }

  return errors;
}

async function validateFile(file: string): Promise<boolean> {
  const absolute = path.resolve(file);
  const raw = await readFile(absolute, 'utf8');

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    console.error(`FAIL ${file}: invalid JSON`);
    console.error(error);
    return false;
  }

  const parsed = AvatarAssetManifestV2.safeParse(json);

  if (!parsed.success) {
    console.error(`FAIL ${file}: schema validation`);
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join('.') || '<root>'}: ${issue.message}`);
    }
    return false;
  }

  const policyErrors = validatePolicy(parsed.data);

  if (policyErrors.length > 0) {
    console.error(`FAIL ${file}: production policy`);
    for (const error of policyErrors) {
      console.error(`  ${error}`);
    }
    return false;
  }

  console.log(
    `PASS ${file}: ${parsed.data.assetId} (${parsed.data.kind}, LOD2 ${parsed.data.lods.lod2.triangles} tris)`,
  );
  return true;
}

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error(
    'Usage: pnpm exec tsx scripts/avatar/validate-manifests.ts <manifest.json> [...]',
  );
  process.exit(2);
}

const results = await Promise.all(files.map(validateFile));

if (results.some((result) => !result)) {
  process.exit(1);
}
