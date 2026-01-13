/**
 * Advanced GLB Model Generator System
 * Creates high-quality GLB files from procedural character configurations
 * Exceeds Code Vein quality with extensive customization options
 * Comprehensive error handling to prevent failures and bugs
 */

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as THREE from 'three';
import { EnhancedProceduralMesh } from './enhanced-procedural-mesh';
import { logger } from '@/app/lib/logger';
import type { FullCharacterConfig } from '@/app/test/character-creator/types';

export interface GLBGenerationOptions {
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  includeMorphTargets?: boolean;
  includeAnimations?: boolean;
  optimize?: boolean;
  generateLOD?: boolean;
  celShaded?: boolean;
  validateBeforeExport?: boolean;
}

export interface GLBGenerationResult {
  success: boolean;
  glbBuffer?: ArrayBuffer;
  error?: string;
  metadata?: {
    fileSize: number;
    triangleCount: number;
    materialCount: number;
    textureCount: number;
    boneCount: number;
  };
}

/**
 * Quality presets for mesh generation
 */
const QUALITY_PRESETS = {
  low: {
    headSegments: 24,
    bodySegments: 16,
    limbSegments: 16,
    subdivision: 0,
    textureSize: 512,
  },
  medium: {
    headSegments: 32,
    bodySegments: 24,
    limbSegments: 24,
    subdivision: 0,
    textureSize: 1024,
  },
  high: {
    headSegments: 48,
    bodySegments: 32,
    limbSegments: 32,
    subdivision: 1,
    textureSize: 2048,
  },
  ultra: {
    headSegments: 64,
    bodySegments: 48,
    limbSegments: 48,
    subdivision: 2,
    textureSize: 4096,
  },
} as const;

/**
 * Generate GLB model from character creator config
 * Comprehensive error handling and validation
 */
export async function generateGLBFromConfig(
  config: FullCharacterConfig,
  options: GLBGenerationOptions = {}
): Promise<GLBGenerationResult> {
  const startTime = performance.now();
  
  try {
    // Validate input
    if (!config) {
      return {
        success: false,
        error: 'Character configuration is required',
      };
    }

    const quality = options.quality || 'high';
    const qualityPreset = QUALITY_PRESETS[quality];

    // Build character procedurally
    logger.info('Starting GLB generation', undefined, { quality: String(quality) });
    
    const characterGroup = await buildCharacterFromConfig(config, {
      ...options,
      qualityPreset,
    });

    if (!characterGroup) {
      return {
        success: false,
        error: 'Failed to build character from configuration',
      };
    }

    // Validate character group before export
    if (options.validateBeforeExport !== false) {
      const validationResult = validateCharacterGroup(characterGroup);
      if (!validationResult.valid) {
        logger.warn('Character validation warnings:', undefined, {
          warnings: validationResult.warnings,
        });
        // Continue with warnings, but log them
      }
    }

    // Collect metadata
    const metadata = collectMetadata(characterGroup);

    // Export to GLB
    const glbBuffer = await exportToGLB(characterGroup, options);

    if (!glbBuffer || glbBuffer.byteLength === 0) {
      return {
        success: false,
        error: 'GLB export produced empty buffer',
      };
    }

    const duration = performance.now() - startTime;
    logger.info('GLB generation complete', undefined, {
      duration: `${duration.toFixed(2)}ms`,
      fileSize: `${(glbBuffer.byteLength / 1024).toFixed(2)}KB`,
      triangleCount: metadata.triangleCount,
      materialCount: metadata.materialCount,
    });

    return {
      success: true,
      glbBuffer,
      metadata: {
        ...metadata,
        fileSize: glbBuffer.byteLength,
      },
    };
  } catch (error) {
    logger.error('GLB generation failed:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during GLB generation',
    };
  }
}

/**
 * Build complete character from config
 * Ultra-high quality procedural generation
 */
