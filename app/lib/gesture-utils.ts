// Gesture detection and angle snapping utilities for GameCube 3D

export interface GestureState {
  startX: number;
  startY: number;
  isDragging: boolean;
  threshold: number;
}

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down' | 'none';
  distance: number;
}

/**
 * Detect swipe direction from gesture coordinates
 */
export function detectSwipeDirection(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold: number = 30
): SwipeDirection {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  if (distance < threshold) {
    return { direction: 'none', distance };
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return {
      direction: deltaX > 0 ? 'right' : 'left',
      distance: Math.abs(deltaX)
    };
  } else {
    return {
      direction: deltaY > 0 ? 'down' : 'up',
      distance: Math.abs(deltaY)
    };
  }
}

/**
 * Snap angle to nearest 90-degree increment
 */
export function snapToAngle(angle: number): number {
  const snapAngle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
  return snapAngle;
}

/**
 * Calculate shortest rotation path between two angles
 */
export function getShortestRotation(from: number, to: number): number {
  const angleDiff = to - from;
  const normalizedDiff = ((angleDiff % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return normalizedDiff > Math.PI ? normalizedDiff - 2 * Math.PI : normalizedDiff;
}

/**
 * Ease-out cubic interpolation
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Map face slot to rotation angle
 */
export function getFaceAngle(slot: number): number {
  const faceAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, Math.PI / 2, -Math.PI / 2];
  return faceAngles[slot] || 0;
}

/**
 * Map face slot to 3D position
 */
export function getFacePosition(slot: number): [number, number, number] {
  const facePositions: [number, number, number][] = [
    [0, 0, 1.5],    // front
    [1.5, 0, 0],    // right
    [0, 0, -1.5],   // back
    [-1.5, 0, 0],   // left
    [0, 1.5, 0],    // top
    [0, -1.5, 0],   // down
  ];
  return facePositions[slot] || [0, 0, 1.5];
}

/**
 * Check if gesture is a tap (not a swipe)
 */
export function isTap(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold: number = 30
): boolean {
  const deltaX = Math.abs(endX - startX);
  const deltaY = Math.abs(endY - startY);
  return deltaX < threshold && deltaY < threshold;
}
