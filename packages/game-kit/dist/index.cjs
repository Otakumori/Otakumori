'use strict';
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod,
  )
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ANIM_THRESHOLDS: () => ANIM_THRESHOLDS,
  AnimState: () => AnimState,
  AnimationComponent: () => AnimationComponent,
  AvatarDataComponent: () => AvatarDataComponent,
  CharacterComponent: () => CharacterComponent,
  DEFAULT_CLIPS: () => DEFAULT_CLIPS,
  DEFAULT_INPUT_MAP: () => DEFAULT_INPUT_MAP,
  DEFAULT_TRANSITIONS: () => DEFAULT_TRANSITIONS,
  PlayerComponent: () => PlayerComponent,
  RigidBodyType: () => RigidBodyType,
  TransformComponent: () => TransformComponent,
  Vec3Math: () => Vec3Math,
  VelocityComponent: () => VelocityComponent,
  applyImpulse: () => applyImpulse,
  applyVelocity: () => applyVelocity,
  blendAnimations: () => blendAnimations,
  checkGroundContact: () => checkGroundContact,
  checkGrounded: () => checkGrounded,
  constrainMovement: () => constrainMovement,
  constrainPosition: () => constrainPosition,
  createActionState: () => createActionState,
  createBoxCollider: () => createBoxCollider,
  createCapsuleCollider: () => createCapsuleCollider,
  createCharacterController: () => createCharacterController,
  createDynamicBody: () => createDynamicBody,
  createFixedBody: () => createFixedBody,
  createHFSM: () => createHFSM,
  createInputSystem: () => createInputSystem,
  createKinematicBody: () => createKinematicBody,
  createOrthoCamera: () => createOrthoCamera,
  createRapierWorld: () => createRapierWorld,
  createSide2DAdapter: () => createSide2DAdapter,
  createSphereCollider: () => createSphereCollider,
  createTransform: () => createTransform,
  createVelocity: () => createVelocity,
  crossFade: () => crossFade,
  easeInOutCubic: () => easeInOutCubic,
  easeInQuad: () => easeInQuad,
  easeOutQuad: () => easeOutQuad,
  followTarget: () => followTarget,
  getAsset: () => getAsset,
  getBlendWeight: () => getBlendWeight,
  getBodyPosition: () => getBodyPosition,
  getBodyVelocity: () => getBodyVelocity,
  getCameraBounds: () => getCameraBounds,
  getCurrentClip: () => getCurrentClip,
  getFallback: () => getFallback,
  getHorizontalSpeed: () => getHorizontalSpeed,
  getMovementDirection: () => getMovementDirection,
  getSafeAlternative: () => getSafeAlternative,
  handleStepOffset: () => handleStepOffset,
  isVisible: () => isVisible,
  justPressed: () => justPressed,
  justReleased: () => justReleased,
  lerp: () => lerp,
  listAssetsBySlot: () => listAssetsBySlot,
  loadRegistry: () => loadRegistry,
  pollInput: () => pollInput,
  remapAction: () => remapAction,
  resolveSlopeCollision: () => resolveSlopeCollision,
  screenToWorld: () => screenToWorld,
  setBodyPosition: () => setBodyPosition,
  setBodyVelocity: () => setBodyVelocity,
  setInputEnabled: () => setInputEnabled,
  smoothStep: () => smoothStep,
  spawnPlatform: () => spawnPlatform,
  spawnPlayer: () => spawnPlayer,
  stepPhysics: () => stepPhysics,
  transitionTo: () => transitionTo,
  updateCharacter: () => updateCharacter,
  updateHFSM: () => updateHFSM,
  validateRegistry: () => validateRegistry,
  worldToScreen: () => worldToScreen,
});
module.exports = __toCommonJS(index_exports);

// src/input/actions.ts
var DEFAULT_INPUT_MAP = {
  keyboard: {
    ['MoveX' /* MoveX */]: ['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight'],
    ['MoveY' /* MoveY */]: ['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'],
    ['Jump' /* Jump */]: ['Space'],
    ['Attack' /* Attack */]: ['KeyJ'],
    ['Dash' /* Dash */]: ['KeyK'],
    ['Pause' /* Pause */]: ['Escape'],
  },
  gamepad: {
    ['MoveX' /* MoveX */]: { axis: 0, deadzone: 0.15 },
    ['MoveY' /* MoveY */]: { axis: 1, deadzone: 0.15, invert: true },
    ['Jump' /* Jump */]: { button: 0 },
    // A button
    ['Attack' /* Attack */]: { button: 2 },
    // X button
    ['Dash' /* Dash */]: { button: 1 },
    // B button
    ['Pause' /* Pause */]: { button: 9 },
    // Start button
  },
  touch: {
    ['MoveX' /* MoveX */]: { type: 'joystick', position: 'left', size: 100 },
    ['MoveY' /* MoveY */]: { type: 'joystick', position: 'left', size: 100 },
    ['Jump' /* Jump */]: { type: 'button', position: 'right', size: 60 },
    ['Attack' /* Attack */]: { type: 'button', position: 'right', size: 60 },
    ['Dash' /* Dash */]: { type: 'button', position: 'right', size: 60 },
    ['Pause' /* Pause */]: { type: 'button', position: 'center', size: 40 },
  },
};
function createActionState() {
  return {
    ['MoveX' /* MoveX */]: 0,
    ['MoveY' /* MoveY */]: 0,
    ['Jump' /* Jump */]: false,
    ['Attack' /* Attack */]: false,
    ['Dash' /* Dash */]: false,
    ['Pause' /* Pause */]: false,
  };
}

