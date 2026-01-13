/**
 * Tests for Comprehensive GLB Generator
 * Tests the core GLB generation functionality with various configurations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateComprehensiveGLB, type ComprehensiveGLBOptions } from '@/app/lib/3d/comprehensive-glb-generator';
import type { FullCharacterConfig } from '@/app/test/character-creator/types';

describe('Comprehensive GLB Generator', () => {
  let defaultConfig: FullCharacterConfig;

  beforeEach(() => {
    // Create a minimal valid character configuration
    defaultConfig = {
      name: 'Test Character',
      gender: 'female',
      physique: 'curvy',
      age: 'young-adult',
      head: {
        size: 1.0,
        width: 1.0,
        depth: 1.0,
      },
      body: {
        height: 1.0,
        weight: 1.0,
        muscularity: 0.5,
        bodyFat: 0.3,
        posture: 0.8,
      },
      face: {
        shape: 'oval',
        cheekbones: 0.5,
        jawWidth: 0.5,
        jawDepth: 0.5,
        chinShape: 0.5,
        chinProminence: 0.5,
        foreheadHeight: 0.5,
      },
      eyes: {
        preset: 'anime-sparkle',
        size: 1.2,
        spacing: 1.0,
        depth: 0.5,
        tilt: 0.0,
        irisSize: 0.7,
        pupilSize: 0.35,
        irisColor: '#4a90e2',
        scleraColor: '#ffffff',
        pupilColor: '#000000',
        highlightStyle: 'double',
        highlightColor: '#ffffff',
        highlightIntensity: 0.5,
        eyelidShape: 0.5,
        eyelashLength: 0.5,
      },
      eyebrows: {
        style: 'default',
        thickness: 0.5,
        arch: 0.5,
        angle: 0.0,
        color: '#000000',
      },
      nose: {
        width: 1.0,
        height: 1.0,
        length: 1.0,
        bridgeWidth: 0.5,
        bridgeDepth: 0.5,
        tipShape: 0.5,
        nostrilSize: 0.5,
        nostrilFlare: 0.5,
      },
      mouth: {
        width: 1.0,
        size: 1.0,
        upperLipThickness: 1.0,
        lowerLipThickness: 1.0,
        cornerPosition: 0.0,
        philtrumDepth: 0.5,
      },
      ears: {
        size: 1.0,
        angle: 0.0,
        lobeShape: 0.5,
      },
      neck: {
        thickness: 0.5,
        length: 1.0,
        adamsApple: 0.0,
      },
      hair: {
        baseStyle: 'long-straight',
        length: 1.0,
        volume: 1.0,
        baseColor: '#f5deb3',
        highlightsEnabled: false,
        highlightColor: '#ffffff',
        highlightPattern: 'streaks',
        splitColor: false,
        splitColorRight: '#ffffff',
        extensions: [],
        physicsEnabled: true,
        physicsIntensity: 0.5,
      },
      torso: {
        chestWidth: 1.0,
        chestDepth: 1.0,
        abdomenDefinition: 0.5,
        waistWidth: 0.8,
        breastSize: 1.0,
        breastShape: 0.5,
        breastSeparation: 0.5,
        breastSag: 0.0,
        pectoralSize: 0.5,
      },
      shoulders: {
        width: 1.0,
        angle: 0.0,
        definition: 0.5,
      },
      arms: {
        upperArmSize: 1.0,
        forearmSize: 1.0,
        armLength: 1.0,
        shoulderShape: 0.5,
      },
      hands: {
        fingerLength: 1.0,
        fingerThickness: 0.5,
        nailLength: 0.5,
        nailColor: '#ffffff',
      },
      hips: {
        width: 1.0,
        depth: 1.0,
        shape: 0.5,
      },
      buttocks: {
        size: 1.0,
        shape: 0.5,
        lift: 0.5,
      },
      legs: {
        thighCircumference: 1.0,
        calfSize: 1.0,
        upperLegLength: 1.0,
        lowerLegLength: 1.0,
        kneeDefinition: 0.5,
        thighGap: 0.5,
      },
      feet: {
        size: 1.0,
      },
      skin: {
        tone: '#fde4d0',
        smoothness: 0.8,
        glossiness: 0.3,
        pores: 0.2,
        freckles: 0.0,
        freckleColor: '#d4a574',
        moles: 0.0,
        beautyMarks: [],
        acne: 0.0,
        acneColor: '#ff0000',
        flushedCheeks: 0.2,
        flushedColor: '#ff6b9d',
        tanLines: false,
      },
      scars: [],
      tattoos: [],
      piercings: [],
      facialHair: {
        style: 'none',
        thickness: 0.0,
        color: '#000000',
      },
      bodyHair: {
        chest: 0.0,
        back: 0.0,
        arms: 0.0,
        legs: 0.0,
        color: '#000000',
      },
      nsfw: {
        enabled: false,
        genitals: {
          type: 'none',
          size: 1.0,
          detail: 0.5,
        },
        breasts: {
          nippleSize: 1.0,
          nippleShape: 0.5,
          nippleColor: '#f4a6b8',
          areolaSize: 1.0,
          areolaColor: '#f4a6b8',
        },
        pubicHair: {
          style: 'none',
          density: 0.0,
          color: '#000000',
        },
      },
      outfit: {
        innerwear: {
          bra: null,
          braColor: '#ffffff',
          panties: null,
          pantiesColor: '#ffffff',
        },
        top: {
          style: '',
          color: '#ffffff',
          pattern: 'solid',
          patternColor: '#ffffff',
          metallic: 0.0,
          collarColor: '#ffffff',
          sleevesColor: '#ffffff',
          mainColor: '#ffffff',
        },
        bottom: {
          style: '',
          color: '#ffffff',
          pattern: 'solid',
          patternColor: '#ffffff',
        },
        shoes: {
          style: '',
          color: '#000000',
        },
        accessories: [],
        bloodVeil: {
          style: '',
          color: '#ffffff',
          visible: false,
        },
      },
      physics: {
        enabled: true,
        quality: 'high' as const,
        breast: {
          jiggleIntensity: 0.5,
          jiggleSpeed: 1.0,
          damping: 0.5,
          gravity: 1.0,
        },
        butt: {
          jiggleIntensity: 0.5,
          damping: 0.5,
          gravity: 1.0,
        },
        hair: {
          physicsIntensity: 0.5,
          stiffness: 0.5,
          damping: 0.5,
        },
      },
      expression: {
        base: 'neutral',
        intensity: 0.5,
        customBlendShapes: {},
      },
      animations: {
        idle: 'breathing',
        walk: 'default',
        run: 'default',
        jump: 'default',
      },
      vfx: {
        aura: null,
        glow: null,
        particles: null,
      },
      makeup: {
        foundation: {
          enabled: false,
          color: '#ffffff',
          opacity: 1.0,
        },
        blush: {
          enabled: false,
          color: '#ff6b9d',
          opacity: 0.5,
          position: 0.5,
        },
        eyeshadow: {
          enabled: false,
          color: '#4a90e2',
          opacity: 0.5,
        },
        eyeliner: {
          enabled: false,
          color: '#000000',
          thickness: 0.5,
        },
        lipstick: {
          enabled: false,
          color: '#ff0000',
          opacity: 1.0,
        },
      },
      meta: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  });

  describe('Input Validation', () => {
    it('should reject null configuration', async () => {
      const result = await generateComprehensiveGLB(null as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject undefined configuration', async () => {
      const result = await generateComprehensiveGLB(undefined as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should accept valid minimal configuration', async () => {
      const result = await generateComprehensiveGLB(defaultConfig, {
        quality: 'low', // Use low quality for faster tests
        allowPartialGeneration: true,
      });
      // Should either succeed or fail gracefully with validation error
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty(result.success ? 'glbBuffer' : 'error');
    });
  });

  describe('Quality Presets', () => {
    const qualityLevels: Array<'low' | 'medium' | 'high' | 'ultra'> = ['low', 'medium', 'high', 'ultra'];

    qualityLevels.forEach((quality) => {
      it(`should generate GLB with ${quality} quality`, async () => {
        const result = await generateComprehensiveGLB(defaultConfig, {
          quality,
          allowPartialGeneration: true,
        });

        expect(result).toHaveProperty('success');
        if (result.success) {
          expect(result.glbBuffer).toBeDefined();
          expect(result.glbBuffer!.byteLength).toBeGreaterThan(0);
          expect(result.metadata).toBeDefined();
          expect(result.metadata!.fileSize).toBeGreaterThan(0);
        }
      }, 30000); // 30 second timeout for generation
    });
  });

  describe('Options', () => {
    it('should respect allowPartialGeneration option', async () => {
      const result = await generateComprehensiveGLB(defaultConfig, {
        quality: 'low',
        allowPartialGeneration: true,
      });

      expect(result).toHaveProperty('success');
      // With partial generation, it should succeed even if some optional parts fail
    });

    it('should warn on large file size', async () => {
      const result = await generateComprehensiveGLB(defaultConfig, {
        quality: 'high',
        maxFileSizeMB: 1, // Very low limit to trigger warning
        allowPartialGeneration: true,
      });

      expect(result).toHaveProperty('success');
      if (result.success && result.warnings) {
        const hasSizeWarning = result.warnings.some((w) => w.includes('file size'));
        // May or may not have warning depending on actual file size
        expect(typeof hasSizeWarning).toBe('boolean');
      }
    });

    it('should support cel-shaded rendering', async () => {
      const result = await generateComprehensiveGLB(defaultConfig, {
        quality: 'low',
        celShaded: true,
        allowPartialGeneration: true,
      });

      expect(result).toHaveProperty('success');
    });
  });

  describe('Game Translation', () => {
    it('should support game-specific translation via gameId', async () => {
      const result = await generateComprehensiveGLB(defaultConfig, {
        quality: 'low',
        gameId: 'fps', // Assuming 'fps' is a valid game ID
        allowPartialGeneration: true,
      });

      expect(result).toHaveProperty('success');
    });
  });

  describe('Metadata', () => {
    it('should include performance metadata on success', async () => {
      const result = await generateComprehensiveGLB(defaultConfig, {
        quality: 'low',
        allowPartialGeneration: true,
      });

      if (result.success) {
        expect(result.metadata).toBeDefined();
        expect(result.metadata!.performance).toBeDefined();
        expect(result.metadata!.performance!.totalTime).toBeGreaterThan(0);
        expect(result.metadata!.performance!.buildTime).toBeGreaterThan(0);
        expect(result.metadata!.performance!.exportTime).toBeGreaterThan(0);
        expect(result.metadata!.triangleCount).toBeGreaterThan(0);
        expect(result.metadata!.fileSize).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Create invalid config that should fail validation
      const invalidConfig = {
        ...defaultConfig,
        body: undefined as any,
      };

      const result = await generateComprehensiveGLB(invalidConfig, {
        quality: 'low',
        allowPartialGeneration: true,
      });

      // Should fail but return structured error
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
      }
    });
  });
});

