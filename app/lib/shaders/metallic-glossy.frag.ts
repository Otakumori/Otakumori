export const metallicGlossyFrag = `
uniform sampler2D uDiffuseMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;
uniform sampler2D uMetallicMap;
uniform sampler2D uEnvironmentMap;
uniform vec3 uMetallicColor;
uniform float uMetallicRoughness;
uniform float uMetallicMetallic;
uniform float uReflectionStrength;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uCameraPosition;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

// PBR metallic/glossy material
vec3 calculateMetallicLighting(vec3 normal, vec3 lightDir, vec3 viewDir, float roughness, float metallic) {
  vec3 halfVector = normalize(lightDir + viewDir);
  float NdotL = max(0.0, dot(normal, lightDir));
  float NdotV = max(0.0, dot(normal, viewDir));
  float NdotH = max(0.0, dot(normal, halfVector));
  float VdotH = max(0.0, dot(viewDir, halfVector));
  
  // Roughness and metallic values
  float alpha = roughness * roughness;
  float alpha2 = alpha * alpha;
  
  // GGX distribution
  float denom = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
  float D = alpha2 / (3.14159 * denom * denom);
  
  // Geometry function
  float k = (alpha + 1.0) * (alpha + 1.0) / 8.0;
  float G1L = NdotL / (NdotL * (1.0 - k) + k);
  float G1V = NdotV / (NdotV * (1.0 - k) + k);
  float G = G1L * G1V;
  
  // Fresnel
  vec3 F0 = mix(vec3(0.04), uMetallicColor, metallic);
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - VdotH, 5.0);
  
  // BRDF
  vec3 specular = (D * G * F) / (4.0 * NdotL * NdotV + 0.001);
  
  // Diffuse
  vec3 diffuse = (1.0 - F) * (1.0 - metallic) * NdotL;
  
  return uLightColor * (diffuse + specular);
}

// Simple environment reflection
vec3 calculateEnvironmentReflection(vec3 normal, vec3 viewDir, float metallic) {
  vec3 reflectDir = reflect(-viewDir, normal);
  
  // Sample environment map (simplified)
  vec2 envUv = vec2(
    atan(reflectDir.z, reflectDir.x) / (2.0 * 3.14159) + 0.5,
    acos(reflectDir.y) / 3.14159
  );
  
  vec3 envColor = texture2D(uEnvironmentMap, envUv).rgb;
  return envColor * metallic * uReflectionStrength;
}

void main() {
  vec4 diffuseColor = texture2D(uDiffuseMap, vUv);
  vec3 normal = normalize(vNormal);
  float roughness = texture2D(uRoughnessMap, vUv).r * uMetallicRoughness;
  float metallic = texture2D(uMetallicMap, vUv).r * uMetallicMetallic;
  
  // Calculate lighting
  vec3 lightDir = normalize(uLightDirection);
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
  
  // PBR lighting
  vec3 lighting = calculateMetallicLighting(normal, lightDir, viewDir, roughness, metallic);
  
  // Environment reflection
  vec3 reflection = calculateEnvironmentReflection(normal, viewDir, metallic);
  
  // Combine results
  vec3 finalColor = diffuseColor.rgb * uMetallicColor * lighting + reflection;
  
  gl_FragColor = vec4(finalColor, diffuseColor.a);
}
`;
