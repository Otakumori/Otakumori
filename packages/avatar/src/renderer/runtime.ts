import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import type { EquipmentSlotType } from '../spec';
import {
  AVATAR_ATTACHMENT_BONES,
  AVATAR_MORPH_TARGETS,
  type AvatarMaterialSlot,
} from '../productionContract';

export interface RuntimeMaterialPalette {
  skin?: string | undefined;
  eyes?: string | undefined;
  hair?: string | undefined;
  outfit?: string | undefined;
}

function cloneOwnedMaterial(material: THREE.Material): THREE.Material {
  const clone = material.clone();
  for (const [key, value] of Object.entries(clone)) {
    if (value instanceof THREE.Texture) {
      (clone as unknown as Record<string, unknown>)[key] = value.clone();
    }
  }
  return clone;
}

export function cloneOwnedScene(source: THREE.Object3D): THREE.Object3D {
  const clone = SkeletonUtils.clone(source);
  clone.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    node.geometry = node.geometry.clone();
    node.material = Array.isArray(node.material)
      ? node.material.map(cloneOwnedMaterial)
      : cloneOwnedMaterial(node.material);
  });
  return clone;
}

function semanticSlot(material: THREE.Material): AvatarMaterialSlot | null {
  const declared = material.userData.avatarSlot;
  if (declared === 'skin' || declared === 'eyes' || declared === 'hair' || declared === 'outfit') {
    return declared;
  }
  const name = material.name.toLowerCase();
  if (/skin|body/.test(name)) return 'skin';
  if (/eye|iris|cornea|sclera/.test(name)) return 'eyes';
  if (/hair/.test(name)) return 'hair';
  if (/outfit|cloth|shirt|jacket|dress|trouser|skirt|boot/.test(name)) return 'outfit';
  return null;
}

export function applySemanticMaterials(
  root: THREE.Object3D,
  palette?: RuntimeMaterialPalette,
): void {
  if (!palette) return;
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      const slot = semanticSlot(material);
      const color = slot ? palette[slot] : undefined;
      if (!color || !(material instanceof THREE.MeshStandardMaterial)) continue;
      material.color.set(color);
      material.needsUpdate = true;
    }
  });
}

export function applySemanticMorphs(
  root: THREE.Object3D,
  semanticWeights: Record<string, number>,
): string[] {
  const applied = new Set<string>();
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh) || !node.morphTargetDictionary || !node.morphTargetInfluences)
      return;
    for (const [semantic, rawWeight] of Object.entries(semanticWeights)) {
      const target =
        AVATAR_MORPH_TARGETS[semantic as keyof typeof AVATAR_MORPH_TARGETS] ?? semantic;
      const index = node.morphTargetDictionary[target];
      if (index === undefined) continue;
      node.morphTargetInfluences[index] = THREE.MathUtils.clamp(rawWeight, 0, 1);
      applied.add(semantic);
    }
  });
  return [...applied];
}

function bonesByName(root: THREE.Object3D): Map<string, THREE.Bone> {
  const bones = new Map<string, THREE.Bone>();
  root.traverse((node) => {
    if (node instanceof THREE.Bone) bones.set(node.name, node);
  });
  return bones;
}

function rebindSkinnedEquipment(equipment: THREE.Object3D, base: THREE.Object3D): void {
  const baseBones = bonesByName(base);
  equipment.traverse((node) => {
    if (!(node instanceof THREE.SkinnedMesh)) return;
    const reboundBones = node.skeleton.bones.map((bone) => baseBones.get(bone.name));
    if (reboundBones.some((bone) => !bone)) {
      throw new Error('Equipment skeleton is incompatible with the avatar rig');
    }
    node.bind(
      new THREE.Skeleton(reboundBones as THREE.Bone[], node.skeleton.boneInverses),
      node.bindMatrix,
    );
  });
}

export function attachEquipment(
  base: THREE.Object3D,
  equipment: THREE.Object3D,
  slot: EquipmentSlotType,
  attachmentBone?: string,
): THREE.Object3D {
  let hasSkinnedMesh = false;
  equipment.traverse((node) => {
    if (node instanceof THREE.SkinnedMesh) hasSkinnedMesh = true;
  });
  if (hasSkinnedMesh) {
    rebindSkinnedEquipment(equipment, base);
    base.add(equipment);
    return equipment;
  }

  const boneName = attachmentBone ?? AVATAR_ATTACHMENT_BONES[slot];
  if (!boneName && ['OuterWear', 'InnerWear', 'Pants', 'Shoes'].includes(slot)) {
    throw new Error(`${slot} equipment must be authored as a skinned asset`);
  }
  if (!boneName) {
    base.add(equipment);
    return equipment;
  }
  const bone = bonesByName(base).get(boneName);
  if (!bone) throw new Error(`Attachment bone ${boneName} is missing`);
  bone.add(equipment);
  return equipment;
}

export function disposeOwnedScene(root: THREE.Object3D): void {
  const disposedTextures = new Set<THREE.Texture>();
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    node.geometry.dispose();
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture && !disposedTextures.has(value)) {
          value.dispose();
          disposedTextures.add(value);
        }
      }
      material.dispose();
    }
  });
}
