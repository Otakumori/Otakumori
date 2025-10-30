/**
 * Player prefab - Connects avatar, controller, and HFSM
 */
import { spawn, add, defineComponent } from '@om/ecs';
import { createTransform, createVelocity, createCharacterController, } from '../physics/components';
import { createHFSM } from '../animation/hfsm';
// Define player-specific components
export const TransformComponent = defineComponent('Transform');
export const VelocityComponent = defineComponent('Velocity');
export const CharacterComponent = defineComponent('Character');
export const AnimationComponent = defineComponent('Animation');
export const AvatarDataComponent = defineComponent('AvatarData');
export const PlayerComponent = defineComponent('Player');
/**
 * Spawn a player entity with all necessary components
 */
export function spawnPlayer(world, options = {}) {
    const { position = [0, 2, 0], avatarConfig = null, speed = 5.0, jumpForce = 10.0 } = options;
    const entity = spawn(world);
    // Add transform
    add(world, TransformComponent, entity, createTransform(position));
    // Add velocity
    add(world, VelocityComponent, entity, createVelocity());
    // Add character controller
    const controller = createCharacterController({ speed, jumpForce });
    add(world, CharacterComponent, entity, controller);
    // Add animation state machine
    add(world, AnimationComponent, entity, createHFSM());
    // Add avatar data
    if (avatarConfig) {
        add(world, AvatarDataComponent, entity, avatarConfig);
    }
    // Mark as player
    add(world, PlayerComponent, entity, { id: 'player' });
    return entity;
}
/**
 * Spawn a simple platform entity
 */
export function spawnPlatform(world, position, size) {
    const entity = spawn(world);
    add(world, TransformComponent, entity, createTransform(position));
    // Add platform-specific data
    const PlatformComponent = defineComponent('Platform');
    add(world, PlatformComponent, entity, { size });
    return entity;
}
