'use client';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { AudioListener, AudioLoader, PositionalAudio } from 'three';

// Game Engine Types
export interface GameConfig {
  width: number;
  height: number;
  pixelRatio: number;
  antialias: boolean;
  shadowMap: boolean;
  toneMapping: boolean;
  physics: boolean;
  audio: boolean;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  lives: number;
  time: number;
  deltaTime: number;
}

export interface GameInput {
  keys: Set<string>;
  mouse: {
    x: number;
    y: number;
    buttons: Set<number>;
  };
  gamepad: {
    connected: boolean;
    buttons: boolean[];
    axes: number[];
  };
}

export interface GameEntity {
  id: string;
  mesh: THREE.Object3D;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Euler;
  mass: number;
  collider?: THREE.Box3 | THREE.Sphere;
  isActive: boolean;
  update: (deltaTime: number, input: GameInput) => void;
  onCollision?: (other: GameEntity) => void;
}

export interface GameScene {
  name: string;
  entities: Map<string, GameEntity>;
  lights: THREE.Light[];
  environment: THREE.Object3D;
  skybox?: THREE.CubeTexture;
  fog?: THREE.Fog;
  gravity: THREE.Vector3;
  bounds: THREE.Box3;
}

export interface GameAudio {
  listener: AudioListener;
  sounds: Map<string, AudioBuffer>;
  music: Map<string, AudioBuffer>;
  currentMusic?: PositionalAudio;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
}

// Game Engine Class
export class GameEngine {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private animationId: number | null = null;

  private config: GameConfig;
  private state: GameState;
  private input: GameInput;
  private audio: GameAudio;
  private currentScene: GameScene | null = null;

  private loader: GLTFLoader;
  private audioLoader: AudioLoader;

  // Event callbacks
  private onStateChange?: (state: GameState) => void;
  private onScoreChange?: (score: number) => void;
  private onLevelComplete?: (level: number) => void;
  private onGameOver?: (finalScore: number) => void;

  constructor(config: Partial<GameConfig> = {}) {
    this.config = {
      width: 800,
      height: 600,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      antialias: true,
      shadowMap: true,
      toneMapping: true,
      physics: true,
      audio: true,
      ...config,
    };

    this.state = {
      isRunning: false,
      isPaused: false,
      score: 0,
      level: 1,
      lives: 3,
      time: 0,
      deltaTime: 0,
    };

    this.input = {
      keys: new Set(),
      mouse: { x: 0, y: 0, buttons: new Set() },
      gamepad: { connected: false, buttons: [], axes: [] },
    };

    this.audio = {
      listener: new AudioListener(),
      sounds: new Map(),
      music: new Map(),
      masterVolume: 1.0,
      sfxVolume: 0.8,
      musicVolume: 0.6,
    };

    this.clock = new THREE.Clock();
    this.loader = new GLTFLoader();
    this.audioLoader = new AudioLoader();

    // Setup DRACO loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    this.loader.setDRACOLoader(dracoLoader);

    this.initRenderer();
    this.initCamera();
    this.initScene();
    this.initInput();
    this.initAudio();
  }

