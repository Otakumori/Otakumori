#!/usr/bin/env node
/**
 * Fetches only redistributable/open DEVELOPMENT fixtures into the gitignored
 * .cache/avatar-source directory. This script intentionally does not automate
 * itch.io/marketplace acceptance flows or download paid/source packages.
 */

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, '.cache', 'avatar-source');

const ASSETS = [
  {
    id: 'blender-human-base-meshes-v1.4.1',
    file: 'human-base-meshes-bundle-v1.4.1.zip',
    url: 'https://download.blender.org/demo/asset-bundles/human-base-meshes/human-base-meshes-bundle-v1.4.1.zip',
    sourcePage: 'https://www.blender.org/download/demo-files/',
    licenseSpdx: 'CC0-1.0',
    purpose: 'production-authoring base/reference; not runtime-ready',
  },
  {
    id: 'khronos-rigged-simple',
    file: 'RiggedSimple.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/RiggedSimple/glTF-Binary/RiggedSimple.glb',
    sourcePage: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/RiggedSimple',
    licenseSpdx: 'CC-BY-4.0',
    attribution: '© 2017 Cesium',
    purpose: 'loader/skinning development fixture only',
  },
];

await mkdir(OUT, { recursive: true });

const records = [];

for (const asset of ASSETS) {
  process.stdout.write(`Fetching ${asset.id}... `);

  const response = await fetch(asset.url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Otakumori-avatar-v2-dev-asset-fetcher/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${asset.id}: ${response.status} ${response.statusText}`,
    );
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const destination = path.join(OUT, asset.file);

  await writeFile(destination, bytes);

  records.push({
    ...asset,
    fetchedAt: new Date().toISOString(),
    bytes: bytes.byteLength,
    sha256,
    localPath: path.relative(ROOT, destination).replaceAll('\\\\', '/'),
  });

  process.stdout.write(`${bytes.byteLength} bytes, sha256 ${sha256}\n`);
}

const metadataPath = path.join(OUT, 'open-dev-assets.json');
await writeFile(metadataPath, JSON.stringify({ schemaVersion: 1, assets: records }, null, 2));

process.stdout.write(
  `Wrote provenance metadata to ${path.relative(ROOT, metadataPath)}\n`,
);
process.stdout.write(
  'Quaternius packages remain manual acquisitions because the official itch.io download flow is interactive. See docs/avatar/asset-procurement-ledger.md.\n',
);
