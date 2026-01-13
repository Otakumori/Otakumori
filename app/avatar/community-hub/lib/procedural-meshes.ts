/**
 * Procedural mesh generation for avatar parts
 * Uses Three.js primitives to construct stylized anime-style characters
 */

import { logger } from '@/app/lib/logger';
import * as THREE from 'three';
import type { CharacterConfig } from './character-state';

/**
 * Generate base humanoid body from primitives
 */
export function generateBaseBody(config: CharacterConfig): THREE.Group {
  try {
    const group = new THREE.Group();
    group.name = 'BaseBody';

    const { physique, skinTone, gender } = config;
    const skinColor = new THREE.Color(skinTone);

    // Head - Sphere
    const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const headMesh = new THREE.Mesh(headGeometry);
    headMesh.position.set(0, 1.5 + physique.height * 0.2, 0);
    headMesh.scale.set(1, 1, 1);
    headMesh.name = 'Head';
    group.add(headMesh);

    // Torso - Cylinder
    const torsoHeight = 0.4 + physique.height * 0.2;
    const torsoRadius = 0.12 + physique.width * 0.1;
    const torsoGeometry = new THREE.CylinderGeometry(torsoRadius, torsoRadius * 0.9, torsoHeight, 16);
    const torsoMesh = new THREE.Mesh(torsoGeometry);
    torsoMesh.position.set(0, 1.2 + physique.height * 0.1, 0);
    torsoMesh.name = 'Torso';
    group.add(torsoMesh);

    // Adjust torso for gender
    if (gender === 'female') {
      torsoMesh.scale.set(1, 1, 0.9 + physique.bust * 0.2);
    }

    // Left Arm
    const armLength = 0.35 + physique.height * 0.1;
    const armRadius = 0.04;
    const leftArmGeometry = new THREE.CylinderGeometry(armRadius, armRadius * 0.8, armLength, 8);
    const leftArmMesh = new THREE.Mesh(leftArmGeometry);
    leftArmMesh.position.set(-(torsoRadius + armLength / 2), 1.2 + physique.height * 0.1, 0);
    leftArmMesh.rotation.z = Math.PI / 2;
    leftArmMesh.name = 'LeftArm';
    group.add(leftArmMesh);

    // Right Arm
    const rightArmGeometry = new THREE.CylinderGeometry(armRadius, armRadius * 0.8, armLength, 8);
    const rightArmMesh = new THREE.Mesh(rightArmGeometry);
    rightArmMesh.position.set(torsoRadius + armLength / 2, 1.2 + physique.height * 0.1, 0);
    rightArmMesh.rotation.z = -Math.PI / 2;
    rightArmMesh.name = 'RightArm';
    group.add(rightArmMesh);

    // Left Leg
    const legLength = 0.4 + physique.height * 0.15;
    const legRadius = 0.05;
    const leftLegGeometry = new THREE.CylinderGeometry(legRadius, legRadius * 0.9, legLength, 8);
    const leftLegMesh = new THREE.Mesh(leftLegGeometry);
    leftLegMesh.position.set(-torsoRadius * 0.6, 0.8 - legLength / 2, 0);
    leftLegMesh.name = 'LeftLeg';
    group.add(leftLegMesh);

    // Right Leg
    const rightLegGeometry = new THREE.CylinderGeometry(legRadius, legRadius * 0.9, legLength, 8);
    const rightLegMesh = new THREE.Mesh(rightLegGeometry);
    rightLegMesh.position.set(torsoRadius * 0.6, 0.8 - legLength / 2, 0);
    rightLegMesh.name = 'RightLeg';
    group.add(rightLegMesh);

    // Apply skin color to all meshes
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData.isBodyPart = true;
        child.userData.skinColor = skinColor.getHex();
      }
    });

    return group;
  } catch (error) {
    logger.warn('Failed to generate base body, using fallback:', undefined, { value: error });
    return createFallbackBody();
  }
}

