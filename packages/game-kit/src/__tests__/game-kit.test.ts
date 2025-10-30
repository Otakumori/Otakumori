import { describe, it, expect } from 'vitest';
import type {
  InputSystem,
  PhysicsController,
  AnimationHFSM,
  SideScrollerAdapter,
  Vector2,
} from '../index.js';

describe('Game Kit Types', () => {
  it('should define InputSystem interface', () => {
    const mockInput: InputSystem = {
      keyboard: {
        pressed: new Set(),
        justPressed: new Set(),
        justReleased: new Set(),
      },
      gamepad: null,
      touch: { touches: [] },
      update: () => {
        return undefined;
      },
    };

    expect(mockInput.keyboard.pressed).toBeDefined();
  });

  it('should define PhysicsController interface', () => {
    const mockPhysics: PhysicsController = {
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      checkCollision: () => false,
      applyForce: (_force: Vector2) => {
        return undefined;
      },
    };

    expect(mockPhysics.velocity).toBeDefined();
  });

  it('should define AnimationHFSM interface', () => {
    const mockHFSM: AnimationHFSM = {
      currentState: 'idle',
      transitions: [],
      update: (_delta: number) => {
        return undefined;
      },
      transition: (_to: string) => {
        return undefined;
      },
    };

    expect(mockHFSM.currentState).toBe('idle');
  });

  it('should define SideScrollerAdapter interface', () => {
    const mockAdapter: SideScrollerAdapter = {
      config: {
        gravity: 9.8,
        jumpForce: 10,
        moveSpeed: 5,
        maxFallSpeed: 20,
      },
      isGrounded: false,
      jump: () => {
        return undefined;
      },
      move: (_direction: number) => {
        return undefined;
      },
      update: (_delta: number) => {
        return undefined;
      },
    };

    expect(mockAdapter.config.gravity).toBe(9.8);
  });
});
