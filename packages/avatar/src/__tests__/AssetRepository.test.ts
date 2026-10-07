import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { AvatarAssetRepository } from '../runtime/AssetRepository';

function createAsset(
  bytes: number,
  options: {
    geometry?: THREE.BufferGeometry;
    material?: THREE.Material;
  } = {},
) {
  const geometry = options.geometry ?? new THREE.BoxGeometry(1, 1, 1);
  const material = options.material ?? new THREE.MeshBasicMaterial();
  const root = new THREE.Group();
  root.add(new THREE.Mesh(geometry, material));

  return {
    root,
    estimatedGpuBytes: bytes,
  };
}

describe('AvatarAssetRepository', () => {
  it('does not evict the asset being acquired when loading crosses the budget', async () => {
    let now = 0;
    const repo = new AvatarAssetRepository({
      budgetBytes: 100,
      now: () => now,
    });

    const a = await repo.acquire('a', async () => createAsset(80));
    expect(a.refCount).toBe(1);

    repo.release('a');
    now += 1;

    const b = await repo.acquire('b', async () => createAsset(80));

    expect(b.refCount).toBe(1);
    expect(repo.has('b')).toBe(true);
    expect(repo.has('a')).toBe(false);
    expect(repo.residentBytes).toBe(80);

    repo.release('b');
    repo.dispose();
  });

  it('deduplicates concurrent loads for the same key', async () => {
    const repo = new AvatarAssetRepository({ budgetBytes: 1024 });
    const loader = vi.fn(async () => createAsset(64));

    const [first, second] = await Promise.all([
      repo.acquire('same', loader),
      repo.acquire('same', loader),
    ]);

    expect(loader).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
    expect(first.refCount).toBe(2);

    repo.release('same');
    repo.release('same');
    repo.dispose();
  });

  it('preserves shared material resources until the final asset is evicted', async () => {
    const sharedTexture = new THREE.Texture();
    const sharedMaterial = new THREE.MeshBasicMaterial({ map: sharedTexture });
    const materialDispose = vi.spyOn(sharedMaterial, 'dispose');
    const textureDispose = vi.spyOn(sharedTexture, 'dispose');

    const repo = new AvatarAssetRepository({ budgetBytes: 1024 });

    await repo.acquire('a', async () =>
      createAsset(64, {
        material: sharedMaterial,
        geometry: new THREE.BoxGeometry(1, 1, 1),
      }),
    );

    await repo.acquire('b', async () =>
      createAsset(64, {
        material: sharedMaterial,
        geometry: new THREE.SphereGeometry(1, 8, 8),
      }),
    );

    repo.release('a');
    repo.release('b');

    expect(repo.evict('a')).toBe(true);
    expect(materialDispose).not.toHaveBeenCalled();
    expect(textureDispose).not.toHaveBeenCalled();

    expect(repo.evict('b')).toBe(true);
    expect(materialDispose).toHaveBeenCalledTimes(1);
    expect(textureDispose).toHaveBeenCalledTimes(1);
  });

  it('never evicts pinned assets during budget enforcement', async () => {
    const repo = new AvatarAssetRepository({ budgetBytes: 100 });

    await repo.acquire(
      'canonical',
      async () => createAsset(80),
      { pinned: true },
    );
    repo.release('canonical');

    await repo.acquire('garment', async () => createAsset(80));

    expect(repo.has('canonical')).toBe(true);
    expect(repo.has('garment')).toBe(true);
    expect(repo.residentBytes).toBe(160);

    repo.release('garment');
    expect(repo.has('canonical')).toBe(true);
    expect(repo.has('garment')).toBe(false);

    repo.unpin('canonical');
    repo.dispose();
  });
});