/**
 * Generate hairstyle procedurally
 */
export function generateHair(config: CharacterConfig): THREE.Group {
  try {
    const group = new THREE.Group();
    group.name = 'Hair';

    const { hair } = config;
    const rootColor = new THREE.Color(hair.rootColor);
    const tipColor = new THREE.Color(hair.tipColor);

    switch (hair.style) {
      case 'short':
        generateShortHair(group, rootColor, tipColor, hair.gloss);
        break;
      case 'long':
        generateLongHair(group, rootColor, tipColor, hair.gloss);
        break;
      case 'twin-tails':
        generateTwinTailsHair(group, rootColor, tipColor, hair.gloss);
        break;
      case 'ponytail':
        generatePonytailHair(group, rootColor, tipColor, hair.gloss);
        break;
      case 'bob':
        generateBobHair(group, rootColor, tipColor, hair.gloss);
        break;
      case 'messy':
        generateMessyHair(group, rootColor, tipColor, hair.gloss);
        break;
      default:
        generateShortHair(group, rootColor, tipColor, hair.gloss);
    }

    return group;
  } catch (error) {
    logger.warn('Failed to generate hair, using fallback:', undefined, { value: error });
    return createFallbackHair();
  }
}

function generateShortHair(
  group: THREE.Group,
  rootColor: THREE.Color,
  tipColor: THREE.Color,
  gloss: number,
) {
  // Short hair - simple cap-like geometry
  const hairGeometry = new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const hairMesh = new THREE.Mesh(hairGeometry);
  hairMesh.position.set(0, 1.6, 0);
  hairMesh.scale.set(1, 0.6, 1);
  hairMesh.userData.hairColor = rootColor.getHex();
  hairMesh.userData.gloss = gloss;
  group.add(hairMesh);
}

function generateLongHair(
  group: THREE.Group,
  rootColor: THREE.Color,
  tipColor: THREE.Color,
  gloss: number,
) {
  // Long hair - multiple strands
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const strandGeometry = new THREE.CylinderGeometry(0.02, 0.015, 0.4, 6);
    const strandMesh = new THREE.Mesh(strandGeometry);
    strandMesh.position.set(
      Math.cos(angle) * 0.12,
      1.4 - 0.2,
      Math.sin(angle) * 0.12,
    );
    strandMesh.rotation.z = Math.cos(angle) * 0.2;
    strandMesh.userData.hairColor = rootColor.getHex();
    strandMesh.userData.gloss = gloss;
    group.add(strandMesh);
  }
}

function generateTwinTailsHair(
  group: THREE.Group,
  rootColor: THREE.Color,
  tipColor: THREE.Color,
  gloss: number,
) {
  // Twin tails - two ponytails on sides
  for (let side = -1; side <= 1; side += 2) {
    const tailGroup = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const baseMesh = new THREE.Mesh(baseGeometry);
    baseMesh.position.set(side * 0.1, 1.6, 0);
    baseMesh.scale.set(0.8, 0.5, 0.8);
    baseMesh.userData.hairColor = rootColor.getHex();
    baseMesh.userData.gloss = gloss;
    tailGroup.add(baseMesh);

    // Tail strands
    for (let i = 0; i < 4; i++) {
      const strandGeometry = new THREE.CylinderGeometry(0.015, 0.01, 0.5, 6);
      const strandMesh = new THREE.Mesh(strandGeometry);
      strandMesh.position.set(
        side * 0.12 + (i - 1.5) * 0.02,
        1.2,
        0,
      );
      strandMesh.userData.hairColor = tipColor.getHex();
      strandMesh.userData.gloss = gloss;
      tailGroup.add(strandMesh);
    }

    group.add(tailGroup);
  }
}

