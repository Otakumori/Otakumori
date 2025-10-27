import { describe, it, expect } from 'vitest';
import {
  detectSwipeDirection,
  snapToAngle,
  getShortestRotation,
  easeOutCubic,
  getFaceAngle,
  getFacePosition,
  isTap,
} from '../app/lib/gesture-utils';

describe('gesture-utils', () => {
  describe('detectSwipeDirection', () => {
    it('should detect right swipe', () => {
      const result = detectSwipeDirection(0, 0, 50, 0, 30);
      expect(result.direction).toBe('right');
      expect(result.distance).toBe(50);
    });

    it('should detect left swipe', () => {
      const result = detectSwipeDirection(0, 0, -50, 0, 30);
      expect(result.direction).toBe('left');
      expect(result.distance).toBe(50);
    });

    it('should detect up swipe', () => {
      const result = detectSwipeDirection(0, 0, 0, -50, 30);
      expect(result.direction).toBe('up');
      expect(result.distance).toBe(50);
    });

    it('should detect down swipe', () => {
      const result = detectSwipeDirection(0, 0, 0, 50, 30);
      expect(result.direction).toBe('down');
      expect(result.distance).toBe(50);
    });

    it('should return none for small movements', () => {
      const result = detectSwipeDirection(0, 0, 10, 10, 30);
      expect(result.direction).toBe('none');
      expect(result.distance).toBeCloseTo(14.14, 1);
    });

    it('should prefer horizontal over vertical for diagonal swipes', () => {
      const result = detectSwipeDirection(0, 0, 50, 30, 30);
      expect(result.direction).toBe('right');
    });
  });

  describe('snapToAngle', () => {
    it('should snap to 0 for angles near 0', () => {
      expect(snapToAngle(0.1)).toBe(0);
      expect(snapToAngle(-0.1)).toBeCloseTo(0);
    });

    it('should snap to π/2 for angles near π/2', () => {
      expect(snapToAngle(Math.PI / 2 + 0.1)).toBe(Math.PI / 2);
      expect(snapToAngle(Math.PI / 2 - 0.1)).toBe(Math.PI / 2);
    });

    it('should snap to π for angles near π', () => {
      expect(snapToAngle(Math.PI + 0.1)).toBe(Math.PI);
      expect(snapToAngle(Math.PI - 0.1)).toBe(Math.PI);
    });

    it('should snap to 3π/2 for angles near 3π/2', () => {
      expect(snapToAngle((3 * Math.PI) / 2 + 0.1)).toBe((3 * Math.PI) / 2);
      expect(snapToAngle((3 * Math.PI) / 2 - 0.1)).toBe((3 * Math.PI) / 2);
    });
  });

  describe('getShortestRotation', () => {
    it('should return positive rotation for small positive angles', () => {
      expect(getShortestRotation(0, Math.PI / 4)).toBeCloseTo(Math.PI / 4);
    });

    it('should return negative rotation for large positive angles', () => {
      expect(getShortestRotation(0, (3 * Math.PI) / 2)).toBeCloseTo(-Math.PI / 2);
    });

    it('should return 0 for same angles', () => {
      expect(getShortestRotation(Math.PI / 4, Math.PI / 4)).toBe(0);
    });

    it('should handle wraparound correctly', () => {
      expect(getShortestRotation((7 * Math.PI) / 4, Math.PI / 4)).toBeCloseTo(Math.PI / 2);
    });
  });

  describe('easeOutCubic', () => {
    it('should return 0 for t=0', () => {
      expect(easeOutCubic(0)).toBe(0);
    });

    it('should return 1 for t=1', () => {
      expect(easeOutCubic(1)).toBe(1);
    });

    it('should be monotonically increasing', () => {
      const values = [0, 0.25, 0.5, 0.75, 1].map(easeOutCubic);
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('getFaceAngle', () => {
    it('should return correct angles for each slot', () => {
      expect(getFaceAngle(0)).toBe(0); // front
      expect(getFaceAngle(1)).toBeCloseTo(Math.PI / 2); // right
      expect(getFaceAngle(2)).toBeCloseTo(Math.PI); // back
      expect(getFaceAngle(3)).toBeCloseTo((3 * Math.PI) / 2); // left
      expect(getFaceAngle(4)).toBeCloseTo(Math.PI / 2); // top
      expect(getFaceAngle(5)).toBeCloseTo(-Math.PI / 2); // down
    });

    it('should return 0 for invalid slots', () => {
      expect(getFaceAngle(6)).toBe(0);
      expect(getFaceAngle(-1)).toBe(0);
    });
  });

  describe('getFacePosition', () => {
    it('should return correct positions for each slot', () => {
      expect(getFacePosition(0)).toEqual([0, 0, 1.5]); // front
      expect(getFacePosition(1)).toEqual([1.5, 0, 0]); // right
      expect(getFacePosition(2)).toEqual([0, 0, -1.5]); // back
      expect(getFacePosition(3)).toEqual([-1.5, 0, 0]); // left
      expect(getFacePosition(4)).toEqual([0, 1.5, 0]); // top
      expect(getFacePosition(5)).toEqual([0, -1.5, 0]); // down
    });

    it('should return front position for invalid slots', () => {
      expect(getFacePosition(6)).toEqual([0, 0, 1.5]);
      expect(getFacePosition(-1)).toEqual([0, 0, 1.5]);
    });
  });

  describe('isTap', () => {
    it('should return true for small movements', () => {
      expect(isTap(0, 0, 10, 10, 30)).toBe(true);
      expect(isTap(0, 0, 0, 0, 30)).toBe(true);
    });

    it('should return false for large movements', () => {
      expect(isTap(0, 0, 50, 0, 30)).toBe(false);
      expect(isTap(0, 0, 0, 50, 30)).toBe(false);
    });

    it('should respect custom threshold', () => {
      expect(isTap(0, 0, 20, 20, 10)).toBe(false);
      expect(isTap(0, 0, 20, 20, 50)).toBe(true);
    });
  });
});
