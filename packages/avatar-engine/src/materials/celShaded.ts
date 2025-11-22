/**
 * Unified Cel-Shaded Material System
 * Enforces cel-shaded style across all avatar materials
 */

import * as THREE from 'three';

/**
 * Generate toon ramp texture for cel shading
 */
function generateToonRamp(steps: number = 4, smoothness: number = 0.1): THREE.Texture {
  const width = 256;
  const height = 1;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const smoothstep = (edge0: number, edge1: number, x: number): number => {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };

  for (let x = 0; x < width; x++) {
    const t = x / width;
    const idx = x * 4;

    // Create stepped ramp
    const step = Math.floor(t * steps) / steps;
    const smoothStep = smoothstep(step - smoothness, step + smoothness, t);

    const value = Math.floor(smoothStep * 255);

    data[idx] = value;
    data[idx + 1] = value;
    data[idx + 2] = value;
    data[idx + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

export interface CelShadedMaterialOptions {
  baseColor: THREE.Color | string | number;
  rimColor?: THREE.Color | string | number;
  toonSteps?: number;
  outlineWidth?: number;
  smoothness?: number;
  rimPower?: number;
}

/**
 * Create unified cel-shaded material
 * Replaces all default materials - no flat grey, no realistic PBR
 */
export function createCelShadedMaterial(options: CelShadedMaterialOptions): THREE.ShaderMaterial {
  const baseColor =
    options.baseColor instanceof THREE.Color
      ? options.baseColor
      : new THREE.Color(options.baseColor);
  const rimColor =
    options.rimColor instanceof THREE.Color
      ? new THREE.Color(options.rimColor)
      : new THREE.Color(options.rimColor || 0xffffff);

  const toonSteps = options.toonSteps ?? 4;
  const smoothness = options.smoothness ?? 0.1;
  const rimPower = options.rimPower ?? 3.0;

  // Generate toon ramp texture (banded shadows, not noisy)
  const toonRamp = generateToonRamp(toonSteps, smoothness);

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vUv = uv;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uBaseColor;
    uniform vec3 uRimColor;
    uniform float uRimPower;
    uniform sampler2D uToonRamp;
    uniform float uSmoothness;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      // Normalize vectors
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Main light direction (from top-right)
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
      
      // Toon shading with smoothstep (banded, not noisy)
      float NdotL = max(dot(normal, lightDir), 0.0);
      float toonLight = smoothstep(0.0, uSmoothness, NdotL);
      
      // Sample toon ramp texture
      vec3 toonColor = texture2D(uToonRamp, vec2(toonLight, 0.5)).rgb;
      
      // Rim lighting (anime-style edge glow)
      float rim = 1.0 - max(dot(viewDir, normal), 0.0);
      rim = smoothstep(0.6, 1.0, rim);
      vec3 rimLight = uRimColor * pow(rim, uRimPower);
      
      // Ambient occlusion approximation
      float ao = 0.3 + 0.7 * normal.y;
      
      // Combine (cel-shaded, not realistic)
      vec3 ambient = uBaseColor * 0.3;
      vec3 diffuse = uBaseColor * toonColor * ao;
      vec3 finalColor = ambient + diffuse + rimLight;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const uniforms: { [key: string]: THREE.IUniform } = {
    uBaseColor: { value: baseColor },
    uRimColor: { value: rimColor },
    uRimPower: { value: rimPower },
    uToonRamp: { value: toonRamp },
    uSmoothness: { value: smoothness },
    uTime: { value: 0.0 },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    lights: false, // We handle lighting in the shader
  });
}
