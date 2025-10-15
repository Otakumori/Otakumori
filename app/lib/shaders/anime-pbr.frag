precision highp float;

// Anime-realistic PBR fragment shader with toon shading and NSFW content support
uniform float uTime;
uniform vec3 uCameraPosition;

// Material textures
uniform sampler2D uDiffuseMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;
uniform sampler2D uMetallicMap;
uniform sampler2D uEmissionMap;
uniform sampler2D uAlphaMap;

// Material properties
uniform vec3 uAlbedo;
uniform float uMetallic;
uniform float uRoughness;
uniform float uNormalScale;
uniform vec3 uEmission;
uniform float uAlpha;

// Lighting
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform vec3 uAmbientLight;

// Anime/Toon shading parameters
uniform float uToonSteps;
uniform float uToonSmoothness;
uniform float uRimPower;
uniform float uRimIntensity;
uniform vec3 uRimColor;

// Skin shading parameters
uniform vec3 uSkinTone;
uniform float uSubsurfaceStrength;
uniform vec3 uSubsurfaceColor;
uniform float uSkinRoughness;

// NSFW content flags
uniform bool uShowNsfwContent;
uniform bool uAgeVerified;
uniform float uContentOpacity;

// Varyings from vertex shader
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec4 vShadowCoord;
varying vec3 vLightDirection;
varying float vNdotL;

// Constants
const float PI = 3.14159265359;
const float E = 2.71828182846;

// Utility functions
vec3 getNormalFromMap() {
    vec3 tangentNormal = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
    tangentNormal.xy *= uNormalScale;
    
    vec3 N = normalize(vNormal);
    vec3 T = normalize(vTangent);
    vec3 B = normalize(vBitangent);
    mat3 TBN = mat3(T, B, N);
    
    return normalize(TBN * tangentNormal);
}

// Toon shading function
float toonShading(float NdotL, float steps, float smoothness) {
    float stepped = floor(NdotL * steps) / steps;
    return mix(stepped, smoothstep(0.0, 1.0, NdotL), smoothness);
}

// Rim lighting for anime effect
float rimLighting(vec3 normal, vec3 viewDir, float power) {
    float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
    return pow(fresnel, power);
}

// Subsurface scattering approximation for skin
vec3 subsurfaceScattering(vec3 normal, vec3 lightDir, vec3 viewDir, vec3 albedo) {
    float NdotL = max(dot(normal, lightDir), 0.0);
    float VdotL = max(dot(viewDir, -lightDir), 0.0);
    
    // Simple subsurface approximation
    float subsurface = pow(max(0.0, VdotL), 2.0) * uSubsurfaceStrength;
    return albedo * uSubsurfaceColor * subsurface;
}

// Enhanced Cook-Torrance BRDF with anime quantization
vec3 cookTorranceAnime(vec3 normal, vec3 lightDir, vec3 viewDir, vec3 albedo, float metallic, float roughness) {
    vec3 halfway = normalize(lightDir + viewDir);
    
    float NdotL = max(dot(normal, lightDir), 0.0);
    float NdotV = max(dot(normal, viewDir), 0.0);
    float NdotH = max(dot(normal, halfway), 0.0);
    float VdotH = max(dot(viewDir, halfway), 0.0);
    
    // Apply toon quantization to NdotL
    NdotL = toonShading(NdotL, uToonSteps, uToonSmoothness);
    
    // Fresnel term
    vec3 F0 = mix(vec3(0.04), albedo, metallic);
    float F = pow(1.0 - max(dot(halfway, viewDir), 0.0), 5.0);
    vec3 fresnel = F0 + (1.0 - F0) * F;
    
    // Distribution function (GGX)
    float alpha = roughness * roughness;
    float alpha2 = alpha * alpha;
    float denom = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
    float D = alpha2 / (PI * denom * denom);
    
    // Geometry function
    float G1 = 2.0 / (1.0 + sqrt(1.0 + alpha2 * (1.0 - NdotV * NdotV) / (NdotV * NdotV)));
    float G2 = 2.0 / (1.0 + sqrt(1.0 + alpha2 * (1.0 - NdotL * NdotL) / (NdotL * NdotL)));
    float G = G1 * G2;
    
    // Combine terms
    vec3 numerator = D * G * fresnel;
    float denominator = 4.0 * NdotV * NdotL + 0.001;
    vec3 specular = numerator / denominator;
    
    // Mix diffuse and specular
    vec3 diffuse = albedo / PI;
    vec3 kS = fresnel;
    vec3 kD = (1.0 - kS) * (1.0 - metallic);
    
    return (kD * diffuse + specular) * NdotL;
}

