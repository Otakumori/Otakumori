export const outlineVert = `
precision highp float;

// Outline vertex shader for cel-shaded borders
uniform float uOutlineWidth;
uniform vec3 uOutlineColor;

attribute vec3 position;
attribute vec3 normal;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vNormal = normal;
    vPosition = position;
    
    // Expand vertices along normal for outline effect
    vec3 expandedPosition = position + normal * uOutlineWidth;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(expandedPosition, 1.0);
}
`;
