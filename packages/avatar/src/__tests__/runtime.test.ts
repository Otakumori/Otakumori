import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';

import {
  applySemanticMaterials,
  applySemanticMorphs,
  attachEquipment,
  cloneOwnedScene,
  disposeOwnedScene,
} from '../renderer/runtime';

describe('Avatar production renderer runtime', () => {
  it('clones the base without sharing mutable geometry or materials', () => {
    const source = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
    source.add(mesh);
    const clone = cloneOwnedScene(source);
    const clonedMesh = clone.children[0] as THREE.Mesh;
    expect(clonedMesh.geometry).not.toBe(mesh.geometry);
    expect(clonedMesh.material).not.toBe(mesh.material);
  });

  it('maps semantic morphs to production GLB target names', () => {
    const root = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
    mesh.morphTargetDictionary = { om_body_height: 0 };
    mesh.morphTargetInfluences = [0];
    root.add(mesh);
    expect(applySemanticMorphs(root, { height: 0.75 })).toEqual(['height']);
    expect(mesh.morphTargetInfluences[0]).toBe(0.75);
  });

  it('applies colors only to matching semantic material slots', () => {
    const root = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: '#ffffff' });
    skin.userData.avatarSlot = 'skin';
    const armor = new THREE.MeshStandardMaterial({ color: '#ffffff' });
    armor.name = 'metal';
    root.add(new THREE.Mesh(new THREE.BoxGeometry(), [skin, armor]));
    applySemanticMaterials(root, { skin: '#123456', hair: '#654321' });
    expect(skin.color.getHexString()).toBe('123456');
    expect(armor.color.getHexString()).toBe('ffffff');
  });

  it('attaches rigid hair to Head and replaces without duplication', () => {
    const base = new THREE.Group();
    const head = new THREE.Bone();
    head.name = 'Head';
    base.add(head);
    const first = new THREE.Group();
    const second = new THREE.Group();
    attachEquipment(base, first, 'Hair');
    expect(head.children).toContain(first);
    first.removeFromParent();
    attachEquipment(base, second, 'Hair');
    expect(head.children).toEqual([second]);
  });

  it('rejects a static full-body outfit and disposes owned resources', () => {
    const base = new THREE.Group();
    expect(() => attachEquipment(base, new THREE.Group(), 'OuterWear')).toThrow(/skinned asset/);
    const owned = new THREE.Group();
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial();
    vi.spyOn(geometry, 'dispose');
    vi.spyOn(material, 'dispose');
    owned.add(new THREE.Mesh(geometry, material));
    disposeOwnedScene(owned);
    expect(geometry.dispose).toHaveBeenCalledOnce();
    expect(material.dispose).toHaveBeenCalledOnce();
  });

  it('keeps authorization policy out of the production renderer', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'packages/avatar/src/renderer/AvatarRenderer.tsx'),
      'utf8',
    );
    expect(source).not.toMatch(/nsfw|adultVerified|ageVerified/i);
  });
});