// src/input/system.ts
function createInputSystem(mapping = DEFAULT_INPUT_MAP) {
  const system = {
    mapping,
    keyPressed: /* @__PURE__ */ new Set(),
    prevKeyPressed: /* @__PURE__ */ new Set(),
    gamepadIndex: null,
    touchActive: false,
    touchState: /* @__PURE__ */ new Map(),
    enabled: true,
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (system.enabled) {
        system.keyPressed.add(e.code);
      }
    });
    window.addEventListener('keyup', (e) => {
      if (system.enabled) {
        system.keyPressed.delete(e.code);
      }
    });
    window.addEventListener('gamepadconnected', (e) => {
      if (system.enabled && system.gamepadIndex === null) {
        system.gamepadIndex = e.gamepad.index;
      }
    });
    window.addEventListener('gamepaddisconnected', (e) => {
      if (system.gamepadIndex === e.gamepad.index) {
        system.gamepadIndex = null;
      }
    });
    window.addEventListener('touchstart', () => {
      system.touchActive = true;
    });
  }
  return system;
}
function pollInput(system) {
  if (!system.enabled) {
    return createActionState();
  }
  const state = createActionState();
  pollKeyboard(system, state);
  if (system.gamepadIndex !== null) {
    pollGamepad(system, state);
  }
  if (system.touchActive) {
    pollTouch(system, state);
  }
  system.prevKeyPressed = new Set(system.keyPressed);
  return state;
}
function pollKeyboard(system, state) {
  const { keyboard } = system.mapping;
  let moveX = 0;
  if (system.keyPressed.has('KeyA') || system.keyPressed.has('ArrowLeft')) {
    moveX -= 1;
  }
  if (system.keyPressed.has('KeyD') || system.keyPressed.has('ArrowRight')) {
    moveX += 1;
  }
  state['MoveX' /* MoveX */] = moveX;
  let moveY = 0;
  if (system.keyPressed.has('KeyW') || system.keyPressed.has('ArrowUp')) {
    moveY += 1;
  }
  if (system.keyPressed.has('KeyS') || system.keyPressed.has('ArrowDown')) {
    moveY -= 1;
  }
  state['MoveY' /* MoveY */] = moveY;
  state['Jump' /* Jump */] = keyboard['Jump' /* Jump */].some((key) => system.keyPressed.has(key));
  state['Attack' /* Attack */] = keyboard['Attack' /* Attack */].some((key) =>
    system.keyPressed.has(key),
  );
  state['Dash' /* Dash */] = keyboard['Dash' /* Dash */].some((key) => system.keyPressed.has(key));
  state['Pause' /* Pause */] = keyboard['Pause' /* Pause */].some((key) =>
    system.keyPressed.has(key),
  );
}
function pollGamepad(system, state) {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) {
    return;
  }
  const gamepads = navigator.getGamepads();
  const gamepad = system.gamepadIndex !== null ? gamepads[system.gamepadIndex] : null;
  if (!gamepad) {
    return;
  }
  const { gamepad: mapping } = system.mapping;
  const moveXMapping = mapping['MoveX' /* MoveX */];
  let moveX = gamepad.axes[moveXMapping.axis] || 0;
  if (Math.abs(moveX) < moveXMapping.deadzone) {
    moveX = 0;
  }
  if (moveXMapping.invert) {
    moveX = -moveX;
  }
  state['MoveX' /* MoveX */] = Math.max(state['MoveX' /* MoveX */], moveX);
  const moveYMapping = mapping['MoveY' /* MoveY */];
  let moveY = gamepad.axes[moveYMapping.axis] || 0;
  if (Math.abs(moveY) < moveYMapping.deadzone) {
    moveY = 0;
  }
  if (moveYMapping.invert) {
    moveY = -moveY;
  }
  state['MoveY' /* MoveY */] = Math.max(state['MoveY' /* MoveY */], moveY);
  const jumpButton = mapping['Jump' /* Jump */].button;
  state['Jump' /* Jump */] =
    state['Jump' /* Jump */] || (gamepad.buttons[jumpButton]?.pressed ?? false);
  const attackButton = mapping['Attack' /* Attack */].button;
  state['Attack' /* Attack */] =
    state['Attack' /* Attack */] || (gamepad.buttons[attackButton]?.pressed ?? false);
  const dashButton = mapping['Dash' /* Dash */].button;
  state['Dash' /* Dash */] =
    state['Dash' /* Dash */] || (gamepad.buttons[dashButton]?.pressed ?? false);
  const pauseButton = mapping['Pause' /* Pause */].button;
  state['Pause' /* Pause */] =
    state['Pause' /* Pause */] || (gamepad.buttons[pauseButton]?.pressed ?? false);
}
function pollTouch(_system, _state) {}
function justPressed(system, action) {
  const mapping = system.mapping.keyboard[action];
  return mapping.some((key) => system.keyPressed.has(key) && !system.prevKeyPressed.has(key));
}
function justReleased(system, action) {
  const mapping = system.mapping.keyboard[action];
  return mapping.some((key) => !system.keyPressed.has(key) && system.prevKeyPressed.has(key));
}
function remapAction(system, action, keys) {
  system.mapping.keyboard[action] = keys;
}
function setInputEnabled(system, enabled) {
  system.enabled = enabled;
  if (!enabled) {
    system.keyPressed.clear();
  }
}

