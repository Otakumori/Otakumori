precision highp float;

// Anisotropic hair shader for realistic hair rendering
uniform float uTime;
uniform vec3 uCameraPosition;

// Hair textures
uniform sampler2D uHairDiffuse;
uniform sampler2D uHairNormal;
uniform sampler2D uHairFlow; // Hair flow direction map
uniform sampler2D uHairMask; // Hair coverage mask

// Hair properties
uniform vec3 uHairColor;
uniform vec3 uHairHighlight;
uniform float uHairRoughness;
uniform float uHairMetallic;
uniform float uAnisotropy;
uniform float uFlowScale;

// Lighting
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform vec3 uAmbientLight;

// Animation
uniform float uWindStrength;
uniform vec2 uWindDirection;
uniform float uHairMovement;

// Varyings
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec3 vTangent;
varying vec3 vBitangent;

// Constants
const float PI = 3.14159265359;

// Utility functions
vec3 getHairTangent() {
    vec2 flow = texture2D(uHairFlow, vUv).xy * 2.0 - 1.0;
    return normalize(vTangent + vBitangent * flow.y + vNormal * flow.x);
}

// Kajiya-Kay hair shading model
vec3 kajiyaKayHair(vec3 tangent, vec3 lightDir, vec3 viewDir, vec3 baseColor, vec3 highlightColor) {
    float TdotL = dot(tangent, lightDir);
    float TdotV = dot(tangent, viewDir);
    
    // Direction attenuation
    float dirAtten = smoothstep(-1.0, 0.0, TdotL) * smoothstep(-1.0, 0.0, TdotV);
    
    // Primary highlight
    float sinTH = sqrt(1.0 - TdotL * TdotL) * sqrt(1.0 - TdotV * TdotV) - TdotL * TdotV;
    float primaryHighlight = pow(max(0.0, sinTH), 1.0 / uHairRoughness) * dirAtten;
    
    // Secondary highlight (shifted)
    float shift = 0.1;
    float TdotVShifted = dot(tangent, normalize(viewDir + vec3(shift, 0.0, 0.0)));
    float sinTHShifted = sqrt(1.0 - TdotL * TdotL) * sqrt(1.0 - TdotVShifted * TdotVShifted) - TdotL * TdotVShifted;
    float secondaryHighlight = pow(max(0.0, sinTHShifted), 1.0 / (uHairRoughness * 2.0)) * dirAtten * 0.5;
    
    // Combine highlights
    vec3 highlights = (primaryHighlight + secondaryHighlight) * highlightColor;
    
    // Base hair color with ambient
    vec3 baseHair = baseColor * max(0.3, dot(vNormal, lightDir));
    
    return baseHair + highlights;
}

// Hair movement simulation
vec2 hairMovement(vec2 uv, float time) {
    vec2 wind = uWindDirection * uWindStrength * sin(time * 2.0 + uv.y * 10.0);
    return uv + wind * uHairMovement;
}

// Hair color variation
vec3 getHairColor(vec2 uv) {
    vec4 hairSample = texture2D(uHairDiffuse, uv);
    vec3 baseColor = uHairColor * hairSample.rgb;
    
    // Add subtle color variation
    float variation = sin(uv.x * 50.0) * 0.1;
    baseColor += variation * vec3(0.1, 0.05, 0.02);
    
    return baseColor;
}

// Hair highlight color
vec3 getHairHighlight(vec2 uv) {
    vec4 maskSample = texture2D(uHairMask, uv);
    return uHairHighlight * maskSample.r;
}

void main() {
    // Animated UV coordinates for hair movement
    vec2 animatedUv = hairMovement(vUv, uTime);
    
    // Get hair tangent from flow map
    vec3 hairTangent = getHairTangent();
    
    // Sample textures
    vec3 hairColor = getHairColor(animatedUv);
    vec3 hairHighlight = getHairHighlight(animatedUv);
    
    // Normal from normal map
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightDirection);
    vec3 viewDir = normalize(vViewDirection);
    
    // Apply Kajiya-Kay hair shading
    vec3 finalColor = kajiyaKayHair(hairTangent, lightDir, viewDir, hairColor, hairHighlight);
    
    // Apply lighting
    finalColor *= uLightColor * uLightIntensity;
    finalColor += uAmbientLight * hairColor * 0.2;
    
    // Hair mask for transparency
    float hairMask = texture2D(uHairMask, animatedUv).a;
    
    // Gamma correction
    finalColor = pow(finalColor, vec3(1.0 / 2.2));
    
    gl_FragColor = vec4(finalColor, hairMask);
}