function generatePonytailHair(
  group: THREE.Group,
  rootColor: THREE.Color,
  tipColor: THREE.Color,
  gloss: number,
) {
  // Base cap
  const baseGeometry = new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const baseMesh = new THREE.Mesh(baseGeometry);
  baseMesh.position.set(0, 1.6, 0);
  baseMesh.scale.set(1, 0.6, 1);
  baseMesh.userData.hairColor = rootColor.getHex();
  baseMesh.userData.gloss = gloss;
  group.add(baseMesh);

  // Ponytail
  for (let i = 0; i < 6; i++) {
    const strandGeometry = new THREE.CylinderGeometry(0.015, 0.01, 0.45, 6);
    const strandMesh = new THREE.Mesh(strandGeometry);
    strandMesh.position.set((i - 2.5) * 0.02, 1.15, 0.1);
    strandMesh.rotation.x = -0.3;
    strandMesh.userData.hairColor = tipColor.getHex();
    strandMesh.userData.gloss = gloss;
    group.add(strandMesh);
  }
}

function generateBobHair(
  group: THREE.Group,
  rootColor: THREE.Color,
  tipColor: THREE.Color,
  gloss: number,
) {
  // Bob cut - rounded cap with slight extension
  const hairGeometry = new THREE.SphereGeometry(0.19, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.2);
  const hairMesh = new THREE.Mesh(hairGeometry);
  hairMesh.position.set(0, 1.55, 0);
  hairMesh.scale.set(1, 0.7, 1);
  hairMesh.userData.hairColor = rootColor.getHex();
  hairMesh.userData.gloss = gloss;
  group.add(hairMesh);
}

function generateMessyHair(
  group: THREE.Group,
  rootColor: THREE.Color,
  tipColor: THREE.Color,
  gloss: number,
) {
  // Messy hair - irregular strands
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const length = 0.25 + Math.random() * 0.15;
    const strandGeometry = new THREE.CylinderGeometry(0.018, 0.012, length, 6);
    const strandMesh = new THREE.Mesh(strandGeometry);
    strandMesh.position.set(
      Math.cos(angle) * (0.1 + Math.random() * 0.05),
      1.5 + Math.random() * 0.1,
      Math.sin(angle) * (0.1 + Math.random() * 0.05),
    );
    strandMesh.rotation.set(
      (Math.random() - 0.5) * 0.5,
      angle + (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3,
    );
    strandMesh.userData.hairColor = rootColor.getHex();
    strandMesh.userData.gloss = gloss * 0.7; // Less gloss for messy
    group.add(strandMesh);
  }
}

/**
 * Generate outfit procedurally
 */
export function generateOutfit(config: CharacterConfig): THREE.Group {
  try {
    const group = new THREE.Group();
    group.name = 'Outfit';

    const { outfit, physique, gender } = config;
    const primaryColor = new THREE.Color(outfit.primaryColor);
    const secondaryColor = new THREE.Color(outfit.secondaryColor);

    switch (outfit.id) {
      case 'casual':
        generateCasualOutfit(group, primaryColor, secondaryColor, physique, gender);
        break;
      case 'school':
        generateSchoolOutfit(group, primaryColor, secondaryColor, physique, gender);
        break;
      case 'dress':
        generateDressOutfit(group, primaryColor, secondaryColor, physique, gender);
        break;
      case 'sporty':
        generateSportyOutfit(group, primaryColor, secondaryColor, physique, gender);
        break;
      default:
        generateCasualOutfit(group, primaryColor, secondaryColor, physique, gender);
    }

    return group;
  } catch (error) {
    logger.warn('Failed to generate outfit, using fallback:', undefined, { value: error });
    return createFallbackOutfit();
  }
}

