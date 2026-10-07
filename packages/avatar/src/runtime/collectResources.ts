import * as THREE from 'three';

export type AvatarDisposableResource =
  | THREE.BufferGeometry
  | THREE.Material
  | THREE.Texture
  | THREE.Skeleton;

function collectMaterialTextures(
  material: THREE.Material,
  output: Set<AvatarDisposableResource>,
): void {
  for (const value of Object.values(material)) {
    if (value instanceof THREE.Texture) {
      output.add(value);
    }
  }

  if (material instanceof THREE.ShaderMaterial) {
    for (const uniform of Object.values(material.uniforms)) {
      const value = uniform?.value;

      if (value instanceof THREE.Texture) {
        output.add(value);
      } else if (Array.isArray(value)) {
        for (const item of value) {
          if (item instanceof THREE.Texture) output.add(item);
        }
      }
    }
  }
}

export function collectAvatarResources(
  root: THREE.Object3D,
): Set<AvatarDisposableResource> {
  const resources = new Set<AvatarDisposableResource>();

  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      resources.add(object.geometry);

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      for (const material of materials) {
        resources.add(material);
        collectMaterialTextures(material, resources);
      }
    }

    if (object instanceof THREE.SkinnedMesh) {
      resources.add(object.skeleton);
    }
  });

  return resources;
}

export function disposeAvatarResource(resource: AvatarDisposableResource): void {
  resource.dispose();
}