// src/physics/components.ts
function createTransform(position = [0, 0, 0], rotation = [0, 0, 0, 1], scale = [1, 1, 1]) {
  return {
    position: { x: position[0], y: position[1], z: position[2] },
    rotation: { x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3] },
    scale: { x: scale[0], y: scale[1], z: scale[2] },
  };
}
function createVelocity() {
  return {
    linear: { x: 0, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: 0 },
  };
}
var RigidBodyType = /* @__PURE__ */ ((RigidBodyType2) => {
  RigidBodyType2['Dynamic'] = 'dynamic';
  RigidBodyType2['Fixed'] = 'fixed';
  RigidBodyType2['Kinematic'] = 'kinematic';
  return RigidBodyType2;
})(RigidBodyType || {});
function createCharacterController(options = {}) {
  return {
    velocity: options.velocity || { x: 0, y: 0, z: 0 },
    onGround: options.onGround ?? false,
    coyoteTime: options.coyoteTime ?? 0,
    jumpBuffer: options.jumpBuffer ?? 0,
    slopeLimit: options.slopeLimit ?? Math.PI / 4,
    // 45 degrees
    stepOffset: options.stepOffset ?? 0.3,
    speed: options.speed ?? 5,
    jumpForce: options.jumpForce ?? 10,
    grounded: options.grounded ?? false,
    groundedFrames: options.groundedFrames ?? 0,
  };
}
var Vec3Math = {
  add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  },
  sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  },
  scale(v, s) {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
  },
  length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  },
  normalize(v) {
    const len = Vec3Math.length(v);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return Vec3Math.scale(v, 1 / len);
  },
  zero() {
    return { x: 0, y: 0, z: 0 };
  },
};