  // Initialize WebGL renderer
  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.config.antialias,
      alpha: true,
    });

    this.renderer.setSize(this.config.width, this.config.height);
    this.renderer.setPixelRatio(this.config.pixelRatio);
    this.renderer.shadowMap.enabled = this.config.shadowMap;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = this.config.toneMapping
      ? THREE.ACESFilmicToneMapping
      : THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  // Initialize camera
  private initCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.width / this.config.height,
      0.1,
      1000,
    );
    this.camera.position.set(0, 5, 10);
    this.camera.add(this.audio.listener);
  }

  // Initialize scene
  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080611);

    // Add fog for depth
    this.scene.fog = new THREE.Fog(0x080611, 10, 50);
  }

  // Initialize input handling
  private initInput(): void {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
      this.input.keys.add(e.code);
      e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
      this.input.keys.delete(e.code);
    });

    // Mouse input
    document.addEventListener('mousemove', (e) => {
      this.input.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.input.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    document.addEventListener('mousedown', (e) => {
      this.input.mouse.buttons.add(e.button);
    });

    document.addEventListener('mouseup', (e) => {
      this.input.mouse.buttons.delete(e.button);
    });

    // Gamepad input
    window.addEventListener('gamepadconnected', (_e) => {
      this.input.gamepad.connected = true;
      // Gamepad connected (logging disabled for production)
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.input.gamepad.connected = false;
      // Gamepad disconnected (logging disabled for production)
    });
  }

  // Initialize audio system
  private initAudio(): void {
    if (!this.config.audio) return;

    // Load common sounds
    this.loadSound('click', '/audio/sfx/click.wav');
    this.loadSound('hover', '/audio/sfx/hover.wav');
    this.loadSound('success', '/audio/sfx/success.wav');
    this.loadSound('error', '/audio/sfx/error.wav');
    this.loadSound('explosion', '/audio/sfx/explosion.wav');
  }

  // Load sound effect
  async loadSound(name: string, url: string): Promise<void> {
    try {
      const buffer = await this.audioLoader.loadAsync(url);
      this.audio.sounds.set(name, buffer);
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  }

  // Play sound effect
  playSound(name: string, volume: number = 1.0): void {
    if (!this.config.audio) return;

    const buffer = this.audio.sounds.get(name);
    if (!buffer) return;

    const sound = new PositionalAudio(this.audio.listener);
    sound.setBuffer(buffer);
    sound.setVolume(volume * this.audio.sfxVolume * this.audio.masterVolume);
    sound.play();
  }

  // Load music
  async loadMusic(name: string, url: string): Promise<void> {
    try {
      const buffer = await this.audioLoader.loadAsync(url);
      this.audio.music.set(name, buffer);
    } catch (error) {
      console.warn(`Failed to load music: ${name}`, error);
    }
  }

  // Play music
  playMusic(name: string, loop: boolean = true, volume: number = 1.0): void {
    if (!this.config.audio) return;

    const buffer = this.audio.music.get(name);
    if (!buffer) return;

    // Stop current music
    if (this.audio.currentMusic) {
      this.audio.currentMusic.stop();
    }

    this.audio.currentMusic = new PositionalAudio(this.audio.listener);
    this.audio.currentMusic.setBuffer(buffer);
    this.audio.currentMusic.setLoop(loop);
    this.audio.currentMusic.setVolume(volume * this.audio.musicVolume * this.audio.masterVolume);
    this.audio.currentMusic.play();
  }

  // Stop music
  stopMusic(): void {
    if (this.audio.currentMusic) {
      this.audio.currentMusic.stop();
      this.audio.currentMusic = undefined;
    }
  }

  // Set volume
  setVolume(type: 'master' | 'sfx' | 'music', volume: number): void {
    switch (type) {
      case 'master':
        this.audio.masterVolume = Math.max(0, Math.min(1, volume));
        break;
      case 'sfx':
        this.audio.sfxVolume = Math.max(0, Math.min(1, volume));
        break;
      case 'music':
        this.audio.musicVolume = Math.max(0, Math.min(1, volume));
        break;
    }
  }

  // Create game scene
  createScene(name: string): GameScene {
    const scene: GameScene = {
      name,
      entities: new Map(),
      lights: [],
      environment: new THREE.Group(),
      gravity: new THREE.Vector3(0, -9.82, 0),
      bounds: new THREE.Box3(new THREE.Vector3(-50, -50, -50), new THREE.Vector3(50, 50, 50)),
    };

    return scene;
  }

  // Set current scene
  setScene(scene: GameScene): void {
    this.currentScene = scene;

    // Clear existing scene
    this.scene.clear();
    this.scene.background = new THREE.Color(0x080611);

    // Add scene elements
    this.scene.add(scene.environment);
    scene.lights.forEach((light) => this.scene.add(light));

    // Add entities
    scene.entities.forEach((entity) => {
      if (entity.isActive) {
        this.scene.add(entity.mesh);
      }
    });
  }

  // Add entity to scene
  addEntity(scene: GameScene, entity: GameEntity): void {
    scene.entities.set(entity.id, entity);
    if (entity.isActive) {
      this.scene.add(entity.mesh);
    }
  }

  // Remove entity from scene
  removeEntity(scene: GameScene, entityId: string): void {
    const entity = scene.entities.get(entityId);
    if (entity) {
      this.scene.remove(entity.mesh);
      scene.entities.delete(entityId);
    }
  }

  // Update game state
  updateState(updates: Partial<GameState>): void {
    Object.assign(this.state, updates);
    this.onStateChange?.(this.state);
  }

  // Add score
  addScore(points: number): void {
    this.state.score += points;
    this.onScoreChange?.(this.state.score);
  }

  // Set score
  setScore(score: number): void {
    this.state.score = score;
    this.onScoreChange?.(this.state.score);
  }

  // Next level
  nextLevel(): void {
    this.state.level++;
    this.onLevelComplete?.(this.state.level);
  }

  // Game over
  gameOver(): void {
    this.state.isRunning = false;
    this.onGameOver?.(this.state.score);
  }

  // Start game
  start(): void {
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.clock.start();
    this.animate();
  }

  // Pause game
  pause(): void {
    this.state.isPaused = true;
    this.clock.stop();
  }

  // Resume game
  resume(): void {
    this.state.isPaused = false;
    this.clock.start();
    this.animate();
  }

  // Stop game
  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.clock.stop();

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Animation loop
  private animate(): void {
    if (!this.state.isRunning || this.state.isPaused) return;

    this.state.deltaTime = this.clock.getDelta();
    this.state.time += this.state.deltaTime;

    // Update gamepad input
    this.updateGamepadInput();

    // Update current scene
    if (this.currentScene) {
      this.updateScene(this.currentScene);
    }

    // Render
    this.renderer.render(this.scene, this.camera);

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  // Update gamepad input
  private updateGamepadInput(): void {
    if (!this.input.gamepad.connected) return;

    const gamepad = navigator.getGamepads()[0];
    if (!gamepad) return;

    this.input.gamepad.buttons = Array.from(gamepad.buttons.map((button) => button.pressed));
    this.input.gamepad.axes = Array.from(gamepad.axes);
  }

  // Update scene
  private updateScene(scene: GameScene): void {
    // Update entities
    scene.entities.forEach((entity) => {
      if (entity.isActive) {
        entity.update(this.state.deltaTime, this.input);

        // Update physics
        if (this.config.physics) {
          this.updatePhysics(entity, scene);
        }
      }
    });

    // Check collisions
    if (this.config.physics) {
      this.checkCollisions(scene);
    }
  }

  // Update physics for entity
  private updatePhysics(entity: GameEntity, scene: GameScene): void {
    // Apply gravity
    entity.velocity.add(scene.gravity.clone().multiplyScalar(this.state.deltaTime));

    // Update position
    entity.position.add(entity.velocity.clone().multiplyScalar(this.state.deltaTime));
    entity.mesh.position.copy(entity.position);

    // Update rotation
    entity.rotation.x += entity.angularVelocity.x * this.state.deltaTime;
    entity.rotation.y += entity.angularVelocity.y * this.state.deltaTime;
    entity.rotation.z += entity.angularVelocity.z * this.state.deltaTime;
    entity.mesh.rotation.copy(entity.rotation);

    // Update scale
    entity.mesh.scale.copy(entity.scale);

    // Check bounds
    if (entity.collider) {
      const bounds = entity.collider.clone();
      bounds.applyMatrix4(entity.mesh.matrixWorld);

      if (bounds instanceof THREE.Box3 && !scene.bounds.containsBox(bounds)) {
        // Handle out of bounds
        this.handleOutOfBounds(entity);
      }
    }
  }

  // Check collisions between entities
  private checkCollisions(scene: GameScene): void {
    const entities = Array.from(scene.entities.values());

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];

        if (!entityA.isActive || !entityB.isActive) continue;
        if (!entityA.collider || !entityB.collider) continue;

        if (this.checkCollision(entityA, entityB)) {
          entityA.onCollision?.(entityB);
          entityB.onCollision?.(entityA);
        }
      }
    }
  }

  // Check collision between two entities
  private checkCollision(entityA: GameEntity, entityB: GameEntity): boolean {
    if (!entityA.collider || !entityB.collider) return false;

    const boundsA = entityA.collider.clone();
    boundsA.applyMatrix4(entityA.mesh.matrixWorld);

    const boundsB = entityB.collider.clone();
    boundsB.applyMatrix4(entityB.mesh.matrixWorld);

    return (
      boundsA instanceof THREE.Box3 &&
      boundsB instanceof THREE.Box3 &&
      boundsA.intersectsBox(boundsB)
    );
  }

  // Handle entity out of bounds
  private handleOutOfBounds(entity: GameEntity): void {
    // Default behavior: remove entity
    entity.isActive = false;
    this.scene.remove(entity.mesh);
  }

  // Load 3D model
  async loadModel(url: string): Promise<THREE.Group> {
    try {
      const gltf = await this.loader.loadAsync(url);
      return gltf.scene;
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  // Create entity from mesh
  createEntity(id: string, mesh: THREE.Object3D, options: Partial<GameEntity> = {}): GameEntity {
    const entity: GameEntity = {
      id,
      mesh,
      position: mesh.position.clone(),
      rotation: mesh.rotation.clone(),
      scale: mesh.scale.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      angularVelocity: new THREE.Euler(0, 0, 0),
      mass: 1,
      isActive: true,
      update: () => {},
      ...options,
    };

    return entity;
  }

  // Get renderer DOM element
  getDOMElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  // Get current state
  getState(): GameState {
    return { ...this.state };
  }

  // Get current input
  getInput(): GameInput {
    return { ...this.input };
  }

  // Set event callbacks
  setOnStateChange(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }

  setOnScoreChange(callback: (score: number) => void): void {
    this.onScoreChange = callback;
  }

  setOnLevelComplete(callback: (level: number) => void): void {
    this.onLevelComplete = callback;
  }

  setOnGameOver(callback: (finalScore: number) => void): void {
    this.onGameOver = callback;
  }

  // Cleanup
  dispose(): void {
    this.stop();
    this.renderer.dispose();
    // Audio listener cleanup is handled automatically
  }
}

// Export utility functions
export const createGameEngine = (config?: Partial<GameConfig>) => new GameEngine(config);
export const createGameEntity = (id: string, mesh: THREE.Object3D, options?: Partial<GameEntity>) =>
  new GameEngine().createEntity(id, mesh, options);
