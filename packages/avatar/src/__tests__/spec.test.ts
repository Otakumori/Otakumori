import { describe, it, expect } from 'vitest';
import { AvatarSpecV15, clampMorph, clampAllMorphs } from '../spec.js';
import type { AvatarSpecV15Type } from '../spec.js';
import { serializeAvatar, deserializeAvatar, createDefaultAvatarSpec } from '../serialize.js';

function validateAvatar(spec: unknown): spec is AvatarSpecV15Type {
  const result = AvatarSpecV15.safeParse(spec);
  return result.success;
}

describe('AvatarSpecV15', () => {
  const createValidSpec = (): AvatarSpecV15Type => ({
    version: '1.5',
    baseMeshUrl: 'https://example.com/mesh.glb',
    rig: {
      root: 'Hips',
      bones: ['Hips', 'Spine', 'Head'],
    },
    morphs: [
      { id: 'height', label: 'Height', min: 0, max: 1 },
      { id: 'width', label: 'Width', min: 0.2, max: 0.8 },
    ],
    morphWeights: { height: 0.5, width: 0.6 },
    equipment: {},
    palette: { primary: '#8b5cf6', secondary: '#ec4899' },
    nsfwPolicy: { allowNudity: false },
    animationMap: {},
  });

  describe('validation', () => {
    it('should validate a valid avatar spec', () => {
      const validSpec = createValidSpec();
      expect(validateAvatar(validSpec)).toBe(true);
    });

    it('should reject invalid specs', () => {
      expect(validateAvatar({})).toBe(false);
      expect(validateAvatar(null)).toBe(false);
      expect(validateAvatar({ version: '2.0' })).toBe(false);
    });

    it('should reject spec with wrong version', () => {
      const invalidSpec = { ...createValidSpec(), version: '2.0' };
      expect(validateAvatar(invalidSpec)).toBe(false);
    });

    it('should reject spec with invalid URL', () => {
      const invalidSpec = { ...createValidSpec(), baseMeshUrl: 'not-a-url' };
      expect(validateAvatar(invalidSpec)).toBe(false);
    });

    it('should reject spec with allowNudity: true', () => {
      const invalidSpec = {
        ...createValidSpec(),
        nsfwPolicy: { allowNudity: true },
      };
      expect(validateAvatar(invalidSpec)).toBe(false);
    });
  });

  describe('clampMorph', () => {
    it('should clamp values within defined min/max', () => {
      const spec = createValidSpec();

      // Test within range
      expect(clampMorph(spec, 'height', 0.5)).toBe(0.5);

      // Test below min
      expect(clampMorph(spec, 'height', -0.5)).toBe(0);

      // Test above max
      expect(clampMorph(spec, 'height', 1.5)).toBe(1);

      // Test custom range
      expect(clampMorph(spec, 'width', 0.1)).toBe(0.2);
      expect(clampMorph(spec, 'width', 0.9)).toBe(0.8);
    });

    it('should clamp unknown morphs to 0-1', () => {
      const spec = createValidSpec();
      expect(clampMorph(spec, 'unknown', -0.5)).toBe(0);
      expect(clampMorph(spec, 'unknown', 1.5)).toBe(1);
      expect(clampMorph(spec, 'unknown', 0.5)).toBe(0.5);
    });
  });

  describe('clampAllMorphs', () => {
    it('should clamp all morph weights', () => {
      const spec = createValidSpec();
      spec.morphWeights = {
        height: 1.5, // Should clamp to 1
        width: 0.1, // Should clamp to 0.2
      };

      const clamped = clampAllMorphs(spec);
      expect(clamped.morphWeights.height).toBe(1);
      expect(clamped.morphWeights.width).toBe(0.2);
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize roundtrip', () => {
      const original = createValidSpec();
      const serialized = serializeAvatar(original);
      const deserialized = deserializeAvatar(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.version).toBe(original.version);
      expect(deserialized?.baseMeshUrl).toBe(original.baseMeshUrl);
    });

    it('should return null for invalid JSON', () => {
      expect(deserializeAvatar('invalid json')).toBeNull();
    });

    it('should return null for invalid spec', () => {
      expect(deserializeAvatar('{}')).toBeNull();
      expect(deserializeAvatar('{"version": "2.0"}')).toBeNull();
    });
  });

  describe('createDefaultAvatarSpec', () => {
    it('should create a valid default spec', () => {
      const defaultSpec = createDefaultAvatarSpec();
      expect(validateAvatar(defaultSpec)).toBe(true);
      expect(defaultSpec.version).toBe('1.5');
      expect(defaultSpec.nsfwPolicy.allowNudity).toBe(false);
    });
  });
});
