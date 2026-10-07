import * as THREE from 'three';

export interface CanonicalSkeletonBinding {
  skeleton: THREE.Skeleton;
  bindMatrix: THREE.Matrix4;
  bindMatrixInverse: THREE.Matrix4;
}

export interface BindCanonicalSkeletonResult {
  skinnedMeshes: number;
  replacedSkeletons: number;
}

/**
 * Rebinds modular skinned meshes onto the avatar's one authoritative skeleton.
 *
 * Delivery contract: each module skin must use the same joint ordering as the
 * canonical skeleton. This is validated offline as well as checked here.
 */
export function bindCanonicalSkeleton(
  moduleRoot: THREE.Object3D,
  canonical: CanonicalSkeletonBinding,
): BindCanonicalSkeletonResult {
  const canonicalNames = canonical.skeleton.bones.map((bone) => bone.name);
  const replacedSkeletons = new Set<THREE.Skeleton>();
  let skinnedMeshes = 0;

  moduleRoot.traverse((object) => {
    if (!(object instanceof THREE.SkinnedMesh)) return;

    skinnedMeshes += 1;

    const sourceSkeleton = object.skeleton;
    const sourceNames = sourceSkeleton.bones.map((bone) => bone.name);

    if (sourceNames.length !== canonicalNames.length) {
      throw new Error(
        `Skeleton joint-count mismatch for ${object.name || '<unnamed SkinnedMesh>'}: ` +
          `module=${sourceNames.length}, canonical=${canonicalNames.length}`,
      );
    }

    for (let index = 0; index < canonicalNames.length; index += 1) {
      if (sourceNames[index] !== canonicalNames[index]) {
        throw new Error(
          `Skeleton joint-order mismatch for ${object.name || '<unnamed SkinnedMesh>'} ` +
            `at index ${index}: module=${String(sourceNames[index])}, ` +
            `canonical=${String(canonicalNames[index])}`,
        );
      }
    }

    if (sourceSkeleton !== canonical.skeleton) {
      replacedSkeletons.add(sourceSkeleton);
    }

    object.bindMode = THREE.DetachedBindMode;
    object.bind(canonical.skeleton, canonical.bindMatrix);
    object.bindMatrix.copy(canonical.bindMatrix);
    object.bindMatrixInverse.copy(canonical.bindMatrixInverse);
  });

  /**
   * Free only GPU resources owned by the duplicate Skeleton objects. Their Bone
   * Object3Ds may remain in the loaded module hierarchy until the module root is
   * evicted; they are no longer used for skinning after rebinding.
   */
  for (const skeleton of replacedSkeletons) {
    skeleton.dispose();
  }

  return {
    skinnedMeshes,
    replacedSkeletons: replacedSkeletons.size,
  };
}