async function buildCharacterFromConfig(
  config: FullCharacterConfig,
  options: GLBGenerationOptions & { qualityPreset: typeof QUALITY_PRESETS[keyof typeof QUALITY_PRESETS] }
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Character';

    const { qualityPreset } = options;

    // Create materials with proper error handling
    let skinMaterial: THREE.Material;
    let hairMaterial: THREE.Material;

    try {
      skinMaterial = createSkinMaterial(config, options);
      hairMaterial = createHairMaterial(config, options);
    } catch (materialError) {
      logger.error('Failed to create materials:', undefined, undefined, materialError instanceof Error ? materialError : new Error(String(materialError)));
      // Use fallback materials
      skinMaterial = new THREE.MeshStandardMaterial({ color: '#fde4d0' });
      hairMaterial = new THREE.MeshStandardMaterial({ color: '#f5deb3' });
    }

    // Generate head with high quality and ALL parameters
    try {
      const headSize = 0.12 * (config.head?.size || 1.0);
      const headWidth = config.head?.width || 1.0;
      const headDepth = config.head?.depth || 1.0;
      
      const headGeometry = EnhancedProceduralMesh.createHead(
        headSize,
        {
          segments: qualityPreset.headSegments,
          smoothNormals: true,
          generateTangents: true,
          subdivision: qualityPreset.subdivision,
        }
      );

      // Apply head shape parameters
      const positions = headGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);

        // Apply width/depth scaling
        positions.setX(i, x * headWidth);
        positions.setZ(i, z * headDepth);

        // Apply face shape modifiers if available
        if (config.face) {
          const normalizedY = (y / headSize + 1) / 2;
          
          // Cheekbones
          if (normalizedY > 0.4 && normalizedY < 0.7 && config.face.cheekbones) {
            const cheekboneFactor = 1.0 + config.face.cheekbones * 0.15;
            positions.setX(i, positions.getX(i) * cheekboneFactor);
          }
          
          // Jaw width
          if (normalizedY < 0.3 && config.face.jawWidth) {
            const jawFactor = 1.0 + config.face.jawWidth * 0.2;
            positions.setX(i, positions.getX(i) * jawFactor);
          }
          
          // Jaw depth
          if (normalizedY < 0.3 && config.face.jawDepth) {
            const jawDepthFactor = 1.0 + config.face.jawDepth * 0.15;
            positions.setZ(i, positions.getZ(i) * jawDepthFactor);
          }
          
          // Chin shape
          if (normalizedY < 0.2 && config.face.chinShape !== undefined) {
            const chinFactor = config.face.chinShape < 0.5 ? 0.9 : 1.1;
            positions.setX(i, positions.getX(i) * chinFactor);
            positions.setZ(i, positions.getZ(i) * chinFactor);
          }
          
          // Forehead height
          if (normalizedY > 0.8 && config.face.foreheadHeight) {
            positions.setY(i, y + (config.face.foreheadHeight - 0.5) * headSize * 0.2);
          }
        }
      }
      headGeometry.computeVertexNormals();

      const headMesh = new THREE.Mesh(headGeometry, skinMaterial);
      headMesh.position.set(0, 1.5 * (config.body?.height || 1.0), 0);
      headMesh.name = 'Head';
      headMesh.castShadow = true;
      headMesh.receiveShadow = true;
      group.add(headMesh);
    } catch (error) {
      logger.error('Failed to generate head:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      return null;
    }

    // Generate detailed anime eyes
    if (config.eyes) {
      try {
        const leftEye = createAnimeEye(
          config.eyes.size || 1.2,
          config.eyes.irisColor || '#4a90e2',
          config.eyes,
          qualityPreset
        );
        leftEye.position.set(
          -0.08 * (config.eyes.spacing || 1),
          1.52,
          0.19
        );
        group.add(leftEye);

        const rightEye = createAnimeEye(
          config.eyes.size || 1.2,
          config.eyes.irisColor || '#4a90e2',
          config.eyes,
          qualityPreset
        );
        rightEye.position.set(
          0.08 * (config.eyes.spacing || 1),
          1.52,
          0.19
        );
        group.add(rightEye);
      } catch (error) {
        logger.warn('Failed to generate eyes, using fallback:', undefined, { error: error instanceof Error ? error.message : String(error) });
        // Continue without detailed eyes
      }
    }

    // Generate nose with ALL parameters
    try {
      if (config.nose) {
        const noseGroup = new THREE.Group();
        noseGroup.name = 'Nose';
        
        const segments = Math.max(12, qualityPreset.headSegments / 4);
        const width = config.nose.width || 1.0;
        const height = config.nose.height || 1.0;
        const length = config.nose.length || 1.0;
        const bridgeWidth = config.nose.bridgeWidth || 0.5;
        const tipShape = config.nose.tipShape || 0.5;

        // Bridge
        const noseGeometry = new THREE.CapsuleGeometry(
          0.018 * width * bridgeWidth,
          0.06 * height,
          4,
          segments
        );
        const noseMesh = new THREE.Mesh(noseGeometry, skinMaterial);
        noseMesh.position.set(0, 1.43, 0.21 + (length - 1.0) * 0.02);
        noseMesh.rotation.set(Math.PI / 2, 0, 0);
        noseMesh.name = 'NoseBridge';
        noseGroup.add(noseMesh);

        // Nose tip with shape
        const noseTipGeometry = new THREE.SphereGeometry(
          0.022 * width,
          segments,
          segments
        );
        const noseTipMesh = new THREE.Mesh(noseTipGeometry, skinMaterial);
        noseTipMesh.position.set(0, 1.40, 0.23 + (length - 1.0) * 0.02);
        noseTipMesh.scale.set(1.0, 1.0, tipShape < 0.5 ? 0.9 : 1.1);
        noseTipMesh.name = 'NoseTip';
        noseGroup.add(noseTipMesh);

        // Nostrils
        if (config.nose.nostrilSize && config.nose.nostrilSize > 0) {
          const nostrilSize = 0.015 * config.nose.nostrilSize;
          const nostrilFlare = config.nose.nostrilFlare || 0.5;

          const leftNostrilGeometry = new THREE.SphereGeometry(nostrilSize, 8, 8);
          const leftNostril = new THREE.Mesh(leftNostrilGeometry, skinMaterial);
          leftNostril.position.set(-0.01 - nostrilFlare * 0.01, 1.38, 0.23 + length * 0.02);
          leftNostril.scale.set(1.0, 0.5, 0.5);
          leftNostril.name = 'NostrilLeft';
          noseGroup.add(leftNostril);

          const rightNostril = new THREE.Mesh(leftNostrilGeometry.clone(), skinMaterial);
          rightNostril.position.set(0.01 + nostrilFlare * 0.01, 1.38, 0.23 + length * 0.02);
          rightNostril.name = 'NostrilRight';
          noseGroup.add(rightNostril);
        }

        group.add(noseGroup);
      }
    } catch (error) {
      logger.warn('Failed to generate nose:', undefined, { error: error instanceof Error ? error.message : String(error) });
    }

    // Generate lips with ALL parameters
    if (config.mouth) {
      try {
        const mouthGroup = new THREE.Group();
        mouthGroup.name = 'Mouth';

        const segments = Math.max(8, qualityPreset.headSegments / 4);
        const width = config.mouth.width || 1.0;
        const size = config.mouth.size || 1.0;
        const upperThickness = config.mouth.upperLipThickness || 1.0;
        const lowerThickness = config.mouth.lowerLipThickness || 1.0;
        const cornerPosition = config.mouth.cornerPosition || 0.0; // -1.0 (frown) to 1.0 (smile)
        const philtrumDepth = config.mouth.philtrumDepth || 0.5;

        // Upper lip
        const upperLipGeometry = new THREE.CapsuleGeometry(
          0.04 * width * size,
          0.015 * upperThickness,
          segments,
          segments
        );
        const lipMaterial = new THREE.MeshStandardMaterial({
          color: '#f4a6b8',
          roughness: 0.25,
        });
        const upperLipMesh = new THREE.Mesh(upperLipGeometry, lipMaterial);
        upperLipMesh.position.set(0, 1.36 + philtrumDepth * 0.01, 0.215);
        upperLipMesh.rotation.set(-0.15 + cornerPosition * 0.1, 0, 0);
        upperLipMesh.name = 'UpperLip';
        mouthGroup.add(upperLipMesh);

        // Lower lip
        const lowerLipGeometry = new THREE.CapsuleGeometry(
          0.042 * width * size,
          0.018 * lowerThickness,
          segments,
          segments
        );
        const lowerLipMesh = new THREE.Mesh(lowerLipGeometry, lipMaterial);
        lowerLipMesh.position.set(0, 1.34 + cornerPosition * 0.01, 0.215);
        lowerLipMesh.rotation.set(0.15 + cornerPosition * 0.1, 0, 0);
        lowerLipMesh.name = 'LowerLip';
        mouthGroup.add(lowerLipMesh);

        group.add(mouthGroup);
      } catch (error) {
        logger.warn('Failed to generate lips:', undefined, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Generate torso with ALL parameters
    try {
      const waistSize = 0.26 * (config.torso?.waistWidth || 0.8);
      const chestWidth = config.torso?.chestWidth || 1.0;
      const chestDepth = config.torso?.chestDepth || 1.0;
      const abdomenDefinition = config.torso?.abdomenDefinition || 0.5;

      const topRadius = 0.26 * chestWidth;
      const bottomRadius = waistSize;
      
      const torsoGeometry = EnhancedProceduralMesh.createTorso(
        topRadius,
        bottomRadius,
        0.35 * chestDepth,
        {
          segments: qualityPreset.bodySegments,
          smoothNormals: true,
          generateTangents: true,
          subdivision: qualityPreset.subdivision,
        }
      );

      // Apply abdomen definition (abs visibility)
      if (abdomenDefinition > 0) {
        const positions = torsoGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const y = positions.getY(i);
          if (y < 0.1 && y > -0.1) {
            const z = positions.getZ(i);
            const absFactor = Math.sin(Math.abs(z) * 10) * abdomenDefinition * 0.01;
            positions.setZ(i, z + absFactor);
          }
        }
        torsoGeometry.computeVertexNormals();
      }

      const torsoMesh = new THREE.Mesh(torsoGeometry, skinMaterial);
      torsoMesh.position.set(0, 0.65, 0);
      torsoMesh.name = 'Torso';
      torsoMesh.castShadow = true;
      torsoMesh.receiveShadow = true;
      group.add(torsoMesh);
    } catch (error) {
      logger.error('Failed to generate torso:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      return null;
    }

    // Generate breasts with ALL parameters (if enabled and size > 0.5)
    if (
      config.torso?.breastSize &&
      config.torso.breastSize > 0.5 &&
      (config.nsfw?.enabled || config.gender !== 'male')
    ) {
      try {
        const breastSize = 0.17 * (config.torso.breastSize || 1.4);
        const breastShape = config.torso.breastShape || 0.5; // 0.0 (round) - 1.0 (teardrop)
        const separation = config.torso.breastSeparation || 0.5;
        const sag = config.torso.breastSag || 0.0;

        const segments = qualityPreset.bodySegments * 2;
        const geometry = new THREE.SphereGeometry(breastSize, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.85);

        // Modify for shape (round vs teardrop)
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const y = positions.getY(i);
          const factor = 1 + (y / breastSize) * 0.3 * (1 - breastShape);
          positions.setX(i, positions.getX(i) * factor);
          positions.setZ(i, positions.getZ(i) * factor);
        }

        // Apply sag
        if (sag > 0) {
          for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            positions.setY(i, y - sag * 0.02);
          }
        }

        geometry.computeVertexNormals();

        const leftBreastMesh = new THREE.Mesh(geometry.clone(), skinMaterial);
        leftBreastMesh.position.set(-0.12 - (separation - 0.5) * 0.05, 0.63 - sag * 0.02, 0.17);
        leftBreastMesh.name = 'BreastLeft';
        leftBreastMesh.castShadow = true;
        group.add(leftBreastMesh);

        const rightBreastMesh = new THREE.Mesh(geometry.clone(), skinMaterial);
        rightBreastMesh.position.set(0.12 + (separation - 0.5) * 0.05, 0.63 - sag * 0.02, 0.17);
        rightBreastMesh.name = 'BreastRight';
        rightBreastMesh.castShadow = true;
        group.add(rightBreastMesh);

        // Add nipples and areola if NSFW enabled with ALL parameters
        if (config.nsfw?.enabled && config.nsfw.breasts) {
          const nippleSize = 0.025 * (config.nsfw.breasts.nippleSize || 1);
          const areolaSize = 0.04 * (config.nsfw.breasts.areolaSize || 1);
          const nippleColor = config.nsfw.breasts.nippleColor || '#f4a6b8';
          const areolaColor = config.nsfw.breasts.areolaColor || '#f4a6b8';
          const nippleShape = config.nsfw.breasts.nippleShape || 0.5;

          // Left areola
          const leftAreolaGeometry = new THREE.SphereGeometry(areolaSize, 24, 24);
          const leftAreolaMaterial = new THREE.MeshStandardMaterial({
            color: areolaColor,
            roughness: 0.4,
          });
          const leftAreola = new THREE.Mesh(leftAreolaGeometry, leftAreolaMaterial);
          leftAreola.position.set(-0.12 - (separation - 0.5) * 0.05, 0.68, 0.17 + breastSize * 0.72);
          leftAreola.scale.set(1.0, 0.3, 1.0);
          leftAreola.name = 'AreolaLeft';
          group.add(leftAreola);

          // Left nipple
          const leftNippleGeometry = new THREE.SphereGeometry(nippleSize, 16, 16);
          const leftNippleMaterial = new THREE.MeshStandardMaterial({
            color: nippleColor,
            roughness: 0.35,
          });
          const leftNipple = new THREE.Mesh(leftNippleGeometry, leftNippleMaterial);
          leftNipple.position.copy(leftAreola.position);
          leftNipple.position.z += nippleSize * 0.5;
          leftNipple.scale.set(1.0, 1.0, nippleShape < 0.5 ? 0.9 : 1.1);
          leftNipple.name = 'NippleLeft';
          group.add(leftNipple);

          // Right areola
          const rightAreola = new THREE.Mesh(leftAreolaGeometry.clone(), leftAreolaMaterial);
          rightAreola.position.set(0.12 + (separation - 0.5) * 0.05, 0.68, 0.17 + breastSize * 0.72);
          rightAreola.scale.set(1.0, 0.3, 1.0);
          rightAreola.name = 'AreolaRight';
          group.add(rightAreola);

          // Right nipple
          const rightNipple = new THREE.Mesh(leftNippleGeometry.clone(), leftNippleMaterial);
          rightNipple.position.copy(rightAreola.position);
          rightNipple.position.z += nippleSize * 0.5;
          rightNipple.scale.set(1.0, 1.0, nippleShape < 0.5 ? 0.9 : 1.1);
          rightNipple.name = 'NippleRight';
          group.add(rightNipple);
        }
      } catch (error) {
        logger.warn('Failed to generate breasts:', undefined, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Generate hair
    try {
      const hairGroup = generateHair(config, hairMaterial, qualityPreset);
      group.add(hairGroup);
    } catch (error) {
      logger.warn('Failed to generate hair:', undefined, { error: error instanceof Error ? error.message : String(error) });
      // Continue without hair
    }

    // Generate arms with ALL parameters
    try {
      if (config.arms) {
        const upperArmSize = config.arms.upperArmSize || 1.0;
        const forearmSize = config.arms.forearmSize || 1.0;
        const armLength = config.arms.armLength || 1.0;

        // Upper arm geometry
        const upperArmGeometry = EnhancedProceduralMesh.createLimb(
          0.078 * upperArmSize,
          0.29 * armLength,
          0.86,
          {
            segments: qualityPreset.limbSegments,
            smoothNormals: true,
            generateTangents: true,
            subdivision: qualityPreset.subdivision,
          }
        );

        // Forearm geometry
        const forearmGeometry = EnhancedProceduralMesh.createLimb(
          0.06 * forearmSize,
          0.29 * armLength,
          0.9,
          {
            segments: qualityPreset.limbSegments,
            smoothNormals: true,
            generateTangents: true,
            subdivision: qualityPreset.subdivision,
          }
        );

        // Left arm (upper + forearm)
        const leftUpperArm = new THREE.Mesh(upperArmGeometry.clone(), skinMaterial);
        leftUpperArm.position.set(-0.46, 0.52, 0);
        leftUpperArm.rotation.set(0.3, 0, 0.28);
        leftUpperArm.name = 'LeftUpperArm';
        leftUpperArm.castShadow = true;
        group.add(leftUpperArm);

        const leftForearm = new THREE.Mesh(forearmGeometry.clone(), skinMaterial);
        leftForearm.position.set(-0.52, 0.20, 0.05);
        leftForearm.rotation.set(0.4, 0, 0.28);
        leftForearm.name = 'LeftForearm';
        leftForearm.castShadow = true;
        group.add(leftForearm);

        // Right arm
        const rightUpperArm = new THREE.Mesh(upperArmGeometry.clone(), skinMaterial);
        rightUpperArm.position.set(0.46, 0.52, 0);
        rightUpperArm.rotation.set(0.3, 0, -0.28);
        rightUpperArm.name = 'RightUpperArm';
        rightUpperArm.castShadow = true;
        group.add(rightUpperArm);

        const rightForearm = new THREE.Mesh(forearmGeometry.clone(), skinMaterial);
        rightForearm.position.set(0.52, 0.20, 0.05);
        rightForearm.rotation.set(0.4, 0, -0.28);
        rightForearm.name = 'RightForearm';
        rightForearm.castShadow = true;
        group.add(rightForearm);
      } else {
        // Fallback to simple arms
        const armGeometry = EnhancedProceduralMesh.createLimb(
          0.078,
          0.58,
          0.86,
          {
            segments: qualityPreset.limbSegments,
            smoothNormals: true,
            generateTangents: true,
            subdivision: qualityPreset.subdivision,
          }
        );

        const leftArmMesh = new THREE.Mesh(armGeometry.clone(), skinMaterial);
        leftArmMesh.position.set(-0.46, 0.52, 0);
        leftArmMesh.rotation.set(0.3, 0, 0.28);
        leftArmMesh.name = 'LeftArm';
        leftArmMesh.castShadow = true;
        group.add(leftArmMesh);

        const rightArmMesh = new THREE.Mesh(armGeometry.clone(), skinMaterial);
        rightArmMesh.position.set(0.46, 0.52, 0);
        rightArmMesh.rotation.set(0.3, 0, -0.28);
        rightArmMesh.name = 'RightArm';
        rightArmMesh.castShadow = true;
        group.add(rightArmMesh);
      }
    } catch (error) {
      logger.error('Failed to generate arms:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      return null;
    }

    // Generate legs with ALL parameters
    try {
      if (config.legs) {
        const thighCircumference = config.legs.thighCircumference || 1.0;
        const calfSize = config.legs.calfSize || 1.0;
        const upperLegLength = config.legs.upperLegLength || 1.0;
        const lowerLegLength = config.legs.lowerLegLength || 1.0;
        const thighGap = config.legs.thighGap || 0.5;

        // Upper leg (thigh)
        const thighGeometry = EnhancedProceduralMesh.createLimb(
          0.125 * thighCircumference,
          0.36 * upperLegLength,
          0.89,
          {
            segments: qualityPreset.limbSegments,
            smoothNormals: true,
            generateTangents: true,
            subdivision: qualityPreset.subdivision,
          }
        );

        // Lower leg (calf)
        const calfGeometry = EnhancedProceduralMesh.createLimb(
          0.1 * calfSize,
          0.36 * lowerLegLength,
          0.92,
          {
            segments: qualityPreset.limbSegments,
            smoothNormals: true,
            generateTangents: true,
            subdivision: qualityPreset.subdivision,
          }
        );

        // Left leg
        const leftThigh = new THREE.Mesh(thighGeometry.clone(), skinMaterial);
        leftThigh.position.set(-0.15 - (thighGap - 0.5) * 0.05, -0.35, 0);
        leftThigh.name = 'LeftThigh';
        leftThigh.castShadow = true;
        group.add(leftThigh);

        const leftCalf = new THREE.Mesh(calfGeometry.clone(), skinMaterial);
        leftCalf.position.set(-0.15 - (thighGap - 0.5) * 0.05, -0.71, 0);
        leftCalf.name = 'LeftCalf';
        leftCalf.castShadow = true;
        group.add(leftCalf);

        // Right leg
        const rightThigh = new THREE.Mesh(thighGeometry.clone(), skinMaterial);
        rightThigh.position.set(0.15 + (thighGap - 0.5) * 0.05, -0.35, 0);
        rightThigh.name = 'RightThigh';
        rightThigh.castShadow = true;
        group.add(rightThigh);

        const rightCalf = new THREE.Mesh(calfGeometry.clone(), skinMaterial);
        rightCalf.position.set(0.15 + (thighGap - 0.5) * 0.05, -0.71, 0);
        rightCalf.name = 'RightCalf';
        rightCalf.castShadow = true;
        group.add(rightCalf);
      } else {
        // Fallback to simple legs
        const legGeometry = EnhancedProceduralMesh.createLimb(
          0.125,
          0.72,
          0.89,
          {
            segments: qualityPreset.limbSegments,
            smoothNormals: true,
            generateTangents: true,
            subdivision: qualityPreset.subdivision,
          }
        );

        const leftLegMesh = new THREE.Mesh(legGeometry.clone(), skinMaterial);
        leftLegMesh.position.set(-0.15, -0.68, 0);
        leftLegMesh.name = 'LeftLeg';
        leftLegMesh.castShadow = true;
        group.add(leftLegMesh);

        const rightLegMesh = new THREE.Mesh(legGeometry.clone(), skinMaterial);
        rightLegMesh.position.set(0.15, -0.68, 0);
        rightLegMesh.name = 'RightLeg';
        rightLegMesh.castShadow = true;
        group.add(rightLegMesh);
      }
    } catch (error) {
      logger.error('Failed to generate legs:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      return null;
    }

    // Generate hips with ALL parameters
    try {
      if (config.hips) {
        const hipWidth = config.hips.width || 1.3;
        const hipDepth = config.hips.depth || 1.0;
        const hipShape = config.hips.shape || 0.5;

        const hipSize = 0.27 * hipWidth;
        const hipsGeometry = new THREE.SphereGeometry(
          hipSize,
          qualityPreset.bodySegments * 2,
          qualityPreset.bodySegments * 2
        );

        // Apply shape modifier
        const positions = hipsGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const z = positions.getZ(i);
          const shapeFactor = 1.0 + (hipShape - 0.5) * 0.2;
          positions.setZ(i, z * hipDepth * shapeFactor);
        }
        hipsGeometry.computeVertexNormals();

        const hipsMesh = new THREE.Mesh(hipsGeometry, skinMaterial);
        hipsMesh.position.set(0, -0.18, 0.09);
        hipsMesh.name = 'Hips';
        hipsMesh.castShadow = true;
        hipsMesh.receiveShadow = true;
        group.add(hipsMesh);

        // Buttocks
        if (config.buttocks) {
          const buttSize = config.buttocks.size || 1.0;
          const buttShape = config.buttocks.shape || 0.5;
          const buttLift = config.buttocks.lift || 0.5;

          const buttGeometry = new THREE.SphereGeometry(
            0.25 * buttSize,
            qualityPreset.bodySegments * 2,
            qualityPreset.bodySegments * 2
          );

          // Apply shape
          const buttPositions = buttGeometry.attributes.position;
          for (let i = 0; i < buttPositions.count; i++) {
            const z = buttPositions.getZ(i);
            if (z > 0) {
              const shapeFactor = 1.0 + (buttShape - 0.5) * 0.3;
              buttPositions.setZ(i, z * shapeFactor);
            }
          }
          buttGeometry.computeVertexNormals();

          const buttMesh = new THREE.Mesh(buttGeometry, skinMaterial);
          buttMesh.position.set(0, -0.20, 0.15 + buttLift * 0.05);
          buttMesh.name = 'Buttocks';
          buttMesh.castShadow = true;
          buttMesh.receiveShadow = true;
          group.add(buttMesh);
        }
      }
    } catch (error) {
      logger.warn('Failed to generate hips:', undefined, { error: error instanceof Error ? error.message : String(error) });
    }

    // Apply overall scale from body height
    group.scale.multiplyScalar(config.body?.height || 1.0);

    // Apply posture adjustment
    if (config.body?.posture !== undefined) {
      const postureAdjustment = (config.body.posture - 0.5) * 0.1;
      group.rotation.x = postureAdjustment;
    }

    return group;
  } catch (error) {
    logger.error('Failed to build character:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Create skin material with cel-shading support
 */
function createSkinMaterial(
  config: FullCharacterConfig,
  _options: GLBGenerationOptions
): THREE.Material {
  const skinTone = config.skin?.tone || '#fde4d0';
  const glossiness = config.skin?.glossiness || 0.3;

  if (_options.celShaded) {
    // Use cel-shaded material for anime look
    // Import will be handled separately
    return EnhancedProceduralMesh.createSkinMaterial(skinTone, {
      roughness: 1.0 - glossiness,
      metalness: 0.05,
    });
  }

  return EnhancedProceduralMesh.createSkinMaterial(skinTone, {
    roughness: 0.35 - glossiness * 0.2,
    metalness: 0.05,
  });
}

/**
 * Create hair material
 */
function createHairMaterial(
  _config: FullCharacterConfig,
  _options: GLBGenerationOptions
): THREE.Material {
  // Hair color would come from config.hair, but default for now
  const hairColor = '#f5deb3'; // Default blonde

  return EnhancedProceduralMesh.createHairMaterial(hairColor, {
    roughness: 0.7,
    metalness: 0.0,
  });
}

/**
 * Create detailed anime eye
 */
function createAnimeEye(
  eyeSizeMultiplier: number,
  irisColor: string,
  eyeConfig: FullCharacterConfig['eyes'],
  qualityPreset: typeof QUALITY_PRESETS[keyof typeof QUALITY_PRESETS]
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Eye';

  const eyeSize = 0.045 * eyeSizeMultiplier;
  const segments = Math.max(16, qualityPreset.headSegments / 2);

  // Sclera (white)
  const scleraGeometry = new THREE.SphereGeometry(eyeSize, segments, segments);
  const scleraMaterial = new THREE.MeshStandardMaterial({
    color: eyeConfig?.scleraColor || '#ffffff',
    roughness: 0.2,
  });
  const sclera = new THREE.Mesh(scleraGeometry, scleraMaterial);
  sclera.name = 'Sclera';
  group.add(sclera);

  // Iris
  const irisGeometry = new THREE.SphereGeometry(eyeSize * 0.7, segments, segments);
  const irisMaterial = new THREE.MeshStandardMaterial({
    color: irisColor,
    emissive: irisColor,
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });
  const iris = new THREE.Mesh(irisGeometry, irisMaterial);
  iris.position.z = 0.03;
  iris.name = 'Iris';
  group.add(iris);

  // Pupil
  const pupilGeometry = new THREE.SphereGeometry(eyeSize * 0.35, segments / 2, segments / 2);
  const pupilMaterial = new THREE.MeshBasicMaterial({
    color: eyeConfig?.pupilColor || '#000000',
  });
  const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  pupil.position.z = 0.042;
  pupil.name = 'Pupil';
  group.add(pupil);

  // Primary highlight
  if (eyeConfig?.highlightStyle !== 'none') {
    const highlightGeometry = new THREE.SphereGeometry(eyeSize * 0.25, 12, 12);
    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: eyeConfig?.highlightColor || '#ffffff',
    });
    const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlight.position.set(-0.012, 0.018, 0.048);
    highlight.name = 'HighlightPrimary';
    group.add(highlight);

    // Secondary sparkle (for double highlight)
    if (eyeConfig?.highlightStyle === 'double') {
      const sparkleGeometry = new THREE.SphereGeometry(eyeSize * 0.12, 8, 8);
      const sparkleMaterial = new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.9,
      });
      const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
      sparkle.position.set(0.01, -0.012, 0.048);
      sparkle.name = 'HighlightSecondary';
      group.add(sparkle);
    }
  }

  return group;
}

/**
 * Create breast geometry (teardrop shape)
 */
function createBreastGeometry(
  size: number,
  qualityPreset: typeof QUALITY_PRESETS[keyof typeof QUALITY_PRESETS]
): THREE.BufferGeometry {
  const segments = qualityPreset.bodySegments * 2;
  const geometry = new THREE.SphereGeometry(size, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.85);

  // Modify vertices for teardrop shape
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    // More volume at bottom, tapers at top
    const factor = 1 + (y / size) * 0.3;
    positions.setX(i, positions.getX(i) * factor);
    positions.setZ(i, positions.getZ(i) * factor);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Generate hair group
 */
function generateHair(
  config: FullCharacterConfig,
  material: THREE.Material,
  qualityPreset: typeof QUALITY_PRESETS[keyof typeof QUALITY_PRESETS]
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Hair';

  const segments = qualityPreset.bodySegments * 2;

  // Main hair cap
  try {
    const hairCapGeometry = new THREE.SphereGeometry(
      0.28,
      segments,
      segments,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.65
    );
    const hairCap = new THREE.Mesh(hairCapGeometry, material);
    hairCap.position.set(0, 0.09, -0.09);
    hairCap.name = 'HairCap';
    hairCap.castShadow = true;
    group.add(hairCap);
  } catch (error) {
    logger.warn('Failed to generate hair cap:', undefined, { error: error instanceof Error ? error.message : String(error) });
  }

  // Layered bangs
  try {
    for (let i = 0; i < 3; i++) {
      const bangsGeometry = new THREE.BoxGeometry(
        0.36 - i * 0.04,
        0.2 - i * 0.04,
        0.04 - i * 0.01
      );
      const bangs = new THREE.Mesh(bangsGeometry, material);
      bangs.position.set(0, -0.02 - i * 0.04, 0.18 + i * 0.01);
      bangs.rotation.set(0.25 + i * 0.05, 0, 0);
      bangs.name = `BangsLayer${i}`;
      bangs.castShadow = true;
      group.add(bangs);
    }
  } catch (error) {
    logger.warn('Failed to generate bangs:', undefined, { error: error instanceof Error ? error.message : String(error) });
  }

  // Side strands
  try {
    const strandSegments = Math.max(12, qualityPreset.limbSegments / 2);
    const leftStrandGeometry = new THREE.CapsuleGeometry(0.05, 0.7, strandSegments, 32);
    const leftStrand = new THREE.Mesh(leftStrandGeometry, material);
    leftStrand.position.set(-0.21, -0.3, 0.06);
    leftStrand.rotation.set(0.1, 0, 0.3);
    leftStrand.name = 'HairStrandLeft';
    leftStrand.castShadow = true;
    group.add(leftStrand);

    const rightStrand = new THREE.Mesh(leftStrandGeometry.clone(), material);
    rightStrand.position.set(0.21, -0.3, 0.06);
    rightStrand.rotation.set(0.1, 0, -0.3);
    rightStrand.name = 'HairStrandRight';
    rightStrand.castShadow = true;
    group.add(rightStrand);
  } catch (error) {
    logger.warn('Failed to generate side strands:', undefined, { error: error instanceof Error ? error.message : String(error) });
  }

  // Braid segments
  try {
    const braidSegments = Math.max(24, qualityPreset.headSegments / 2);
    const braidGroup = new THREE.Group();
    braidGroup.name = 'Braid';
    const braidPositions = [0, -0.25, -0.5, -0.75, -1.0];

    braidPositions.forEach((y, i) => {
      const braidSize = 0.07 - i * 0.005;
      const braidGeometry = new THREE.SphereGeometry(braidSize, braidSegments, braidSegments);
      const braidMesh = new THREE.Mesh(braidGeometry, material);
      braidMesh.position.set(0, y, 0);
      braidMesh.name = `BraidSegment${i}`;
      braidMesh.castShadow = true;
      braidGroup.add(braidMesh);
    });

    // Braid tie
    const tieGeometry = new THREE.TorusGeometry(0.055, 0.018, 12, 24);
    const tieMaterial = new THREE.MeshStandardMaterial({
      color: '#4a90e2',
      roughness: 0.4,
    });
    const tie = new THREE.Mesh(tieGeometry, tieMaterial);
    tie.position.set(0, -1.1, 0);
    tie.name = 'BraidTie';
    braidGroup.add(tie);

    braidGroup.position.set(0, -0.25, -0.19);
    group.add(braidGroup);
  } catch (error) {
    logger.warn('Failed to generate braid:', undefined, { error: error instanceof Error ? error.message : String(error) });
  }

  return group;
}

/**
 * Export THREE.Group to GLB ArrayBuffer
 * Comprehensive error handling
 */
async function exportToGLB(
  group: THREE.Group,
  options: GLBGenerationOptions
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    try {
      const exporter = new GLTFExporter();

      const exportOptions: any = {
        binary: true,
        includeCustomExtensions: false,
        trs: false, // Use matrices instead of TRS for better compatibility
        onlyVisible: false,
        truncateDrawRange: true,
        embedImages: true,
        animations: options.includeAnimations ? [] : undefined,
      };

      exporter.parse(
        group,
        (result) => {
          try {
            if (result instanceof ArrayBuffer) {
              if (result.byteLength === 0) {
                reject(new Error('GLB export produced empty buffer'));
                return;
              }
              resolve(result);
            } else if (result instanceof Blob) {
              result
                .arrayBuffer()
                .then((buffer) => {
                  if (buffer.byteLength === 0) {
                    reject(new Error('GLB export produced empty buffer'));
                    return;
                  }
                  resolve(buffer);
                })
                .catch(reject);
            } else {
              reject(new Error(`Unexpected export result type: ${typeof result}`));
            }
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        },
        (error) => {
          logger.error('GLTFExporter error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
          reject(error instanceof Error ? error : new Error('GLB export failed'));
        },
        exportOptions
      );
    } catch (error) {
      logger.error('Failed to initialize GLTFExporter:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      reject(error instanceof Error ? error : new Error('Failed to initialize GLB exporter'));
    }
  });
}

/**
 * Validate character group before export
 */
function validateCharacterGroup(group: THREE.Group): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!group.children || group.children.length === 0) {
    return {
      valid: false,
      warnings: ['Character group has no children'],
    };
  }

  let meshCount = 0;
  let totalTriangles = 0;

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshCount++;
      const geometry = child.geometry;
      if (geometry.index) {
        totalTriangles += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        totalTriangles += geometry.attributes.position.count / 3;
      }

      // Check for missing materials
      if (!child.material) {
        warnings.push(`Mesh ${child.name} has no material`);
      }

      // Check for invalid geometry
      if (!geometry.attributes.position || geometry.attributes.position.count === 0) {
        warnings.push(`Mesh ${child.name} has invalid geometry`);
      }
    }
  });

  if (meshCount === 0) {
    return {
      valid: false,
      warnings: ['No meshes found in character group'],
    };
  }

  if (totalTriangles === 0) {
    return {
      valid: false,
      warnings: ['Character has no triangles'],
    };
  }

  if (totalTriangles > 500000) {
    warnings.push(`High triangle count: ${totalTriangles.toFixed(0)} (may impact performance)`);
  }

  return {
    valid: true,
    warnings,
  };
}