function generateCasualOutfit(
  group: THREE.Group,
  primaryColor: THREE.Color,
  secondaryColor: THREE.Color,
  _physique: CharacterConfig['physique'],
  _gender: string,
) {
  // Simple shirt/top
  const topGeometry = new THREE.CylinderGeometry(0.13, 0.12, 0.35, 16);
  const topMesh = new THREE.Mesh(topGeometry);
  topMesh.position.set(0, 1.25, 0);
  topMesh.userData.outfitColor = primaryColor.getHex();
  group.add(topMesh);

  // Pants/skirt
  const bottomGeometry = new THREE.CylinderGeometry(0.12, 0.11, 0.3, 16);
  const bottomMesh = new THREE.Mesh(bottomGeometry);
  bottomMesh.position.set(0, 0.95, 0);
  bottomMesh.userData.outfitColor = secondaryColor.getHex();
  group.add(bottomMesh);
}

function generateSchoolOutfit(
  group: THREE.Group,
  primaryColor: THREE.Color,
  secondaryColor: THREE.Color,
  _physique: CharacterConfig['physique'],
  gender: string,
) {
  // School uniform - blazer and skirt/pants
  const blazerGeometry = new THREE.CylinderGeometry(0.14, 0.13, 0.4, 16);
  const blazerMesh = new THREE.Mesh(blazerGeometry);
  blazerMesh.position.set(0, 1.3, 0);
  blazerMesh.userData.outfitColor = primaryColor.getHex();
  group.add(blazerMesh);

  // Shirt underneath
  const shirtGeometry = new THREE.CylinderGeometry(0.12, 0.11, 0.25, 16);
  const shirtMesh = new THREE.Mesh(shirtGeometry);
  shirtMesh.position.set(0, 1.15, 0.01);
  shirtMesh.userData.outfitColor = secondaryColor.getHex();
  group.add(shirtMesh);

  // Skirt or pants
  if (gender === 'female') {
    const skirtGeometry = new THREE.ConeGeometry(0.12, 0.25, 16);
    const skirtMesh = new THREE.Mesh(skirtGeometry);
    skirtMesh.position.set(0, 0.9, 0);
    skirtMesh.rotation.x = Math.PI;
    skirtMesh.userData.outfitColor = primaryColor.getHex();
    group.add(skirtMesh);
  } else {
    const pantsGeometry = new THREE.CylinderGeometry(0.11, 0.1, 0.3, 16);
    const pantsMesh = new THREE.Mesh(pantsGeometry);
    pantsMesh.position.set(0, 0.95, 0);
    pantsMesh.userData.outfitColor = primaryColor.getHex();
    group.add(pantsMesh);
  }
}

function generateDressOutfit(
  group: THREE.Group,
  primaryColor: THREE.Color,
  secondaryColor: THREE.Color,
  _physique: CharacterConfig['physique'],
  _gender: string,
) {
  // Dress - single piece
  const dressTopGeometry = new THREE.CylinderGeometry(0.13, 0.12, 0.25, 16);
  const dressTopMesh = new THREE.Mesh(dressTopGeometry);
  dressTopMesh.position.set(0, 1.2, 0);
  dressTopMesh.userData.outfitColor = primaryColor.getHex();
  group.add(dressTopMesh);

  const dressBottomGeometry = new THREE.ConeGeometry(0.13, 0.4, 16);
  const dressBottomMesh = new THREE.Mesh(dressBottomGeometry);
  dressBottomMesh.position.set(0, 0.85, 0);
  dressBottomMesh.rotation.x = Math.PI;
  dressBottomMesh.userData.outfitColor = secondaryColor.getHex();
  group.add(dressBottomMesh);
}

function generateSportyOutfit(
  group: THREE.Group,
  primaryColor: THREE.Color,
  secondaryColor: THREE.Color,
  _physique: CharacterConfig['physique'],
  _gender: string,
) {
  // Sporty - tank top and shorts
  const topGeometry = new THREE.CylinderGeometry(0.12, 0.11, 0.3, 16);
  const topMesh = new THREE.Mesh(topGeometry);
  topMesh.position.set(0, 1.2, 0);
  topMesh.userData.outfitColor = primaryColor.getHex();
  group.add(topMesh);

  const shortsGeometry = new THREE.CylinderGeometry(0.11, 0.1, 0.2, 16);
  const shortsMesh = new THREE.Mesh(shortsGeometry);
  shortsMesh.position.set(0, 0.9, 0);
  shortsMesh.userData.outfitColor = secondaryColor.getHex();
  group.add(shortsMesh);
}

