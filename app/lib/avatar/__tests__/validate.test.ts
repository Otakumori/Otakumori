import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  assertRenderable,
  assertPublishable,
  isAllowedHost,
  ValidationError,
  VALIDATION_ERROR_CODES,
} from '../validate';
import type { AvatarSpecV15Type } from '@om/avatar';
import * as db from '../db';

// Mock database functions
vi.mock('../db', () => ({
  getAssetsByIds: vi.fn(),
  getCachedFallbackForSlot: vi.fn(),
}));

describe('Avatar Validation', () => {
  const createTestSpec = (): AvatarSpecV15Type => ({
    version: '1.5',
    baseMeshUrl: 'https://assets.otakumori.com/base.glb',
    rig: {
      root: 'Hips',
      bones: ['Hips', 'Spine', 'Head'],
    },
    morphs: [],
    morphWeights: {},
    equipment: {
      Head: 'asset-1',
      Torso: 'asset-2',
    },
    palette: { primary: '#8b5cf6', secondary: '#ec4899' },
    nsfwPolicy: { allowNudity: false },
    animationMap: {},
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isAllowedHost', () => {
    it('should allow whitelisted hosts', () => {
      expect(isAllowedHost('https://assets.otakumori.com/avatar.glb')).toBe(true);
      expect(isAllowedHost('https://public.blob.vercel-storage.com/avatar-abc123.glb')).toBe(true);
    });

    it('should reject non-whitelisted hosts', () => {
      expect(isAllowedHost('https://evil.com/avatar.glb')).toBe(false);
      expect(isAllowedHost('https://example.com/avatar.glb')).toBe(false);
    });

    it('should handle invalid URLs', () => {
      expect(isAllowedHost('not-a-url')).toBe(false);
      expect(isAllowedHost('')).toBe(false);
    });
  });

  describe('assertRenderable', () => {
    it('should resolve safe assets without swaps', async () => {
      const spec = createTestSpec();
      const policy = { nsfwAllowed: false };

      vi.mocked(db.getAssetsByIds).mockResolvedValue(
        new Map([
          [
            'asset-1',
            {
              id: 'asset-1',
              url: 'https://assets.otakumori.com/head.glb',
              contentRating: 'sfw',
              slot: 'Head',
              name: 'Default Head',
              type: 'Head',
            },
          ],
          [
            'asset-2',
            {
              id: 'asset-2',
              url: 'https://assets.otakumori.com/torso.glb',
              contentRating: 'sfw',
              slot: 'Torso',
              name: 'Default Torso',
              type: 'Torso',
            },
          ],
        ]),
      );

      const result = await assertRenderable(spec, policy);

      expect(result.hadNSFWSwaps).toBe(false);
      expect(result.resolved.Head?.id).toBe('asset-1');
      expect(result.resolved.Torso?.id).toBe('asset-2');
    });

    it('should swap NSFW assets to fallbacks when policy disallows', async () => {
      const spec = createTestSpec();
      spec.equipment = { NSFWChest: 'nsfw-asset-1' };
      const policy = { nsfwAllowed: false };

      vi.mocked(db.getAssetsByIds).mockResolvedValue(
        new Map([
          [
            'nsfw-asset-1',
            {
              id: 'nsfw-asset-1',
              url: 'https://assets.otakumori.com/nsfw-chest.glb',
              contentRating: 'nsfw',
              slot: 'NSFWChest',
              name: 'NSFW Chest',
              type: 'NSFWChest',
            },
          ],
        ]),
      );

      vi.mocked(db.getCachedFallbackForSlot).mockResolvedValue({
        id: 'fallback-chest',
        url: 'https://assets.otakumori.com/fallback-chest.glb',
        contentRating: 'sfw',
        slot: 'NSFWChest',
        name: 'Fallback Chest',
        type: 'NSFWChest',
      });

      const result = await assertRenderable(spec, policy);

      expect(result.hadNSFWSwaps).toBe(true);
      expect(result.resolved.NSFWChest?.id).toBe('fallback-chest');
    });

    it('should allow NSFW assets when policy permits', async () => {
      const spec = createTestSpec();
      spec.equipment = { NSFWChest: 'nsfw-asset-1' };
      const policy = { nsfwAllowed: true };

      vi.mocked(db.getAssetsByIds).mockResolvedValue(
        new Map([
          [
            'nsfw-asset-1',
            {
              id: 'nsfw-asset-1',
              url: 'https://assets.otakumori.com/nsfw-chest.glb',
              contentRating: 'nsfw',
              slot: 'NSFWChest',
              name: 'NSFW Chest',
              type: 'NSFWChest',
            },
          ],
        ]),
      );

      const result = await assertRenderable(spec, policy);

      expect(result.hadNSFWSwaps).toBe(false);
      expect(result.resolved.NSFWChest?.id).toBe('nsfw-asset-1');
    });

    it('should use fallback for unknown assets', async () => {
      const spec = createTestSpec();
      const policy = { nsfwAllowed: false };

      vi.mocked(db.getAssetsByIds).mockResolvedValue(new Map());

      vi.mocked(db.getCachedFallbackForSlot).mockResolvedValue({
        id: 'fallback-head',
        url: 'https://assets.otakumori.com/fallback-head.glb',
        contentRating: 'sfw',
        slot: 'Head',
        name: 'Fallback Head',
        type: 'Head',
      });

      const result = await assertRenderable(spec, policy);

      expect(result.hadNSFWSwaps).toBe(true);
      expect(result.resolved.Head?.id).toBe('fallback-head');
    });

    it('should use fallback for disallowed hosts', async () => {
      const spec = createTestSpec();
      const policy = { nsfwAllowed: false };

      vi.mocked(db.getAssetsByIds).mockResolvedValue(
        new Map([
          [
            'asset-1',
            {
              id: 'asset-1',
              url: 'https://evil.com/head.glb', // Disallowed host
              contentRating: 'sfw',
              slot: 'Head',
              name: 'Evil Head',
              type: 'Head',
            },
          ],
        ]),
      );

      vi.mocked(db.getCachedFallbackForSlot).mockResolvedValue({
        id: 'fallback-head',
        url: 'https://assets.otakumori.com/fallback-head.glb',
        contentRating: 'sfw',
        slot: 'Head',
        name: 'Fallback Head',
        type: 'Head',
      });

      const result = await assertRenderable(spec, policy);

      expect(result.hadNSFWSwaps).toBe(true);
      expect(result.resolved.Head?.id).toBe('fallback-head');
    });
  });

  describe('assertPublishable', () => {
    it('should pass for safe assets', async () => {
      const spec = createTestSpec();
      const policy = { nsfwAllowed: false };

      vi.mocked(db.getAssetsByIds).mockResolvedValue(
        new Map([
          [
            'asset-1',
            {
              id: 'asset-1',
              url: 'https://assets.otakumori.com/head.glb',
              contentRating: 'sfw',
              slot: 'Head',
              name: 'Default Head',
              type: 'Head',
            },
          ],
        ]),
      );

      await expect(assertPublishable(spec, policy)).resolves.not.toThrow();
    });

    it('should throw for NSFW content when policy disallows', async () => {
      const spec = createTestSpec();
      spec.equipment = { NSFWChest: 'nsfw-asset-1' };
      const policy = { nsfwAllowed: false };

      vi.mocked(db.getAssetsByIds).mockResolvedValue(
        new Map([
          [
            'nsfw-asset-1',
            {
              id: 'nsfw-asset-1',
              url: 'https://assets.otakumori.com/nsfw-chest.glb',
              contentRating: 'nsfw',
              slot: 'NSFWChest',
              name: 'NSFW Chest',
              type: 'NSFWChest',
            },
          ],
        ]),
      );

      await expect(assertPublishable(spec, policy)).rejects.toThrow(ValidationError);

      try {
        await assertPublishable(spec, policy);
      } catch (error) {
        expect((error as ValidationError).code).toBe(VALIDATION_ERROR_CODES.NSFW_NOT_ALLOWED);
      }
    });

    it('should throw for unknown assets', async () => {
      const spec = createTestSpec();
      const policy = { nsfwAllowed: false };

      vi.mocked(db.getAssetsByIds).mockResolvedValue(new Map());

      await expect(assertPublishable(spec, policy)).rejects.toThrow(ValidationError);

      try {
        await assertPublishable(spec, policy);
      } catch (error) {
        expect((error as ValidationError).code).toBe(VALIDATION_ERROR_CODES.INVALID_ASSET);
      }
    });

    it('should throw for disallowed hosts', async () => {
      const spec = createTestSpec();
      const policy = { nsfwAllowed: false };

      vi.mocked(db.getAssetsByIds).mockResolvedValue(
        new Map([
          [
            'asset-1',
            {
              id: 'asset-1',
              url: 'https://evil.com/head.glb',
              contentRating: 'sfw',
              slot: 'Head',
              name: 'Evil Head',
              type: 'Head',
            },
          ],
        ]),
      );

      await expect(assertPublishable(spec, policy)).rejects.toThrow(ValidationError);

      try {
        await assertPublishable(spec, policy);
      } catch (error) {
        expect((error as ValidationError).code).toBe(VALIDATION_ERROR_CODES.DISALLOWED_HOST);
      }
    });
  });
});
