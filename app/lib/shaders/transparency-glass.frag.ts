export const transparencyGlassFrag = `
uniform sampler2D uDiffuseMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;
uniform sampler2D uEnvironmentMap;
uniform vec3 uGlassColor;
uniform float uGlassRoughness;
uniform float uRefractionIndex;
uniform float uTransparency;
uniform float uFresnelPower;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uCameraPosition;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

// Glass refraction and reflection
vec3 calculateGlassLighting(vec3 normal, vec3 lightDir, vec3 viewDir, float roughness) {
  vec3 halfVector = normalize(lightDir + viewDir);
  float NdotL = max(0.0, dot(normal, lightDir));
  float NdotV = max(0.0, dot(normal, viewDir));
  float NdotH = max(0.0, dot(normal, halfVector));
  float VdotH = max(0.0, dot(viewDir, halfVector));
  
  // Glass-specific BRDF
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
  
  // Fresnel for glass
  float F0 = pow((1.0 - uRefractionIndex) / (1.0 + uRefractionIndex), 2.0);
  float F = F0 + (1.0 - F0) * pow(1.0 - VdotH, uFresnelPower);
  
  // Specular reflection
  vec3 specular = (D * G * F) / (4.0 * NdotL * NdotV + 0.001);
  
  return uLightColor * specular;
}

// Refraction calculation
vec3 calculateRefraction(vec3 normal, vec3 viewDir, float eta) {
  float cosI = -dot(normal, viewDir);
  float sinT2 = eta * eta * (1.0 - cosI * cosI);
  
  if (sinT2 > 1.0) {
    // Total internal reflection
    return vec3(0.0);
  }
  
  float cosT = sqrt(1.0 - sinT2);
  vec3 refractDir = eta * viewDir + (eta * cosI - cosT) * normal;
  
  // Sample environment map for refraction
  vec2 envUv = vec2(
    atan(refractDir.z, refractDir.x) / (2.0 * 3.14159) + 0.5,
    acos(refractDir.y) / 3.14159
  );
  
  return texture2D(uEnvironmentMap, envUv).rgb;
}

void main() {
  vec4 diffuseColor = texture2D(uDiffuseMap, vUv);
  vec3 normal = normalize(vNormal);
  float roughness = texture2D(uRoughnessMap, vUv).r * uGlassRoughness;
  
  // Calculate lighting
  vec3 lightDir = normalize(uLightDirection);
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
  
  // Glass lighting
  vec3 lighting = calculateGlassLighting(normal, lightDir, viewDir, roughness);
  
  // Refraction
  vec3 refraction = calculateRefraction(normal, viewDir, uRefractionIndex);
  
  // Fresnel factor
  float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), uFresnelPower);
  
  // Combine reflection and refraction
  vec3 finalColor = mix(refraction, lighting, fresnel) * uGlassColor;
  
  // Apply transparency
  float alpha = diffuseColor.a * uTransparency * (1.0 - fresnel * 0.5);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;
