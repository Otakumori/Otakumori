import { describe, it, expect } from 'vitest';
import { createEntityId, type EntityId, type System, type ComponentMap } from '../index.js';

describe('ECS Types', () => {
  it('should create an EntityId', () => {
    const id = createEntityId('entity-1');
    expect(id).toBe('entity-1');
  });

  it('should define a valid system', () => {
    interface TestComponents extends ComponentMap {
      position: { x: number; y: number };
      velocity: { dx: number; dy: number };
    }

    const movementSystem: System<TestComponents> = {
      query: { components: ['position', 'velocity'] },
      update: (entities, _delta) => {
        expect(entities).toBeDefined();
      },
    };

    expect(movementSystem.query.components).toContain('position');
    expect(movementSystem.query.components).toContain('velocity');
  });
});
