/**
 * Visual Style Validator
 * Scans scenes for cel-shaded compliance
 */

import * as THREE from 'three';

export interface StyleViolation {
  objectName: string;
  violationType: 'default_material' | 'realistic_pbr' | 'non_cel_shaded';
  suggestion: string;
}

/**
 * Validate cel-shaded compliance in a scene
 * Scans for non-compliant materials
 * Logs warnings for default/realistic materials
 * Suggests replacements with cel-shaded equivalents
 */
export function validateCelShadedCompliance(scene: THREE.Scene): StyleViolation[] {
  const violations: StyleViolation[] = [];

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const material = object.material;

      if (Array.isArray(material)) {
        material.forEach((mat, index) => {
          checkMaterial(mat, object.name + `[${index}]`, violations);
        });
      } else if (material) {
        checkMaterial(material, object.name, violations);
      }
    }
  });

  return violations;
}

/**
 * Check if material is compliant with cel-shaded style
 */
function checkMaterial(
  material: THREE.Material,
  objectName: string,
  violations: StyleViolation[],
): void {
  // Check for default MeshBasicMaterial (flat grey)
  if (material instanceof THREE.MeshBasicMaterial && material.color.getHex() === 0xffffff) {
    violations.push({
      objectName,
      violationType: 'default_material',
      suggestion: 'Replace with createCelShadedMaterial()',
    });
    return;
  }

  // Check for realistic PBR materials (high metalness/roughness)
  if (material instanceof THREE.MeshStandardMaterial) {
    const isRealistic = material.metalness > 0.5 && material.roughness < 0.3;
    if (isRealistic) {
      violations.push({
        objectName,
        violationType: 'realistic_pbr',
        suggestion:
          'Replace with cel-shaded material (animeToonMaterial or createCelShadedMaterial)',
      });
      return;
    }
  }

  // Check if material is a ShaderMaterial (likely cel-shaded)
  if (material instanceof THREE.ShaderMaterial) {
    // Shader materials are likely cel-shaded, so compliant
    return;
  }

  // Other materials might not be cel-shaded
  if (
    !(material instanceof THREE.ShaderMaterial) &&
    !(material instanceof THREE.MeshStandardMaterial && material.metalness < 0.3)
  ) {
    violations.push({
      objectName,
      violationType: 'non_cel_shaded',
      suggestion: 'Consider using cel-shaded material pipeline',
    });
  }
}

/**
 * Log violations (development only)
 */
export function logStyleViolations(violations: StyleViolation[]): void {
  if (violations.length === 0) {
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(`Found ${violations.length} visual style violations:`);
    violations.forEach((violation) => {
      console.warn(`  - ${violation.objectName}: ${violation.violationType}`);
      console.warn(`    Suggestion: ${violation.suggestion}`);
    });
  }
}
