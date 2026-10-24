import { notFound } from 'next/navigation';

import { loadProductionAssetRegistry } from '@/lib/assets/production-registry';
import { AvatarProductionHarness } from './AvatarProductionHarness';

const SLICE_IDS = [
  'female_base_v1',
  'medium_wolf_01',
  'commander_combat_01',
  'male_base_v1',
  'short_texture_01',
  'urban_fantasy_01',
] as const;

export default function AvatarProductionHarnessPage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  const registry = loadProductionAssetRegistry();
  const assets = SLICE_IDS.map((id) => {
    const asset = registry.assets.find((candidate) => candidate.id === id);
    return {
      id,
      state: asset?.state ?? 'MISSING',
      runtimePath: asset?.avatar?.runtimePath ?? null,
      ownerApproved: asset?.ownerApproval.approved ?? false,
      qaPassed: asset?.qa.passed ?? false,
    };
  });

  return <AvatarProductionHarness assets={assets} />;
}