/**
 * Generate accessory
 */
export function generateAccessory(
  id: string,
  position: [number, number, number],
  rotation: [number, number, number],
  scale: number,
): THREE.Group {
  try {
    const group = new THREE.Group();
    group.name = `Accessory_${id}`;
    group.position.set(...position);
    group.rotation.set(...rotation);
    group.scale.set(scale, scale, scale);

    switch (id) {
      case 'horn_01':
      case 'horn_02': {
        const hornSize = id === 'horn_02' ? 0.15 : 0.1;
        const hornGeometry = new THREE.ConeGeometry(0.03, hornSize, 8);
        const hornMesh = new THREE.Mesh(hornGeometry);
        hornMesh.position.set(0, hornSize / 2, 0);
        hornMesh.userData.accessoryColor = 0x888888;
        group.add(hornMesh);
        break;
      }
      case 'tail_01':
      case 'tail_02': {
        const tailLength = id === 'tail_02' ? 0.4 : 0.25;
        const tailGeometry = new THREE.CylinderGeometry(0.04, 0.02, tailLength, 8);
        const tailMesh = new THREE.Mesh(tailGeometry);
        tailMesh.position.set(0, -tailLength / 2, 0);
        tailMesh.userData.accessoryColor = 0x654321;
        group.add(tailMesh);
        break;
      }
      case 'goggles': {
        const gogglesGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
        const gogglesMesh = new THREE.Mesh(gogglesGeometry);
        gogglesMesh.userData.accessoryColor = 0x000000;
        group.add(gogglesMesh);
        break;
      }
      case 'mask': {
        const maskGeometry = new THREE.BoxGeometry(0.12, 0.08, 0.02);
        const maskMesh = new THREE.Mesh(maskGeometry);
        maskMesh.userData.accessoryColor = 0x333333;
        group.add(maskMesh);
        break;
      }
      default:
        // Fallback - simple box
        const fallbackGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const fallbackMesh = new THREE.Mesh(fallbackGeometry);
        fallbackMesh.userData.accessoryColor = 0x666666;
        group.add(fallbackMesh);
    }

    return group;
  } catch (error) {
    logger.warn(`Failed to generate accessory ${id}, using fallback:`, undefined, { error: error instanceof Error ? error : new Error(String(error)) });
    return createFallbackAccessory(position, rotation, scale);
  }
}

// Fallback functions
function createFallbackBody(): THREE.Group {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(0.3, 1.5, 0.3);
  const mesh = new THREE.Mesh(geometry);
  mesh.position.y = 0.75;
  mesh.userData.isBodyPart = true;
  mesh.userData.skinColor = 0xffdbac;
  group.add(mesh);
  return group;
}

function createFallbackHair(): THREE.Group {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(0.15, 8, 8);
  const mesh = new THREE.Mesh(geometry);
  mesh.position.set(0, 1.6, 0);
  mesh.userData.hairColor = 0xff66cc;
  group.add(mesh);
  return group;
}

function createFallbackOutfit(): THREE.Group {
  const group = new THREE.Group();
  const geometry = new THREE.CylinderGeometry(0.12, 0.11, 0.6, 8);
  const mesh = new THREE.Mesh(geometry);
  mesh.position.y = 1.0;
  mesh.userData.outfitColor = 0x1c1c1c;
  group.add(mesh);
  return group;
}

function createFallbackAccessory(
  position: [number, number, number],
  rotation: [number, number, number],
  scale: number,
): THREE.Group {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const mesh = new THREE.Mesh(geometry);
  mesh.userData.accessoryColor = 0x666666;
  group.add(mesh);
  group.position.set(...position);
  group.rotation.set(...rotation);
  group.scale.set(scale, scale, scale);
  return group;
}

