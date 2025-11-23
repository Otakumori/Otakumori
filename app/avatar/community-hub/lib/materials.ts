/**
 * Material system for cel shading and outline rendering
 * Creates anime-style toon materials with rim lighting
 */

import * as THREE from 'three';

/**
 * Create a gradient texture for toon shading
 */
function createGradientTexture(steps: number = 4): THREE.Texture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 1;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  const gradient = context.createLinearGradient(0, 0, size, 0);
  const stepSize = 1 / steps;

  for (let i = 0; i <= steps; i++) {
    const pos = i * stepSize;
    const intensity = Math.floor((i / steps) * 255);
    gradient.addColorStop(pos, `rgb(${intensity}, ${intensity}, ${intensity})`);
  }

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Create cel-shaded material with toon shading
 */
export function createCelShadedMaterial(
  color: THREE.Color | number | string,
  options: {
    toonSteps?: number;
    rimLight?: boolean;
    rimColor?: THREE.Color | number | string;
    rimIntensity?: number;
    gloss?: number;
  } = {},
): THREE.MeshToonMaterial {
  const {
    toonSteps = 4,
    rimLight = true,
    rimColor = new THREE.Color(0xffffff),
    rimIntensity = 0.5,
  } = options;

  const material = new THREE.MeshToonMaterial({
    color: typeof color === 'string' || typeof color === 'number' ? color : color.getHex(),
    gradientMap: createGradientTexture(toonSteps),
  });

  // Store rim light properties for custom shader if needed
  material.userData.rimLight = rimLight;
  material.userData.rimColor = rimColor instanceof THREE.Color ? rimColor.getHex() : rimColor;
  material.userData.rimIntensity = rimIntensity;

  return material;
}

/**
 * Create outline material (black, back-facing)
 */
export function createOutlineMaterial(
  _outlineWidth: number = 0.02,
  outlineColor: THREE.Color | number | string = 0x000000,
): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: typeof outlineColor === 'string' || typeof outlineColor === 'number'
      ? outlineColor
      : outlineColor.getHex(),
    side: THREE.BackSide,
  });
}

/**
 * Apply materials to a mesh based on its userData
 */
export function applyMaterialToMesh(mesh: THREE.Mesh, config: {
  skinTone?: string;
  hairRootColor?: string;
  hairTipColor?: string;
  hairGloss?: number;
  outfitPrimaryColor?: string;
  outfitSecondaryColor?: string;
}): void {
  if (!mesh.material) return;

  // Determine material type from userData
  if (mesh.userData.isBodyPart) {
    const skinColor = config.skinTone || '#FFDBAC';
    const newMaterial = createCelShadedMaterial(skinColor, {
      toonSteps: 4,
      rimLight: true,
      rimIntensity: 0.3,
      gloss: 0.3,
    });
    mesh.material = newMaterial;
  } else if (mesh.userData.hairColor !== undefined) {
    const hairColor = mesh.userData.hairColor;
    const gloss = mesh.userData.gloss !== undefined ? mesh.userData.gloss : 0.5;
    const newMaterial = createCelShadedMaterial(hairColor, {
      toonSteps: 3,
      rimLight: true,
      rimIntensity: 0.4,
      gloss: gloss,
    });
    mesh.material = newMaterial;
  } else if (mesh.userData.outfitColor !== undefined) {
    const outfitColor = mesh.userData.outfitColor;
    const newMaterial = createCelShadedMaterial(outfitColor, {
      toonSteps: 3,
      rimLight: true,
      rimIntensity: 0.2,
      gloss: 0.2,
    });
    mesh.material = newMaterial;
  } else if (mesh.userData.accessoryColor !== undefined) {
    const accessoryColor = mesh.userData.accessoryColor;
    const newMaterial = createCelShadedMaterial(accessoryColor, {
      toonSteps: 3,
      rimLight: true,
      rimIntensity: 0.3,
      gloss: 0.4,
    });
    mesh.material = newMaterial;
  } else {
    // Default material
    const newMaterial = createCelShadedMaterial(0xffffff, {
      toonSteps: 4,
      rimLight: true,
      rimIntensity: 0.3,
      gloss: 0.5,
    });
    mesh.material = newMaterial;
  }
}

/**
 * Create outline mesh for a given mesh
 */
export function createOutlineMesh(
  originalMesh: THREE.Mesh,
  outlineWidth: number = 0.02,
  outlineColor: THREE.Color | number | string = 0x000000,
): THREE.Mesh {
  const outlineMaterial = createOutlineMaterial(outlineWidth, outlineColor);
  const outlineMesh = originalMesh.clone();
  outlineMesh.material = outlineMaterial;
  outlineMesh.scale.multiplyScalar(1 + outlineWidth);
  outlineMesh.renderOrder = -1; // Render behind original
  return outlineMesh;
}

/**
 * Apply materials to entire group recursively
 */
export function applyMaterialsToGroup(
  group: THREE.Group,
  config: {
    skinTone?: string;
    hairRootColor?: string;
    hairTipColor?: string;
    hairGloss?: number;
    outfitPrimaryColor?: string;
    outfitSecondaryColor?: string;
  },
): void {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Update userData colors if needed
      if (child.userData.isBodyPart && config.skinTone) {
        child.userData.skinColor = new THREE.Color(config.skinTone).getHex();
      }
      if (child.userData.hairColor !== undefined && config.hairRootColor) {
        child.userData.hairColor = new THREE.Color(config.hairRootColor).getHex();
      }
      if (child.userData.outfitColor !== undefined) {
        // Determine if primary or secondary based on position or name
        const isPrimary = child.position.y > 1.0;
        const color = isPrimary ? config.outfitPrimaryColor : config.outfitSecondaryColor;
        if (color) {
          child.userData.outfitColor = new THREE.Color(color).getHex();
        }
      }

      applyMaterialToMesh(child, config);
    }
  });
}

/**
 * Create rim lighting effect (post-processing style, but we'll use material properties)
 */
export function createRimLightingMaterial(
  baseColor: THREE.Color | number | string,
  rimColor: THREE.Color | number | string = 0xffffff,
  rimIntensity: number = 0.5,
): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: typeof baseColor === 'string' || typeof baseColor === 'number'
      ? baseColor
      : baseColor.getHex(),
    metalness: 0.1,
    roughness: 0.8,
  });

  // Store rim properties for potential shader enhancement
  material.userData.rimColor = rimColor instanceof THREE.Color ? rimColor.getHex() : rimColor;
  material.userData.rimIntensity = rimIntensity;

  return material;
}

