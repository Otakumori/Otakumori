import { describe, it, expect } from 'vitest';
import { resolvePolicy, isNSFWSlot } from '../policy.js';

describe('Policy Resolution', () => {
  describe('resolvePolicy', () => {
    it('should disallow NSFW when no cookie and not verified', () => {
      const result = resolvePolicy({});
      expect(result.nsfwAllowed).toBe(false);
    });

    it('should disallow NSFW when cookie enabled but not verified', () => {
      const result = resolvePolicy({
        cookieValue: 'enabled',
        adultVerified: false,
      });
      expect(result.nsfwAllowed).toBe(false);
    });

    it('should disallow NSFW when verified but cookie not enabled', () => {
      const result = resolvePolicy({
        cookieValue: 'disabled',
        adultVerified: true,
      });
      expect(result.nsfwAllowed).toBe(false);
    });

    it('should allow NSFW when both cookie enabled and verified', () => {
      const result = resolvePolicy({
        cookieValue: 'enabled',
        adultVerified: true,
      });
      expect(result.nsfwAllowed).toBe(true);
    });

    it('should disallow NSFW for undefined cookie value', () => {
      const result = resolvePolicy({
        cookieValue: undefined,
        adultVerified: true,
      });
      expect(result.nsfwAllowed).toBe(false);
    });

    it('should disallow NSFW for undefined verification', () => {
      const result = resolvePolicy({
        cookieValue: 'enabled',
        adultVerified: undefined,
      });
      expect(result.nsfwAllowed).toBe(false);
    });
  });

  describe('isNSFWSlot', () => {
    it('should identify NSFW slots', () => {
      expect(isNSFWSlot('NSFWChest')).toBe(true);
      expect(isNSFWSlot('NSFWGroin')).toBe(true);
      expect(isNSFWSlot('NSFWAccessory')).toBe(true);
    });

    it('should not identify SFW slots as NSFW', () => {
      expect(isNSFWSlot('Head')).toBe(false);
      expect(isNSFWSlot('Torso')).toBe(false);
      expect(isNSFWSlot('Hair')).toBe(false);
      expect(isNSFWSlot('Chest')).toBe(false);
    });
  });
});