// Hair anisotropic shading
vec3 hairShading(vec3 normal, vec3 tangent, vec3 lightDir, vec3 viewDir, vec3 albedo) {
    vec3 bitangent = normalize(cross(normal, tangent));
    
    float TdotL = dot(tangent, lightDir);
    float TdotV = dot(tangent, viewDir);
    float BdotL = dot(bitangent, lightDir);
    float BdotV = dot(bitangent, viewDir);
    
    // Anisotropic highlights
    float anisotropy = 0.8;
    float roughness = 0.1;
    
    // Primary highlight (Kajiya-Kay model approximation)
    float sinTH = sqrt(1.0 - TdotL * TdotL) * sqrt(1.0 - TdotV * TdotV) - TdotL * TdotV;
    float dirAtten = smoothstep(-1.0, 0.0, TdotL) * smoothstep(-1.0, 0.0, TdotV);
    
    float primaryHighlight = pow(max(0.0, sinTH), 1.0 / roughness) * dirAtten;
    
    // Secondary highlight
    float secondaryHighlight = pow(max(0.0, sinTH), 1.0 / (roughness * 2.0)) * dirAtten * 0.5;
    
    vec3 highlight = vec3(primaryHighlight + secondaryHighlight);
    return albedo * (1.0 - anisotropy) + highlight * anisotropy;
}

// Content filtering for NSFW elements
vec4 applyContentFiltering(vec4 color, bool isNsfwContent) {
    if (!uAgeVerified && isNsfwContent) {
        // Blur and desaturate NSFW content for non-verified users
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(color.rgb, vec3(gray), 0.7);
        color.a *= 0.5;
    }
    
    if (!uShowNsfwContent && isNsfwContent) {
        // Hide NSFW content completely
        color.a *= 0.0;
    }
    
    return color;
}

void main() {
    // Sample textures
    vec4 diffuseSample = texture2D(uDiffuseMap, vUv);
    vec3 albedo = uAlbedo * diffuseSample.rgb;
    
    float metallic = uMetallic * texture2D(uMetallicMap, vUv).r;
    float roughness = uRoughness * texture2D(uRoughnessMap, vUv).r;
    vec3 emission = uEmission + texture2D(uEmissionMap, vUv).rgb;
    float alpha = uAlpha * texture2D(uAlphaMap, vUv).r * diffuseSample.a;
    
    // Get normal from normal map
    vec3 normal = getNormalFromMap();
    vec3 lightDir = normalize(uLightDirection);
    vec3 viewDir = normalize(vViewDirection);
    
    // Determine material type based on roughness and metallic values
    bool isSkin = roughness > 0.6 && metallic < 0.1;
    bool isHair = roughness > 0.4 && roughness < 0.6 && metallic < 0.2;
    bool isMetal = metallic > 0.5;
    bool isNsfwContent = uShowNsfwContent; // This would be determined by the part type
    
    vec3 finalColor = vec3(0.0);
    
    if (isSkin) {
        // Skin shading with subsurface scattering
        vec3 skinAlbedo = albedo * uSkinTone;
        finalColor = cookTorranceAnime(normal, lightDir, viewDir, skinAlbedo, metallic, uSkinRoughness);
        
        // Add subsurface scattering
        vec3 subsurface = subsurfaceScattering(normal, lightDir, viewDir, skinAlbedo);
        finalColor += subsurface;
        
    } else if (isHair) {
        // Hair anisotropic shading
        vec3 tangent = normalize(vTangent);
        finalColor = hairShading(normal, tangent, lightDir, viewDir, albedo);
        
    } else {
        // Standard PBR shading with anime quantization
        finalColor = cookTorranceAnime(normal, lightDir, viewDir, albedo, metallic, roughness);
    }
    
    // Apply lighting
    finalColor *= uLightColor * uLightIntensity;
    finalColor += uAmbientLight * albedo * 0.1;
    
    // Add rim lighting for anime effect
    float rim = rimLighting(normal, viewDir, uRimPower);
    finalColor += rim * uRimColor * uRimIntensity;
    
    // Add emission
    finalColor += emission;
    
    // Apply content filtering
    vec4 finalColorWithAlpha = vec4(finalColor, alpha);
    finalColorWithAlpha = applyContentFiltering(finalColorWithAlpha, isNsfwContent);
    
    // Gamma correction
    finalColorWithAlpha.rgb = pow(finalColorWithAlpha.rgb, vec3(1.0 / 2.2));
    
    gl_FragColor = finalColorWithAlpha;
}
