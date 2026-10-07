import type { WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export interface AvatarLoaderBundle {
  gltfLoader: GLTFLoader;
  ktx2Loader: KTX2Loader;
  dispose: () => void;
}

/**
 * Creates one configured loader bundle per renderer/runtime boundary.
 * KTX2Loader must inspect the actual renderer before transcoding.
 */
export async function createAvatarLoader(
  renderer: WebGLRenderer,
  options: { basisTranscoderPath?: string } = {},
): Promise<AvatarLoaderBundle> {
  await MeshoptDecoder.ready;

  const ktx2Loader = new KTX2Loader()
    .setTranscoderPath(options.basisTranscoderPath ?? '/avatar/transcoders/basis/');

  ktx2Loader.detectSupport(renderer);

  const gltfLoader = new GLTFLoader()
    .setKTX2Loader(ktx2Loader)
    .setMeshoptDecoder(MeshoptDecoder);

  return {
    gltfLoader,
    ktx2Loader,
    dispose() {
      ktx2Loader.dispose();
    },
  };
}