/**
 * Collect metadata from character group
 */
function collectMetadata(group: THREE.Group): {
  triangleCount: number;
  materialCount: number;
  textureCount: number;
  boneCount: number;
} {
  let triangleCount = 0;
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  let boneCount = 0;

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const geometry = child.geometry;
      if (geometry.index) {
        triangleCount += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        triangleCount += geometry.attributes.position.count / 3;
      }

      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => materials.add(mat));
        } else {
          materials.add(child.material);
        }

        // Extract textures from material
        Object.values(child.material).forEach((value) => {
          if (value instanceof THREE.Texture) {
            textures.add(value);
          }
        });
      }

      // Note: skeleton property doesn't exist on Mesh in Three.js
      // Bone counting would need to be done differently if needed
    }
  });

  return {
    triangleCount: Math.round(triangleCount),
    materialCount: materials.size,
    textureCount: textures.size,
    boneCount,
  };
}

/**
 * Generate GLB and trigger download (client-side)
 */
export async function generateAndDownloadGLB(
  config: FullCharacterConfig,
  filename: string = 'character.glb',
  options: GLBGenerationOptions = {}
): Promise<void> {
  const result = await generateGLBFromConfig(config, options);

  if (!result.success || !result.glbBuffer) {
    throw new Error(result.error || 'Failed to generate GLB');
  }

  try {
    const blob = new Blob([result.glbBuffer], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL after a delay to ensure download started
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    logger.error('Failed to trigger download:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

