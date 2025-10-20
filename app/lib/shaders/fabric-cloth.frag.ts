export const fabricClothFrag = `
uniform sampler2D uDiffuseMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;
uniform sampler2D uFabricPatternMap;
uniform vec3 uFabricColor;
uniform float uFabricRoughness;
uniform float uFabricMetallic;
uniform float uPatternScale;
uniform float uPatternIntensity;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uCameraPosition;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

// Fabric-specific lighting model
vec3 calculateFabricLighting(vec3 normal, vec3 lightDir, vec3 viewDir, float roughness) {
  // Microfacet BRDF for fabric
  vec3 halfVector = normalize(lightDir + viewDir);
  float NdotL = max(0.0, dot(normal, lightDir));
  float NdotV = max(0.0, dot(normal, viewDir));
  float NdotH = max(0.0, dot(normal, halfVector));
  float VdotH = max(0.0, dot(viewDir, halfVector));
  
  // Roughness-based specular
  float alpha = roughness * roughness;
  float alpha2 = alpha * alpha;
  
  // GGX distribution
  float denom = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
  float D = alpha2 / (3.14159 * denom * denom);
  
  // Geometry function
  float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  float G1L = NdotL / (NdotL * (1.0 - k) + k);
  float G1V = NdotV / (NdotV * (1.0 - k) + k);
  float G = G1L * G1V;
  
  // Fresnel
  float F0 = 0.04; // Non-metallic fabric
  float F = F0 + (1.0 - F0) * pow(1.0 - VdotH, 5.0);
  
  // BRDF
  vec3 specular = (D * G * F) / (4.0 * NdotL * NdotV + 0.001);
  
  return uLightColor * (NdotL * (1.0 - F) + specular);
}

void main() {
  vec4 diffuseColor = texture2D(uDiffuseMap, vUv);
  vec3 normal = normalize(vNormal);
  float roughness = texture2D(uRoughnessMap, vUv).r * uFabricRoughness;
  
  // Sample fabric pattern
  vec3 pattern = texture2D(uFabricPatternMap, vUv * uPatternScale).rgb;
  pattern = mix(vec3(1.0), pattern, uPatternIntensity);
  
  // Calculate lighting
  vec3 lightDir = normalize(uLightDirection);
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
  
  // Fabric lighting
  vec3 lighting = calculateFabricLighting(normal, lightDir, viewDir, roughness);
  
  // Combine diffuse and pattern
  vec3 finalColor = diffuseColor.rgb * uFabricColor * pattern * lighting;
  
  gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`;
