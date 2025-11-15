/**
 * Fallback Avatar Generator
 * Generates procedural avatars when assets are missing
 * NEVER leaves a game with no model
 */

import * as THREE from 'three';
import type { AvatarProfile } from '../types/avatar';
import { skinMaterialProcedural } from '../materials/skinMaterialProcedural';
import { hairGlowMaterial } from '../materials/hairGlowMaterial';
import { outfitMaterialProcedural } from '../materials/outfitMaterialProcedural';

/**
 * Generate fallback avatar when no assets exist
 * Uses ProceduralBodyGenerator with procedural materials and color palette
 */
export function generateFallbackAvatar(profile: AvatarProfile): THREE.Group {
  // Log warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `Generating procedural fallback avatar for profile ${profile.id}. Assets missing from registry.`,
    );
  }

  // Get color palette first
  const palette = profile.colorPalette;

  // Generate procedural body using Three.js primitives
  // In full implementation, would use ProceduralBodyGenerator from app/lib
  const body = new THREE.Group();
  body.name = 'ProceduralBody';

  // Create head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 32, 32),
    skinMaterialProcedural({ skinTone: palette.skin }),
  );
  head.name = 'Head';
  head.position.y = 1.5;
  body.add(head);

  // Create torso
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.3, 1.0, 16),
    outfitMaterialProcedural({ baseColor: palette.outfit }),
  );
  torso.name = 'Torso';
  torso.position.y = 0.5;
  body.add(torso);

  // Create legs
  const leg1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 1.0, 16),
    outfitMaterialProcedural({ baseColor: palette.outfit }),
  );
  leg1.position.set(-0.2, -0.5, 0);
  body.add(leg1);

  const leg2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 1.0, 16),
    outfitMaterialProcedural({ baseColor: palette.outfit }),
  );
  leg2.position.set(0.2, -0.5, 0);
  body.add(leg2);

  // Apply skin material
  body.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh && child.name === 'Head') {
      child.material = skinMaterialProcedural({ skinTone: palette.skin });
    } else if (child instanceof THREE.Mesh && child.name === 'Torso') {
      child.material = outfitMaterialProcedural({ baseColor: palette.outfit });
    } else if (child instanceof THREE.Mesh && child.name.includes('Hair')) {
      child.material = hairGlowMaterial({ hairColor: palette.hair });
    } else if (child instanceof THREE.Mesh) {
      // Default to outfit material for other parts
      child.material = outfitMaterialProcedural({ baseColor: palette.outfit });
    }
  });

  return body;
}

