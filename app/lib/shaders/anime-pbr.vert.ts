export const animePbrVert = `
precision highp float;

// Vertex shader for anime-realistic PBR with toon shading
uniform float uTime;
uniform vec3 uCameraPosition;

// Bone animation uniforms
uniform mat4 uBoneMatrices[MAX_BONES];
attribute vec4 aBoneIndices;
attribute vec4 aBoneWeights;

// Standard attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec3 tangent;
attribute vec3 bitangent;

// Varyings to fragment shader
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec4 vShadowCoord;

// Toon shading varyings
varying vec3 vLightDirection;
varying float vNdotL;

void main() {
  vUv = uv;
  
  // Bone animation (if available)
  vec4 animatedPosition = vec4(position, 1.0);
  vec3 animatedNormal = normal;
  
  if (aBoneIndices.x >= 0.0) {
    mat4 boneTransform = 
      aBoneWeights.x * uBoneMatrices[int(aBoneIndices.x)] +
      aBoneWeights.y * uBoneMatrices[int(aBoneIndices.y)] +
      aBoneWeights.z * uBoneMatrices[int(aBoneIndices.z)] +
      aBoneWeights.w * uBoneMatrices[int(aBoneIndices.w)];
    
    animatedPosition = boneTransform * animatedPosition;
    animatedNormal = mat3(boneTransform) * animatedNormal;
  }
  
  // Transform to world space
  vec4 worldPosition = modelMatrix * animatedPosition;
  vWorldPosition = worldPosition.xyz;
  
  // Calculate view direction
  vViewDirection = normalize(uCameraPosition - vWorldPosition);
  
  // Transform normals and tangents to world space
  vNormal = normalize(mat3(modelMatrix) * animatedNormal);
  vTangent = normalize(mat3(modelMatrix) * tangent);
  vBitangent = normalize(mat3(modelMatrix) * bitangent);
  
  // Calculate light direction (assuming directional light)
  vLightDirection = normalize(vec3(1.0, 1.0, 1.0)); // Will be passed as uniform
  vNdotL = dot(vNormal, vLightDirection);
  
  // Shadow mapping coordinate
  vShadowCoord = shadowMatrix * worldPosition;
  
  gl_Position = projectionMatrix * modelViewMatrix * animatedPosition;
}
`;
