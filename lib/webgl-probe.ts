export function probeWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return false;
    
    // Test basic WebGL functionality
    (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).ALIASED_LINE_WIDTH_RANGE);
    return true;
  } catch (e) {
    return false;
  }
}