// src/physics/rapier.ts
var rapierModule = null;
var rapierLoading = null;
async function loadRapier() {
  if (rapierModule) {
    return rapierModule;
  }
  if (rapierLoading) {
    return rapierLoading;
  }
  rapierLoading = import('@dimforge/rapier3d-compat').then((module2) => {
    rapierModule = module2;
    return module2;
  });
  return rapierLoading;
}
async function createRapierWorld(gravity = [0, -9.81, 0]) {
  const rapier = await loadRapier();
  const rapierWorld = new rapier.World({ x: gravity[0], y: gravity[1], z: gravity[2] });
  return {
    rapierWorld,
    rapier,
    gravity: { x: gravity[0], y: gravity[1], z: gravity[2] },
  };
}
function stepPhysics(world, _dt) {
  world.rapierWorld.step();
}
function createDynamicBody(world, position) {
  const { rapier, rapierWorld } = world;
  const bodyDesc = rapier.RigidBodyDesc.dynamic().setTranslation(
    position.x,
    position.y,
    position.z,
  );
  const body = rapierWorld.createRigidBody(bodyDesc);
  return body.handle;
}
function createFixedBody(world, position) {
  const { rapier, rapierWorld } = world;
  const bodyDesc = rapier.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z);
  const body = rapierWorld.createRigidBody(bodyDesc);
  return body.handle;
}
function createKinematicBody(world, position) {
  const { rapier, rapierWorld } = world;
  const bodyDesc = rapier.RigidBodyDesc.kinematicPositionBased().setTranslation(
    position.x,
    position.y,
    position.z,
  );
  const body = rapierWorld.createRigidBody(bodyDesc);
  return body.handle;
}
function createBoxCollider(world, bodyHandle, halfExtents) {
  const { rapier, rapierWorld } = world;
  const colliderDesc = rapier.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z);
  const body = rapierWorld.getRigidBody(bodyHandle);
  const collider = rapierWorld.createCollider(colliderDesc, body);
  return collider.handle;
}
function createSphereCollider(world, bodyHandle, radius) {
  const { rapier, rapierWorld } = world;
  const colliderDesc = rapier.ColliderDesc.ball(radius);
  const body = rapierWorld.getRigidBody(bodyHandle);
  const collider = rapierWorld.createCollider(colliderDesc, body);
  return collider.handle;
}
function createCapsuleCollider(world, bodyHandle, halfHeight, radius) {
  const { rapier, rapierWorld } = world;
  const colliderDesc = rapier.ColliderDesc.capsule(halfHeight, radius);
  const body = rapierWorld.getRigidBody(bodyHandle);
  const collider = rapierWorld.createCollider(colliderDesc, body);
  return collider.handle;
}
function getBodyPosition(world, handle) {
  const body = world.rapierWorld.getRigidBody(handle);
  if (!body) {
    return { x: 0, y: 0, z: 0 };
  }
  const translation = body.translation();
  return { x: translation.x, y: translation.y, z: translation.z };
}
function setBodyPosition(world, handle, position) {
  const body = world.rapierWorld.getRigidBody(handle);
  if (body) {
    body.setTranslation({ x: position.x, y: position.y, z: position.z }, true);
  }
}
function getBodyVelocity(world, handle) {
  const body = world.rapierWorld.getRigidBody(handle);
  if (!body) {
    return { x: 0, y: 0, z: 0 };
  }
  const velocity = body.linvel();
  return { x: velocity.x, y: velocity.y, z: velocity.z };
}
function setBodyVelocity(world, handle, velocity) {
  const body = world.rapierWorld.getRigidBody(handle);
  if (body) {
    body.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
  }
}
function applyImpulse(world, handle, impulse) {
  const body = world.rapierWorld.getRigidBody(handle);
  if (body) {
    body.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);
  }
}
function checkGrounded(world, position, distance = 0.1) {
  const { rapierWorld, rapier } = world;
  const ray = new rapier.Ray(
    { x: position.x, y: position.y, z: position.z },
    { x: 0, y: -1, z: 0 },
  );
  const hit = rapierWorld.castRay(ray, distance, true);
  return hit !== null;
}

// src/physics/character.ts
var COYOTE_TIME_FRAMES = 6;
var JUMP_BUFFER_FRAMES = 6;
function updateCharacter(controller, input, dt, gravity = { x: 0, y: -9.81, z: 0 }) {
  if (controller.onGround) {
    controller.groundedFrames++;
    controller.coyoteTime = COYOTE_TIME_FRAMES;
  } else {
    controller.groundedFrames = 0;
    if (controller.coyoteTime > 0) {
      controller.coyoteTime--;
    }
  }
  if (input['Jump' /* Jump */]) {
    controller.jumpBuffer = JUMP_BUFFER_FRAMES;
  } else if (controller.jumpBuffer > 0) {
    controller.jumpBuffer--;
  }
  if (controller.jumpBuffer > 0 && controller.coyoteTime > 0) {
    controller.velocity.y = controller.jumpForce;
    controller.jumpBuffer = 0;
    controller.coyoteTime = 0;
    controller.onGround = false;
  }
  const moveX = input['MoveX' /* MoveX */];
  controller.velocity.x = moveX * controller.speed;
  if (!controller.onGround) {
    controller.velocity.y += gravity.y * dt;
  } else {
    if (controller.velocity.y < 0) {
      controller.velocity.y = 0;
    }
  }
}
function checkGroundContact(position, velocity, _rayDistance = 0.15) {
  return position.y <= 0 && velocity.y <= 0;
}
function applyVelocity(position, velocity, dt) {
  return Vec3Math.add(position, Vec3Math.scale(velocity, dt));
}
function resolveSlopeCollision(controller, slopeAngle) {
  if (slopeAngle > controller.slopeLimit) {
    controller.onGround = false;
  }
}
function handleStepOffset(position, controller, obstacleHeight) {
  if (obstacleHeight <= controller.stepOffset) {
    return { ...position, y: position.y + obstacleHeight };
  }
  return position;
}
function getHorizontalSpeed(velocity) {
  return Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
}
function getMovementDirection(velocity) {
  const horizontal = { x: velocity.x, y: 0, z: velocity.z };
  return Vec3Math.normalize(horizontal);
}

