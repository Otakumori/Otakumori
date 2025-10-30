/**
 * Animation blending utilities
 */
/**
 * Cross-fade between two animations
 */
export function crossFade(from, to, progress) {
  const t = easeInOutCubic(progress);
  return [
    { ...from, weight: 1 - t },
    { ...to, weight: t },
  ];
}
/**
 * Blend multiple animations with weights
 */
export function blendAnimations(nodes) {
  // Normalize weights
  const totalWeight = nodes.reduce((sum, node) => sum + node.weight, 0);
  if (totalWeight === 0) {
    return nodes;
  }
  return nodes.map((node) => ({
    ...node,
    weight: node.weight / totalWeight,
  }));
}
/**
 * Easing functions for smooth transitions
 */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}
export function easeInQuad(t) {
  return t * t;
}
/**
 * Linear interpolation
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
/**
 * Smooth step interpolation
 */
export function smoothStep(t) {
  return t * t * (3 - 2 * t);
}
