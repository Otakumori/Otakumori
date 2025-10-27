import { describe, it, expect } from 'vitest';
import { createEntityId, type EntityId, type System } from '../index.js';

describe('ECS Types', () => {
  it('should create an EntityId', () => {
    const id = createEntityId('entity-1');
    expect(id).toBe('entity-1');
  });

  it('should define a valid system', () => {
    const movementSystem: System = (world, dt) => {
      expect(world).toBeDefined();
      expect(dt).toBeGreaterThanOrEqual(0);
    };

    expect(typeof movementSystem).toBe('function');
  });
});
