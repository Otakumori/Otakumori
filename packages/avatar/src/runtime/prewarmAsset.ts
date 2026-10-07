import * as THREE from 'three';

function collectTextures(root: THREE.Object3D): Set<THREE.Texture> {
  const textures = new Set<THREE.Texture>();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }

      if (material instanceof THREE.ShaderMaterial) {
        for (const uniform of Object.values(material.uniforms)) {
          const value = uniform?.value;
          if (value instanceof THREE.Texture) {
            textures.add(value);
          } else if (Array.isArray(value)) {
            for (const item of value) {
              if (item instanceof THREE.Texture) textures.add(item);
            }
          }
        }
      }
    }
  });

  return textures;
}

/**
 * Uploads texture resources and precompiles programs against the actual target
 * scene lighting/environment before an asset is made visible.
 */
export async function prewarmAvatarAsset(
  renderer: THREE.WebGLRenderer,
  root: THREE.Object3D,
  camera: THREE.Camera,
  targetScene: THREE.Scene,
): Promise<void> {
  for (const texture of collectTextures(root)) {
    renderer.initTexture(texture);
  }

  await renderer.compileAsync(root, camera, targetScene);
}
