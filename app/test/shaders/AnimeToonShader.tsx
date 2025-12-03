/**
 * Anime Toon Shader - Code Vein / Nikke Style
 * Cel-shaded rendering with rim lighting and specular highlights
 */

import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex Shader
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment Shader
const fragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uLightColor;
  uniform vec3 uRimColor;
  uniform float uRimPower;
  uniform float uGlossiness;
  uniform float uSteps;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    
    // Diffuse lighting
    float NdotL = dot(normal, lightDir);
    
    // Cel-shading steps (toon effect)
    float toonSteps = uSteps;
    float toonDiffuse = floor(NdotL * toonSteps) / toonSteps;
    toonDiffuse = max(toonDiffuse, 0.3); // Ambient floor
    
    // Rim lighting (Fresnel effect)
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = pow(rim, uRimPower);
    vec3 rimLight = uRimColor * rim;
    
    // Specular highlight (anime style)
    vec3 halfDir = normalize(lightDir + viewDir);
    float NdotH = max(dot(normal, halfDir), 0.0);
    float specular = pow(NdotH, uGlossiness * 100.0);
    specular = step(0.5, specular); // Hard edge for anime look
    vec3 specularColor = vec3(1.0) * specular * 0.3;
    
    // Combine all lighting
    vec3 finalColor = uColor * toonDiffuse * uLightColor;
    finalColor += rimLight;
    finalColor += specularColor;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Create shader material
const AnimeToonShaderImpl = shaderMaterial(
  {
    uColor: new THREE.Color('#fde4d0'),
    uLightColor: new THREE.Color('#ffffff'),
    uRimColor: new THREE.Color('#ff6b9d'),
    uRimPower: 3.0,
    uGlossiness: 0.6,
    uSteps: 4.0, // Number of cel-shading steps
  },
  vertexShader,
  fragmentShader
);

// Extend to use in JSX
extend({ AnimeToonShaderImpl });

// Type declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      animeToonShaderImpl: any;
    }
  }
}

export { AnimeToonShaderImpl };

// React component wrapper
export function AnimeToonMaterial({
  color = '#fde4d0',
  lightColor = '#ffffff',
  rimColor = '#ff6b9d',
  rimPower = 3.0,
  glossiness = 0.6,
  steps = 4.0,
  ...props
}: {
  color?: string;
  lightColor?: string;
  rimColor?: string;
  rimPower?: number;
  glossiness?: number;
  steps?: number;
  [key: string]: any;
}) {
  return (
    <animeToonShaderImpl
      uColor={new THREE.Color(color)}
      uLightColor={new THREE.Color(lightColor)}
      uRimColor={new THREE.Color(rimColor)}
      uRimPower={rimPower}
      uGlossiness={glossiness}
      uSteps={steps}
      {...props}
    />
  );
}

