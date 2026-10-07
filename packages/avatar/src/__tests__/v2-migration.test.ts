import { describe, expect, it } from 'vitest';
import { createDefaultAvatarSpec } from '../serialize';
import { migrateAvatarSpecV15ToV2 } from '../v2/index';

describe('Avatar V1.5 -> V2 migration', () => {
  it('maps only semantically safe equipment and morphs', () => {
    const legacy = createDefaultAvatarSpec();

    legacy.morphWeights = {
      height: 0.72,
      width: 0.61,
    };

    legacy.equipment = {
      Hair: 'hair-old-001',
      Pants: 'pants-old-001',
      Head: 'head-old-001',
      NSFWChest: 'adult-chest-old-001',
    };

    legacy.metadata = {
      name: 'Legacy Character',
    };

    const result = migrateAvatarSpecV15ToV2(legacy, {
      bodyFamily: 'feminine-01',
    });

    expect(result.spec.version).toBe('2.0');
    expect(result.spec.morphs['body.height']).toBe(0.72);
    expect(result.unmappedMorphs.width).toBe(0.61);

    expect(result.spec.equipment.hair).toBe('hair-old-001');
    expect(result.spec.equipment.lower).toBe('pants-old-001');
    expect(result.spec.equipment.anatomyChest).toBe('adult-chest-old-001');
    expect(result.unmappedEquipment.Head).toBe('head-old-001');

    expect(result.spec.metadata?.name).toBe('Legacy Character');
    expect(result.spec.metadata?.createdFromVersion).toBe('1.5');
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
