'use client';

import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { AVATAR_SKELETON_VERSION } from '../productionContract';
import type { AvatarSpecV15Type, EquipmentSlotType } from '../spec';
import {
  applySemanticMaterials,
  applySemanticMorphs,
  attachEquipment,
  cloneOwnedScene,
  disposeOwnedScene,
} from './runtime';

export interface ResolvedEquipment {
  id: string;
  url: string;
  skeletonVersion?: string;
  attachmentBone?: string;
  materialPalette?: { hair?: string | undefined; outfit?: string | undefined } | undefined;
}

export interface AvatarRendererProps {
  spec: AvatarSpecV15Type;
  resolved: Partial<Record<EquipmentSlotType, ResolvedEquipment | null>>;
  reducedMotion?: boolean;
  onLoad?: (() => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
}

class AssetErrorBoundary extends Component<
  { children: ReactNode; onError?: ((error: Error) => void) | undefined },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function EquipmentAttachment({
  base,
  slot,
  asset,
  onError,
}: {
  base: THREE.Object3D;
  slot: EquipmentSlotType;
  asset: ResolvedEquipment;
  onError?: ((error: Error) => void) | undefined;
}) {
  const { scene } = useGLTF(asset.url);
  const owned = useMemo(() => cloneOwnedScene(scene), [scene]);

  useEffect(() => {
    try {
      if (asset.skeletonVersion && asset.skeletonVersion !== AVATAR_SKELETON_VERSION) {
        throw new Error(`Unsupported equipment skeleton version: ${asset.skeletonVersion}`);
      }
      applySemanticMaterials(owned, asset.materialPalette);
      attachEquipment(base, owned, slot, asset.attachmentBone);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
    return () => {
      owned.removeFromParent();
      disposeOwnedScene(owned);
    };
  }, [asset, base, onError, owned, slot]);

  return null;
}

function AvatarRuntime({
  spec,
  resolved,
  reducedMotion = false,
  onLoad,
  onError,
}: AvatarRendererProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const { scene, animations } = useGLTF(spec.baseMeshUrl);
  const base = useMemo(() => cloneOwnedScene(scene), [scene]);

  useEffect(() => {
    applySemanticMorphs(base, spec.morphWeights);
    applySemanticMaterials(base, spec.materialPalette);

    const mixer = animations.length ? new THREE.AnimationMixer(base) : null;
    mixerRef.current = mixer;
    if (!reducedMotion && mixer) {
      const idleName = spec.animationMap.idle;
      const clip = idleName
        ? THREE.AnimationClip.findByName(animations, idleName)
        : animations.find((candidate) => candidate.name.toLowerCase().includes('idle'));
      if (clip) mixer.clipAction(clip).play();
    }
    onLoad?.();
    return () => {
      mixer?.stopAllAction();
      mixer?.uncacheRoot(base);
      mixerRef.current = null;
    };
  }, [
    animations,
    base,
    onLoad,
    reducedMotion,
    spec.animationMap.idle,
    spec.materialPalette,
    spec.morphWeights,
  ]);

  useEffect(() => () => disposeOwnedScene(base), [base]);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    mixerRef.current?.update(delta);
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.01;
  });

  return (
    <group ref={groupRef}>
      <primitive object={base} />
      {Object.entries(resolved).map(([slot, asset]) =>
        asset ? (
          <AssetErrorBoundary key={`${slot}:${asset.id}:${asset.url}`} onError={onError}>
            <EquipmentAttachment
              base={base}
              slot={slot as EquipmentSlotType}
              asset={asset}
              onError={onError}
            />
          </AssetErrorBoundary>
        ) : null,
      )}
    </group>
  );
}

/** Policy-agnostic renderer. Asset authorization and URL resolution remain upstream. */
export function AvatarRenderer(props: AvatarRendererProps) {
  return (
    <AssetErrorBoundary onError={props.onError}>
      <AvatarRuntime {...props} />
    </AssetErrorBoundary>
  );
}

export function preloadAvatar(baseMeshUrl: string) {
  useGLTF.preload(baseMeshUrl);
}
