export const subsurfaceScatteringFrag = `
uniform sampler2D uDiffuseMap;
uniform sampler2D uNormalMap;
uniform sampler2D uThicknessMap;
uniform vec3 uSkinTone;
uniform float uSubsurfaceStrength;
uniform vec3 uSubsurfaceColor;
uniform float uThicknessScale;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uCameraPosition;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

// Subsurface scattering approximation
vec3 calculateSubsurfaceScattering(vec3 normal, vec3 lightDir, vec3 viewDir, float thickness) {
  // Simple subsurface scattering model
  float NdotL = dot(normal, lightDir);
  float NdotV = dot(normal, viewDir);
  
  // Back-scattering for thin areas
  float backScatter = max(0.0, -NdotL) * (1.0 - thickness);
  
  // Forward scattering for thick areas
  float forwardScatter = max(0.0, NdotL) * thickness;
  
  // Combine scattering
  vec3 scatter = uSubsurfaceColor * (backScatter + forwardScatter * 0.5);
  
  return scatter * uSubsurfaceStrength;
}

void main() {
  vec4 diffuseColor = texture2D(uDiffuseMap, vUv);
  vec3 normal = normalize(vNormal);
  
  // Sample thickness map for subsurface scattering
  float thickness = texture2D(uThicknessMap, vUv).r * uThicknessScale;
  
  // Calculate lighting
  vec3 lightDir = normalize(uLightDirection);
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
  
  // Base diffuse lighting
  float NdotL = max(0.0, dot(normal, lightDir));
  vec3 diffuse = diffuseColor.rgb * NdotL * uLightColor;
  
  // Subsurface scattering
  vec3 subsurface = calculateSubsurfaceScattering(normal, lightDir, viewDir, thickness);
  
  // Combine results
  vec3 finalColor = diffuse + subsurface;
  
  // Apply skin tone tinting
  finalColor *= uSkinTone;
  
  gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`;
