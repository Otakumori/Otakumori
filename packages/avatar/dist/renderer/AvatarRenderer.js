import { jsx as _jsx } from "react/jsx-runtime";
/**
 * React Three Fiber Avatar Renderer Component
 * Policy-agnostic renderer that receives pre-resolved equipment URLs
 */
import { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
/**
 * AvatarRenderer - Loads and renders avatar with resolved equipment
 * NO POLICY LOGIC - equipment is already resolved by server
 */
export function AvatarRenderer({ spec, resolved, reducedMotion = false, onLoad, onError, }) {
    const groupRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    // Load base mesh (useGLTF suspends on error, no error prop)
    const { scene: baseScene } = useGLTF(spec.baseMeshUrl);
    // Apply morph targets when scene loads
    useEffect(() => {
        if (!baseScene)
            return;
        try {
            // Find skinned meshes with morph targets
            baseScene.traverse((node) => {
                if (node.isSkinnedMesh || node.isMesh) {
                    const mesh = node;
                    if (mesh.morphTargetInfluences && mesh.morphTargetDictionary) {
                        // Apply morph weights
                        Object.entries(spec.morphWeights).forEach(([morphId, weight]) => {
                            const index = mesh.morphTargetDictionary[morphId];
                            if (index !== undefined && mesh.morphTargetInfluences) {
                                mesh.morphTargetInfluences[index] = weight;
                            }
                        });
                    }
                }
            });
            setIsLoaded(true);
            if (onLoad) {
                onLoad();
            }
        }
        catch (error) {
            if (onError) {
                onError(error);
            }
        }
    }, [baseScene, spec.morphWeights, onLoad, onError]);
    // Idle animation (if not reduced motion)
    useFrame((state) => {
        if (!groupRef.current || reducedMotion || !isLoaded)
            return;
        // Subtle breathing/idle animation
        const time = state.clock.getElapsedTime();
        groupRef.current.position.y = Math.sin(time * 0.5) * 0.01;
    });
    // Equipment loading would be handled here in full implementation
    // For now, we acknowledge the resolved equipment but don't render it yet
    useEffect(() => {
        // TODO: Load and attach equipment meshes from resolved URLs
        // This would involve:
        // 1. Loading each equipment GLTF
        // 2. Attaching to appropriate bones
        // 3. Applying palette colors to materials
        if (Object.keys(resolved).length > 0) {
            // Equipment present, would load here
        }
    }, [resolved]);
    return _jsx("group", { ref: groupRef, children: baseScene && _jsx("primitive", { object: baseScene.clone() }) });
}
// Preload utility for better performance
export function preloadAvatar(baseMeshUrl) {
    useGLTF.preload(baseMeshUrl);
}
