export const outlineFrag = `
precision highp float;

// Outline fragment shader for cel-shaded borders
uniform vec3 uOutlineColor;
uniform float uOutlineOpacity;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Simple outline color
    gl_FragColor = vec4(uOutlineColor, uOutlineOpacity);
}
`;
