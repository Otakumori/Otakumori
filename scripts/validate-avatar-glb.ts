import { readFileSync } from 'node:fs';
import path from 'node:path';

import { inspectAvatarGlbFile, type AvatarAssetRole } from '../lib/avatar/glb-intake';
import { loadProductionAssetRegistry } from '../lib/assets/production-registry';

const args = new Map<string, string>();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const file = args.get('--file');
const assetId = args.get('--asset-id');
const role = args.get('--role') as AvatarAssetRole | undefined;
if (!file || !assetId || !role || !['base', 'hair', 'outfit', 'accessory'].includes(role)) {
  console.error(
    'Usage: tsx scripts/validate-avatar-glb.ts --file <path> --asset-id <id> --role <base|hair|outfit|accessory>',
  );
  process.exit(2);
}

const registry = loadProductionAssetRegistry();
const record = registry.assets.find((asset) => asset.id === assetId);
const source = record?.source;
const report = inspectAvatarGlbFile(path.resolve(file), {
  assetId,
  role,
  registry: record
    ? {
        state: record.state,
        provenance: source?.provenance,
        licenseStatus: source?.licenseStatus,
      }
    : undefined,
});

console.log(JSON.stringify(report, null, 2));
if (!report.accepted) process.exitCode = 1;
