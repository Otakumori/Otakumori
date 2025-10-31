// src/renderer/AvatarRenderer.tsx
import { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { jsx } from 'react/jsx-runtime';
function AvatarRenderer({ spec, resolved, reducedMotion = false, onLoad, onError }) {
  const groupRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { scene: baseScene } = useGLTF(spec.baseMeshUrl);
  useEffect(() => {
    if (!baseScene) return;
    try {
      baseScene.traverse((node) => {
        if (node instanceof THREE.SkinnedMesh || node instanceof THREE.Mesh) {
          const mesh = node;
          const influences = mesh.morphTargetInfluences;
          const dictionary = mesh.morphTargetDictionary;
          if (!influences || !dictionary) {
            return;
          }
          Object.entries(spec.morphWeights).forEach(([morphId, weight]) => {
            const index = dictionary[morphId];
            if (index !== void 0) {
              influences[index] = weight;
            }
          });
        }
      });
      setIsLoaded(true);
      if (onLoad) {
        onLoad();
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  }, [baseScene, spec.morphWeights, onLoad, onError]);
  useFrame((state) => {
    if (!groupRef.current || reducedMotion || !isLoaded) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.01;
  });
  useEffect(() => {
    if (Object.keys(resolved).length > 0) {
    }
  }, [resolved]);
  return /* @__PURE__ */ jsx('group', {
    ref: (group) => {
      groupRef.current = group ? group : null;
    },
    children: baseScene && /* @__PURE__ */ jsx('primitive', { object: baseScene.clone() }),
  });
}
function preloadAvatar(baseMeshUrl) {
  useGLTF.preload(baseMeshUrl);
}

export { AvatarRenderer, preloadAvatar };