// src/animation/states.ts
var AnimState = /* @__PURE__ */ ((AnimState2) => {
  AnimState2['Idle'] = 'Idle';
  AnimState2['Walk'] = 'Walk';
  AnimState2['Run'] = 'Run';
  AnimState2['Jump'] = 'Jump';
  AnimState2['Fall'] = 'Fall';
  AnimState2['Land'] = 'Land';
  AnimState2['Attack'] = 'Attack';
  return AnimState2;
})(AnimState || {});
var DEFAULT_CLIPS = {
  ['Idle' /* Idle */]: { name: 'idle', duration: 1, loop: true },
  ['Walk' /* Walk */]: { name: 'walk', duration: 0.8, loop: true },
  ['Run' /* Run */]: { name: 'run', duration: 0.6, loop: true },
  ['Jump' /* Jump */]: { name: 'jump', duration: 0.4, loop: false },
  ['Fall' /* Fall */]: { name: 'fall', duration: 0.5, loop: true },
  ['Land' /* Land */]: { name: 'land', duration: 0.3, loop: false },
  ['Attack' /* Attack */]: { name: 'attack', duration: 0.5, loop: false },
};
var ANIM_THRESHOLDS = {
  IDLE_SPEED: 0.1,
  // Below this = idle
  WALK_SPEED: 2,
  // Below this = walk, above = run
  FALL_VELOCITY: -0.5,
  // Below this = falling
  JUMP_VELOCITY: 0.1,
  // Above this = jumping
};

