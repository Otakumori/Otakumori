/**
 * Outline Rendering Pass for Anime-Style Line Rendering
 * Uses outline.frag.ts and outline.vert.ts as reference
 */

import * as THREE from 'three';

export interface OutlinePassOptions {
  outlineWidth?: number;
  outlineColor?: THREE.Color | string | number;
  opacity?: number;
}

/**
 * Create outline material for anime-style line rendering
 * Controlled width and color customization
 * Integrated with post-processing pipeline
 */
export function createOutlineMaterial(options: OutlinePassOptions = {}): THREE.ShaderMaterial {
  const outlineWidth = options.outlineWidth ?? 0.02;
  const outlineColor =
    options.outlineColor instanceof THREE.Color
      ? options.outlineColor
      : new THREE.Color(options.outlineColor || 0x000000);
  const opacity = options.opacity ?? 1.0;

  const vertexShader = `
    uniform float uThickness;
    
    void main() {
      vec3 newPosition = position + normal * uThickness;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    uniform float uOpacity;
    
    void main() {
      gl_FragColor = vec4(uColor, uOpacity);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {
      uThickness: { value: outlineWidth },
      uColor: { value: outlineColor },
      uOpacity: { value: opacity },
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide, // Render back faces for outline
    transparent: opacity < 1.0,
  });
}

/**
 * Apply outline to a mesh or group
 * Creates a duplicate with outline material rendered behind
 */
export function applyOutline(
  object: THREE.Object3D,
  options: OutlinePassOptions = {},
): THREE.Group {
  const outlineMat = createOutlineMaterial(options);
  const group = new THREE.Group();

  // Clone the object for outline
  const outlineMesh = object.clone();
  outlineMesh.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const outlineChild = child.clone();
      outlineChild.material = outlineMat;
      outlineChild.renderOrder = -1; // Render behind
      group.add(outlineChild);
    }
  });

  // Add original object
  group.add(object);

  return group;
}
