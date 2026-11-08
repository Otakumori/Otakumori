import {
  loadProductionAssetRegistry,
  validateProductionAssetRegistry,
} from '../lib/assets/production-registry';

const registry = loadProductionAssetRegistry();
const result = validateProductionAssetRegistry(registry);

for (const warning of result.warnings) console.warn(`warning: ${warning}`);
for (const error of result.errors) console.error(`error: ${error}`);

console.log(
  JSON.stringify(
    {
      assets: registry.assets.length,
      counts: result.counts,
      warnings: result.warnings.length,
      errors: result.errors.length,
    },
    null,
    2,
  ),
);

if (result.errors.length > 0) process.exitCode = 1;