// src/animation/hfsm.ts
function createHFSM(initialState = 'Idle' /* Idle */) {
  return {
    current: initialState,
    previous: initialState,
    transitionProgress: 1,
    transitionDuration: 0.2,
    blendWeights: /* @__PURE__ */ new Map([[initialState, 1]]),
    stateTime: 0,
  };
}
var DEFAULT_TRANSITIONS = [
  // Idle <-> Walk
  {
    from: 'Idle' /* Idle */,
    to: 'Walk' /* Walk */,
    condition: (data) =>
      data.horizontalSpeed > ANIM_THRESHOLDS.IDLE_SPEED &&
      data.horizontalSpeed < ANIM_THRESHOLDS.WALK_SPEED &&
      data.isGrounded,
    duration: 0.2,
  },
  {
    from: 'Walk' /* Walk */,
    to: 'Idle' /* Idle */,
    condition: (data) => data.horizontalSpeed <= ANIM_THRESHOLDS.IDLE_SPEED && data.isGrounded,
    duration: 0.2,
  },
  // Walk <-> Run
  {
    from: 'Walk' /* Walk */,
    to: 'Run' /* Run */,
    condition: (data) => data.horizontalSpeed >= ANIM_THRESHOLDS.WALK_SPEED && data.isGrounded,
    duration: 0.15,
  },
  {
    from: 'Run' /* Run */,
    to: 'Walk' /* Walk */,
    condition: (data) =>
      data.horizontalSpeed < ANIM_THRESHOLDS.WALK_SPEED &&
      data.horizontalSpeed > ANIM_THRESHOLDS.IDLE_SPEED &&
      data.isGrounded,
    duration: 0.15,
  },
  // Any ground -> Jump (with coyote time)
  {
    from: 'Idle' /* Idle */,
    to: 'Jump' /* Jump */,
    condition: (data) =>
      data.verticalVelocity > ANIM_THRESHOLDS.JUMP_VELOCITY || data.coyoteTimeRemaining > 0,
    duration: 0.1,
  },
  {
    from: 'Walk' /* Walk */,
    to: 'Jump' /* Jump */,
    condition: (data) =>
      data.verticalVelocity > ANIM_THRESHOLDS.JUMP_VELOCITY || data.coyoteTimeRemaining > 0,
    duration: 0.1,
  },
  {
    from: 'Run' /* Run */,
    to: 'Jump' /* Jump */,
    condition: (data) =>
      data.verticalVelocity > ANIM_THRESHOLDS.JUMP_VELOCITY || data.coyoteTimeRemaining > 0,
    duration: 0.1,
  },
  // Jump -> Fall
  {
    from: 'Jump' /* Jump */,
    to: 'Fall' /* Fall */,
    condition: (data) => data.verticalVelocity < ANIM_THRESHOLDS.FALL_VELOCITY,
    duration: 0.15,
  },
  // Fall -> Land
  {
    from: 'Fall' /* Fall */,
    to: 'Land' /* Land */,
    condition: (data) => data.isGrounded,
    duration: 0.1,
  },
  // Land -> Idle/Walk/Run
  {
    from: 'Land' /* Land */,
    to: 'Idle' /* Idle */,
    condition: (data) => data.isGrounded && data.horizontalSpeed <= ANIM_THRESHOLDS.IDLE_SPEED,
    duration: 0.2,
  },
  {
    from: 'Land' /* Land */,
    to: 'Walk' /* Walk */,
    condition: (data) =>
      data.isGrounded &&
      data.horizontalSpeed > ANIM_THRESHOLDS.IDLE_SPEED &&
      data.horizontalSpeed < ANIM_THRESHOLDS.WALK_SPEED,
    duration: 0.2,
  },
  {
    from: 'Land' /* Land */,
    to: 'Run' /* Run */,
    condition: (data) => data.isGrounded && data.horizontalSpeed >= ANIM_THRESHOLDS.WALK_SPEED,
    duration: 0.2,
  },
  // Attack transitions (can attack from any grounded state)
  {
    from: 'Idle' /* Idle */,
    to: 'Attack' /* Attack */,
    condition: (data) => data.attackRequested && data.isGrounded,
    duration: 0.1,
  },
  {
    from: 'Walk' /* Walk */,
    to: 'Attack' /* Attack */,
    condition: (data) => data.attackRequested && data.isGrounded,
    duration: 0.1,
  },
  {
    from: 'Run' /* Run */,
    to: 'Attack' /* Attack */,
    condition: (data) => data.attackRequested && data.isGrounded,
    duration: 0.1,
  },
  // Attack -> back to movement
  {
    from: 'Attack' /* Attack */,
    to: 'Idle' /* Idle */,
    condition: (data) =>
      !data.attackRequested && data.horizontalSpeed <= ANIM_THRESHOLDS.IDLE_SPEED,
    duration: 0.2,
  },
  {
    from: 'Attack' /* Attack */,
    to: 'Walk' /* Walk */,
    condition: (data) =>
      !data.attackRequested &&
      data.horizontalSpeed > ANIM_THRESHOLDS.IDLE_SPEED &&
      data.horizontalSpeed < ANIM_THRESHOLDS.WALK_SPEED,
    duration: 0.2,
  },
  {
    from: 'Attack' /* Attack */,
    to: 'Run' /* Run */,
    condition: (data) =>
      !data.attackRequested && data.horizontalSpeed >= ANIM_THRESHOLDS.WALK_SPEED,
    duration: 0.2,
  },
];
function updateHFSM(hfsm, data, dt, transitions = DEFAULT_TRANSITIONS) {
  hfsm.stateTime += dt;
  if (hfsm.transitionProgress < 1) {
    hfsm.transitionProgress = Math.min(1, hfsm.transitionProgress + dt / hfsm.transitionDuration);
  }
  for (const transition of transitions) {
    if (transition.from === hfsm.current && transition.condition(data)) {
      transitionTo(hfsm, transition.to, transition.duration);
      break;
    }
  }
  updateBlendWeights(hfsm, data);
}
function transitionTo(hfsm, newState, duration = 0.2) {
  if (hfsm.current === newState) {
    return;
  }
  hfsm.previous = hfsm.current;
  hfsm.current = newState;
  hfsm.transitionProgress = 0;
  hfsm.transitionDuration = duration;
  hfsm.stateTime = 0;
}
function updateBlendWeights(hfsm, data) {
  hfsm.blendWeights.clear();
  if (hfsm.transitionProgress < 1) {
    const t = hfsm.transitionProgress;
    hfsm.blendWeights.set(hfsm.previous, 1 - t);
    hfsm.blendWeights.set(hfsm.current, t);
  } else {
    if (
      hfsm.current === 'Idle' /* Idle */ ||
      hfsm.current === 'Walk' /* Walk */ ||
      hfsm.current === 'Run' /* Run */
    ) {
      applySpeedBlending(hfsm, data.horizontalSpeed);
    } else {
      hfsm.blendWeights.set(hfsm.current, 1);
    }
  }
}
function applySpeedBlending(hfsm, speed) {
  const { IDLE_SPEED, WALK_SPEED } = ANIM_THRESHOLDS;
  if (speed <= IDLE_SPEED) {
    hfsm.blendWeights.set('Idle' /* Idle */, 1);
  } else if (speed < WALK_SPEED) {
    const t = (speed - IDLE_SPEED) / (WALK_SPEED - IDLE_SPEED);
    hfsm.blendWeights.set('Idle' /* Idle */, 1 - t);
    hfsm.blendWeights.set('Walk' /* Walk */, t);
  } else {
    const t = Math.min(1, (speed - WALK_SPEED) / WALK_SPEED);
    hfsm.blendWeights.set('Walk' /* Walk */, 1 - t);
    hfsm.blendWeights.set('Run' /* Run */, t);
  }
}
function getCurrentClip(hfsm) {
  return hfsm.current;
}
function getBlendWeight(hfsm, state) {
  return hfsm.blendWeights.get(state) || 0;
}

