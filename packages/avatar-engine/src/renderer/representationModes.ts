/**
 * Representation Mode Transformations
 * Transforms avatar for different game representation modes
 */

import * as THREE from 'three';
import type { RepresentationMode, ShadingConfig } from '../types/avatar';

export interface RepresentationTransform {
  scale: [number, number, number];
  cameraOffset: [number, number, number];
  shadingTweaks: ShadingConfig;
  cropBounds?: { min: [number, number, number]; max: [number, number, number] };
}

/**
 * Apply representation mode transformation to avatar group
 */
export function applyRepresentationMode(
  group: THREE.Group,
  mode: RepresentationMode,
): RepresentationTransform {
  const transform = getRepresentationTransform(mode);

  // Apply scale
  group.scale.set(...transform.scale);

  // Apply crop bounds if specified (for bust/portrait modes)
  if (transform.cropBounds) {
    // In a full implementation, we would hide geometry outside bounds
    // For now, we just return the transform config
  }

  return transform;
}

/**
 * Get representation transform config for a mode
 */
export function getRepresentationTransform(mode: RepresentationMode): RepresentationTransform {
  switch (mode) {
    case 'fullBody':
      return {
        scale: [1, 1, 1],
        cameraOffset: [0, 1.5, 3],
        shadingTweaks: {
          rimPower: 3.0,
          rimColor: '#ffffff',
          toonSteps: 4,
          smoothness: 0.1,
          bloomIntensity: 0.5,
          outlineWidth: 0.015, // Tuned for anime-style (not chunky)
          outlineColor: '#000000',
        },
      };

    case 'bust':
      // Crop to waist-up, refine shading, emphasize face/hair/lips/eyes
      return {
        scale: [1, 1, 1],
        cameraOffset: [0, 1.2, 2.5],
        shadingTweaks: {
          rimPower: 2.5, // Softer rim
          rimColor: '#ffe0cc', // Warmer rim for skin
          toonSteps: 3, // Fewer steps for smoother skin
          smoothness: 0.08, // Very smooth
          bloomIntensity: 0.6, // More bloom for premium look
          outlineWidth: 0.015, // Thinner outline
          outlineColor: '#000000',
        },
        cropBounds: {
          min: [-1, -0.5, -1],
          max: [1, 1.5, 1],
        },
      };

    case 'portrait':
      // Head/shoulder frame, simplified shading, depth-of-field, crisp lines
      return {
        scale: [1.2, 1.2, 1.2], // Slightly larger for portrait
        cameraOffset: [0, 1.0, 2.0],
        shadingTweaks: {
          rimPower: 2.0,
          rimColor: '#ffffff',
          toonSteps: 2, // Very few steps for simplified shading
          smoothness: 0.05,
          bloomIntensity: 0.4,
          outlineWidth: 0.012, // Crisp, anime-style lines (not chunky)
          outlineColor: '#000000',
        },
        cropBounds: {
          min: [-0.8, -0.3, -0.8],
          max: [0.8, 1.2, 0.8],
        },
      };

    case 'chibi':
      // Proportional remap: larger head, simplified eyes, thicker outlines, same palette
      return {
        scale: [1.5, 1.5, 1.5], // Larger overall
        cameraOffset: [0, 1.0, 2.5],
        shadingTweaks: {
          rimPower: 4.0, // Stronger rim
          rimColor: '#ffffff',
          toonSteps: 3, // Moderate steps
          smoothness: 0.12,
          bloomIntensity: 0.5,
          outlineWidth: 0.04, // Thicker outlines for chibi
          outlineColor: '#000000',
        },
      };

    case 'handsOnly':
      // Top-down view showing only hands and forearms reaching into frame
      return {
        scale: [1.2, 1.2, 1.2],
        cameraOffset: [0, 0.3, 1.5], // Top-down angle, closer to show hands
        shadingTweaks: {
          rimPower: 2.5,
          rimColor: '#ffe0cc', // Warm rim for skin
          toonSteps: 3,
          smoothness: 0.1,
          bloomIntensity: 0.4,
          outlineWidth: 0.012,
          outlineColor: '#000000',
        },
        cropBounds: {
          min: [-0.5, -0.2, -0.5],
          max: [0.5, 0.8, 0.5], // Only show hands/forearms
        },
      };

    case 'firstPerson':
      // First person view - arms/weapon only, camera at eye level
      return {
        scale: [1, 1, 1],
        cameraOffset: [0, 1.6, 0], // Eye level, no forward offset (camera is at origin)
        shadingTweaks: {
          rimPower: 3.0,
          rimColor: '#ffffff',
          toonSteps: 4,
          smoothness: 0.1,
          bloomIntensity: 0.5,
          outlineWidth: 0.015,
          outlineColor: '#000000',
        },
        cropBounds: {
          min: [-0.8, -0.5, -0.3], // Only show arms/weapon area
          max: [0.8, 1.0, 1.0],
        },
      };

    case 'stageFullBody':
      // Full body on stage, elevated camera angle for performance view
      return {
        scale: [1, 1, 1],
        cameraOffset: [0, 1.5, 4.0], // Elevated, further back to show full body
        shadingTweaks: {
          rimPower: 3.5,
          rimColor: '#ffffff',
          toonSteps: 4,
          smoothness: 0.1,
          bloomIntensity: 0.6, // More bloom for stage lighting
          outlineWidth: 0.015,
          outlineColor: '#000000',
        },
      };

    case 'sideScroller':
      // Side-scrolling view, orthographic camera setup
      return {
        scale: [1, 1, 1],
        cameraOffset: [3, 1.5, 0], // Side view, character facing camera
        shadingTweaks: {
          rimPower: 3.0,
          rimColor: '#ffffff',
          toonSteps: 4,
          smoothness: 0.1,
          bloomIntensity: 0.5,
          outlineWidth: 0.015,
          outlineColor: '#000000',
        },
      };

    default:
      return getRepresentationTransform('fullBody');
  }
}