// src/animation/blending.ts
function crossFade(from, to, progress) {
  const t = easeInOutCubic(progress);
  return [
    { ...from, weight: 1 - t },
    { ...to, weight: t },
  ];
}
function blendAnimations(nodes) {
  const totalWeight = nodes.reduce((sum, node) => sum + node.weight, 0);
  if (totalWeight === 0) {
    return nodes;
  }
  return nodes.map((node) => ({
    ...node,
    weight: node.weight / totalWeight,
  }));
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}
function easeInQuad(t) {
  return t * t;
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

// src/adapters/side2d.ts
function createSide2DAdapter(orthoSize = 10, followDamping = 0.1) {
  return {
    clampZ: true,
    orthoSize,
    followTarget: null,
    followDamping,
    cameraPosition: { x: 0, y: 5, z: 10 },
    cameraOffset: { x: 0, y: 2, z: 0 },
  };
}
function createOrthoCamera(size, aspect, near = 0.1, far = 1e3) {
  return {
    position: { x: 0, y: 5, z: 10 },
    target: { x: 0, y: 0, z: 0 },
    size,
    aspect,
    near,
    far,
  };
}
function constrainMovement(velocity) {
  return {
    x: velocity.x,
    y: velocity.y,
    z: 0,
    // Always clamp Z
  };
}
function constrainPosition(position) {
  return {
    x: position.x,
    y: position.y,
    z: 0,
  };
}
function followTarget(camera, targetPos, offset, damping, dt) {
  const desiredPos = {
    x: targetPos.x + offset.x,
    y: targetPos.y + offset.y,
    z: camera.position.z,
    // Keep Z fixed
  };
  const lerpFactor = 1 - Math.exp(-damping * dt * 60);
  camera.position.x += (desiredPos.x - camera.position.x) * lerpFactor;
  camera.position.y += (desiredPos.y - camera.position.y) * lerpFactor;
  camera.target.x = camera.position.x;
  camera.target.y = camera.position.y;
  camera.target.z = 0;
}
function worldToScreen(pos, camera, screenWidth, screenHeight) {
  const halfHeight = camera.size / 2;
  const halfWidth = (camera.size * camera.aspect) / 2;
  const relX = pos.x - (camera.position.x - halfWidth);
  const relY = pos.y - (camera.position.y - halfHeight);
  const screenX = (relX / (halfWidth * 2)) * screenWidth;
  const screenY = screenHeight - (relY / (halfHeight * 2)) * screenHeight;
  return [screenX, screenY];
}
function screenToWorld(x, y, camera, screenWidth, screenHeight) {
  const halfHeight = camera.size / 2;
  const halfWidth = (camera.size * camera.aspect) / 2;
  const normX = x / screenWidth;
  const normY = 1 - y / screenHeight;
  const worldX = camera.position.x - halfWidth + normX * halfWidth * 2;
  const worldY = camera.position.y - halfHeight + normY * halfHeight * 2;
  return { x: worldX, y: worldY, z: 0 };
}
function getCameraBounds(camera) {
  const halfHeight = camera.size / 2;
  const halfWidth = (camera.size * camera.aspect) / 2;
  return {
    left: camera.position.x - halfWidth,
    right: camera.position.x + halfWidth,
    top: camera.position.y + halfHeight,
    bottom: camera.position.y - halfHeight,
  };
}
function isVisible(pos, camera) {
  const bounds = getCameraBounds(camera);
  return (
    pos.x >= bounds.left && pos.x <= bounds.right && pos.y >= bounds.bottom && pos.y <= bounds.top
  );
}

// src/prefabs/player.ts
var import_ecs = require('@om/ecs');
var TransformComponent = (0, import_ecs.defineComponent)('Transform');
var VelocityComponent = (0, import_ecs.defineComponent)('Velocity');
var CharacterComponent = (0, import_ecs.defineComponent)('Character');
var AnimationComponent = (0, import_ecs.defineComponent)('Animation');
var AvatarDataComponent = (0, import_ecs.defineComponent)('AvatarData');
var PlayerComponent = (0, import_ecs.defineComponent)('Player');
function spawnPlayer(world, options = {}) {
  const { position = [0, 2, 0], avatarConfig = null, speed = 5, jumpForce = 10 } = options;
  const entity = (0, import_ecs.spawn)(world);
  (0, import_ecs.add)(world, TransformComponent, entity, createTransform(position));
  (0, import_ecs.add)(world, VelocityComponent, entity, createVelocity());
  const controller = createCharacterController({ speed, jumpForce });
  (0, import_ecs.add)(world, CharacterComponent, entity, controller);
  (0, import_ecs.add)(world, AnimationComponent, entity, createHFSM());
  if (avatarConfig) {
    (0, import_ecs.add)(world, AvatarDataComponent, entity, avatarConfig);
  }
  (0, import_ecs.add)(world, PlayerComponent, entity, { id: 'player' });
  return entity;
}
function spawnPlatform(world, position, size) {
  const entity = (0, import_ecs.spawn)(world);
  (0, import_ecs.add)(world, TransformComponent, entity, createTransform(position));
  const PlatformComponent = (0, import_ecs.defineComponent)('Platform');
  (0, import_ecs.add)(world, PlatformComponent, entity, { size });
  return entity;
}

// src/assets/registry.ts
var cachedRegistry = null;
async function loadRegistry() {
  if (cachedRegistry) {
    return cachedRegistry;
  }
  try {
    const response = await fetch('/assets/registry.json');
    if (!response.ok) {
      throw new Error(`Failed to load registry: ${response.statusText}`);
    }
    const registry = await response.json();
    cachedRegistry = registry;
    return cachedRegistry;
  } catch (error) {
    console.error('Failed to load asset registry:', error);
    return createFallbackRegistry();
  }
}
function getAsset(registry, id) {
  return registry.assets[id];
}
function listAssetsBySlot(registry, slot, options = {}) {
  const assets = Object.values(registry.assets);
  return assets.filter((asset) => {
    if (asset.slot !== slot) {
      return false;
    }
    if (options.nsfw !== void 0 && asset.nsfw !== options.nsfw) {
      return false;
    }
    return true;
  });
}
function getFallback(registry, slot) {
  const fallbackId = registry.fallbacks[slot];
  return fallbackId ? getAsset(registry, fallbackId) : void 0;
}
function getSafeAlternative(registry, assetId) {
  const asset = getAsset(registry, assetId);
  if (!asset) {
    return void 0;
  }
  if (!asset.nsfw) {
    return asset;
  }
  const safeAssets = listAssetsBySlot(registry, asset.slot, { nsfw: false });
  return safeAssets[0] || getFallback(registry, asset.slot);
}
function validateRegistry(registry) {
  const errors = [];
  if (registry.version !== 1) {
    errors.push(`Invalid registry version: ${registry.version}`);
  }
  const slots = ['Head', 'Torso', 'Legs', 'Accessory'];
  for (const slot of slots) {
    const fallbackId = registry.fallbacks[slot];
    if (!fallbackId) {
      errors.push(`Missing fallback for slot: ${slot}`);
      continue;
    }
    const fallback = getAsset(registry, fallbackId);
    if (!fallback) {
      errors.push(`Fallback asset not found: ${fallbackId} for slot ${slot}`);
    } else if (fallback.nsfw) {
      errors.push(`Fallback asset is NSFW: ${fallbackId} for slot ${slot}`);
    }
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
function createFallbackRegistry() {
  return {
    version: 1,
    assets: {},
    fallbacks: {
      Head: '',
      Torso: '',
      Legs: '',
      Accessory: '',
    },
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    ANIM_THRESHOLDS,
    AnimState,
    AnimationComponent,
    AvatarDataComponent,
    CharacterComponent,
    DEFAULT_CLIPS,
    DEFAULT_INPUT_MAP,
    DEFAULT_TRANSITIONS,
    PlayerComponent,
    RigidBodyType,
    TransformComponent,
    Vec3Math,
    VelocityComponent,
    applyImpulse,
    applyVelocity,
    blendAnimations,
    checkGroundContact,
    checkGrounded,
    constrainMovement,
    constrainPosition,
    createActionState,
    createBoxCollider,
    createCapsuleCollider,
    createCharacterController,
    createDynamicBody,
    createFixedBody,
    createHFSM,
    createInputSystem,
    createKinematicBody,
    createOrthoCamera,
    createRapierWorld,
    createSide2DAdapter,
    createSphereCollider,
    createTransform,
    createVelocity,
    crossFade,
    easeInOutCubic,
    easeInQuad,
    easeOutQuad,
    followTarget,
    getAsset,
    getBlendWeight,
    getBodyPosition,
    getBodyVelocity,
    getCameraBounds,
    getCurrentClip,
    getFallback,
    getHorizontalSpeed,
    getMovementDirection,
    getSafeAlternative,
    handleStepOffset,
    isVisible,
    justPressed,
    justReleased,
    lerp,
    listAssetsBySlot,
    loadRegistry,
    pollInput,
    remapAction,
    resolveSlopeCollision,
    screenToWorld,
    setBodyPosition,
    setBodyVelocity,
    setInputEnabled,
    smoothStep,
    spawnPlatform,
    spawnPlayer,
    stepPhysics,
    transitionTo,
    updateCharacter,
    updateHFSM,
    validateRegistry,
    worldToScreen,
  });
