import * as THREE from 'three';
import { type GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer, type AnimationClip, type AnimationAction, LoopRepeat } from 'three';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

export interface AnimationState {
  name: string;
  clip: AnimationClip;
  action: AnimationAction;
  weight: number;
  enabled: boolean;
  loop: boolean;
  timeScale: number;
  fadeTime: number;
  }

export interface AnimationTransition {
  from: string;
  to: string;
  condition?: () => boolean;
  fadeTime?: number;
  blendMode?: 'replace' | 'add' | 'crossfade';
  }

export interface AnimationBlendTree {
  name: string;
  parameter: string;
  clips: Array<{
    clip: AnimationClip;
    threshold: number;
    weight?: number;
  }>;
}

export interface AnimationControllerOptions {
  autoPlay?: boolean;
  defaultState?: string;
  crossfadeTime?: number;
  enableBlending?: boolean;
  maxBlendStates?: number;
  }

export class AnimationController {
  private mixer: AnimationMixer;
  private states: Map<string, AnimationState> = new Map();
  private transitions: Map<string, AnimationTransition[]> = new Map();
  private blendTrees: Map<string, AnimationBlendTree> = new Map();
  private currentState: string | null = null;
  private parameters: Map<string, number> = new Map();
  private clock: THREE.Clock;

  private options: AnimationControllerOptions;
  private isPlaying: boolean = false;
  private lastUpdateTime: number = 0;

  constructor(
    private scene: THREE.Object3D,
    private animations: AnimationClip[],
    options: AnimationControllerOptions = {},
  ) {
    this.mixer = new AnimationMixer(scene);
    this.clock = new THREE.Clock();
    this.options = {
      autoPlay: true,
      defaultState: 'idle',
      crossfadeTime: 0.3,
      enableBlending: true,
      maxBlendStates: 4,
      ...options,
    };

    this.initializeAnimations();
    this.setupDefaultStates();
  }

  private initializeAnimations() {
    this.animations.forEach((clip) => {
      const action = this.mixer.clipAction(clip);
      action.setLoop(LoopRepeat, Infinity);
      action.weight = 0;
      action.enabled = false;

      this.states.set(clip.name, {
        name: clip.name,
        clip,
        action,
        weight: 0,
        enabled: false,
        loop: true,
        timeScale: 1.0,
        fadeTime: this.options.crossfadeTime!,
      });
    });
  }

  private setupDefaultStates() {
    // Setup common animation states
    this.setupIdleAnimations();
    this.setupMovementAnimations();
    this.setupEmotionAnimations();
    this.setupFacialExpressions();
    this.setupSpecialAnimations();

    // Setup default transitions
    this.setupDefaultTransitions();

    // Start with default state
    if (this.options.autoPlay && this.options.defaultState) {
      this.setState(this.options.defaultState);
    }
  }

  private setupIdleAnimations() {
    // Idle animation variations
    const idleAnimations = ['idle', 'idle_2', 'idle_3', 'breathe', 'look_around'];
    idleAnimations.forEach((name) => {
      if (this.states.has(name)) {
        this.states.get(name)!.loop = true;
        this.states.get(name)!.timeScale = 0.8 + Math.random() * 0.4; // Vary speed slightly
      }
    });
  }

  private setupMovementAnimations() {
    // Movement animations
    const movementAnimations = [
      { name: 'walk', timeScale: 1.0, loop: true },
      { name: 'run', timeScale: 1.2, loop: true },
      { name: 'sprint', timeScale: 1.5, loop: true },
      { name: 'jump', timeScale: 1.0, loop: false },
      { name: 'land', timeScale: 1.0, loop: false },
      { name: 'crouch', timeScale: 1.0, loop: true },
      { name: 'crawl', timeScale: 0.8, loop: true },
      { name: 'swim', timeScale: 1.0, loop: true },
      { name: 'climb', timeScale: 1.0, loop: true },
    ];

    movementAnimations.forEach(({ name, timeScale, loop }) => {
      if (this.states.has(name)) {
        this.states.get(name)!.timeScale = timeScale;
        this.states.get(name)!.loop = loop;
      }
    });
  }

  private setupEmotionAnimations() {
    // Emotion and expression animations
    const emotionAnimations = [
      { name: 'happy', timeScale: 1.0, loop: false },
      { name: 'sad', timeScale: 0.8, loop: false },
      { name: 'angry', timeScale: 1.2, loop: false },
      { name: 'surprised', timeScale: 1.0, loop: false },
      { name: 'confused', timeScale: 0.9, loop: false },
      { name: 'excited', timeScale: 1.3, loop: false },
      { name: 'tired', timeScale: 0.7, loop: true },
      { name: 'proud', timeScale: 1.0, loop: false },
      { name: 'shy', timeScale: 0.8, loop: false },
      { name: 'cheerful', timeScale: 1.1, loop: true },
    ];

    emotionAnimations.forEach(({ name, timeScale, loop }) => {
      if (this.states.has(name)) {
        this.states.get(name)!.timeScale = timeScale;
        this.states.get(name)!.loop = loop;
      }
    });
  }

  private setupFacialExpressions() {
    // Facial expression blend shapes (if available)
    const facialExpressions = [
      'smile',
      'frown',
      'surprise',
      'anger',
      'fear',
      'disgust',
      'sadness',
      'wink_left',
      'wink_right',
      'blink',
      'eyebrow_raise',
      'eyebrow_furrow',
      'mouth_open',
      'mouth_pucker',
      'cheek_puff',
      'nose_scrunch',
    ];

    facialExpressions.forEach((name) => {
      if (this.states.has(name)) {
        this.states.get(name)!.loop = false;
        this.states.get(name)!.timeScale = 1.0;
      }
    });
  }

  private setupSpecialAnimations() {
    // Special and dance animations
    const specialAnimations = [
      { name: 'dance_1', timeScale: 1.0, loop: true },
      { name: 'dance_2', timeScale: 1.2, loop: true },
      { name: 'dance_3', timeScale: 0.9, loop: true },
      { name: 'pose_1', timeScale: 1.0, loop: false },
      { name: 'pose_2', timeScale: 1.0, loop: false },
      { name: 'victory', timeScale: 1.0, loop: false },
      { name: 'defeat', timeScale: 0.8, loop: false },
      { name: 'celebration', timeScale: 1.1, loop: true },
      { name: 'wave', timeScale: 1.0, loop: false },
      { name: 'bow', timeScale: 1.0, loop: false },
      { name: 'salute', timeScale: 1.0, loop: false },
      { name: 'thumbs_up', timeScale: 1.0, loop: false },
    ];

    specialAnimations.forEach(({ name, timeScale, loop }) => {
      if (this.states.has(name)) {
        this.states.get(name)!.timeScale = timeScale;
        this.states.get(name)!.loop = loop;
      }
    });
  }

  private setupDefaultTransitions() {
    // Basic locomotion transitions
    this.addTransition('idle', 'walk', () => this.getParameter('speed') > 0.1, 0.2);
    this.addTransition('walk', 'idle', () => this.getParameter('speed') < 0.1, 0.2);
    this.addTransition('walk', 'run', () => this.getParameter('speed') > 0.7, 0.3);
    this.addTransition('run', 'walk', () => this.getParameter('speed') < 0.7, 0.3);

    // Jump transitions
    this.addTransition('idle', 'jump', () => this.getParameter('jump') > 0.5, 0.1);
    this.addTransition('walk', 'jump', () => this.getParameter('jump') > 0.5, 0.1);
    this.addTransition('run', 'jump', () => this.getParameter('jump') > 0.5, 0.1);
    this.addTransition('jump', 'idle', () => this.getParameter('grounded') > 0.5, 0.3);

    // Attack transitions
    this.addTransition('idle', 'attack', () => this.getParameter('attack') > 0.5, 0.1);
    this.addTransition('walk', 'attack', () => this.getParameter('attack') > 0.5, 0.1);
    this.addTransition('attack', 'idle', () => this.getParameter('attack') < 0.1, 0.2);

    // NSFW transitions (if available)
    if (this.hasState('nsfw_idle')) {
      this.addTransition('idle', 'nsfw_idle', () => this.getParameter('nsfw_mode') > 0.5, 0.5);
      this.addTransition('nsfw_idle', 'idle', () => this.getParameter('nsfw_mode') < 0.5, 0.5);
      this.addTransition(
        'nsfw_idle',
        'nsfw_action',
        () => this.getParameter('nsfw_action') > 0.5,
        0.3,
      );
      this.addTransition(
        'nsfw_action',
        'nsfw_idle',
        () => this.getParameter('nsfw_action') < 0.1,
        0.4,
      );
    }
  }

  // State management
  setState(stateName: string, fadeTime?: number): boolean {
    if (!this.hasState(stateName)) {
      getLogger().then((logger) => {
        logger.warn(`Animation state '${stateName}' not found`);
      });
      return false;
    }

    const newState = this.states.get(stateName)!;
    const actualFadeTime = fadeTime ?? newState.fadeTime;

    // Fade out current state
    if (this.currentState && this.currentState !== stateName) {
      const currentState = this.states.get(this.currentState)!;
      this.fadeOut(currentState, actualFadeTime);
    }

    // Fade in new state
    this.fadeIn(newState, actualFadeTime);
    this.currentState = stateName;

    return true;
  }

  private fadeIn(state: AnimationState, fadeTime: number) {
    state.enabled = true;
    state.action.reset();
    state.action.enabled = true;
    state.action.play();

    const existingAction = this.mixer.existingAction(state.clip);
    if (existingAction) {
      existingAction.fadeIn(fadeTime);
    }
  }

  private fadeOut(state: AnimationState, fadeTime: number) {
    const existingAction = this.mixer.existingAction(state.clip);
    if (existingAction) {
      existingAction.fadeOut(fadeTime);
    }

    // Disable after fade
    setTimeout(() => {
      state.action.enabled = false;
      state.action.stop();
    }, fadeTime * 1000);
  }

  // Parameter system
  setParameter(name: string, value: number) {
    this.parameters.set(name, value);
    this.updateBlendTrees();
  }

  getParameter(name: string): number {
    return this.parameters.get(name) ?? 0;
  }

  // Transition system
  addTransition(
    from: string,
    to: string,
    condition: () => boolean,
    fadeTime?: number,
    blendMode?: 'replace' | 'add' | 'crossfade',
  ) {
    if (!this.transitions.has(from)) {
      this.transitions.set(from, []);
    }

    this.transitions.get(from)!.push({
      from,
      to,
      condition,
      fadeTime: fadeTime ?? this.options.crossfadeTime,
      blendMode: blendMode ?? 'replace',
    });
  }

  // Blend tree system
  addBlendTree(
    name: string,
    parameter: string,
    clips: Array<{ clip: AnimationClip; threshold: number; weight?: number }>,
  ) {
    this.blendTrees.set(name, {
      name,
      parameter,
      clips: clips.map((c) => ({ ...c, weight: c.weight ?? 1.0 })),
    });
  }

  private updateBlendTrees() {
    this.blendTrees.forEach((blendTree) => {
      const paramValue = this.getParameter(blendTree.parameter);

      // Calculate weights for each clip in the blend tree
      blendTree.clips.forEach((clipData, index) => {
        let weight = 0;

        if (index === 0 && paramValue <= clipData.threshold) {
          weight = 1;
        } else if (index === blendTree.clips.length - 1 && paramValue >= clipData.threshold) {
          weight = 1;
        } else if (index > 0 && index < blendTree.clips.length - 1) {
          const prevThreshold = blendTree.clips[index - 1].threshold;
          const nextThreshold = blendTree.clips[index + 1].threshold;

          if (paramValue >= prevThreshold && paramValue <= nextThreshold) {
            const t = (paramValue - prevThreshold) / (nextThreshold - prevThreshold);
            weight = index === 0 ? 1 - t : t;
          }
        }

        weight *= clipData.weight || 1.0;

        const state = this.states.get(clipData.clip.name);
        if (state) {
          state.weight = weight * (clipData.weight || 1.0);
          state.action.weight = weight * (clipData.weight || 1.0);
        }
      });
    });
  }

  // Animation control
  play() {
    this.isPlaying = true;
    this.lastUpdateTime = this.clock.getElapsedTime();
  }

  pause() {
    this.isPlaying = false;
  }

  stop() {
    this.isPlaying = false;
    this.currentState = null;
    this.states.forEach((state) => {
      state.action.stop();
      state.action.enabled = false;
      state.weight = 0;
    });
  }

  // Update loop
  update() {
    if (!this.isPlaying) return;

    const _deltaTime = this.clock.getDelta();

    // Update mixer
    this.mixer.update(_deltaTime);

    // Check transitions
    if (this.currentState) {
      const transitions = this.transitions.get(this.currentState);
      if (transitions) {
        for (const transition of transitions) {
          if (transition.condition && transition.condition()) {
            this.setState(transition.to, transition.fadeTime);
            break;
          }
        }
      }
    }

    // Update blend trees
    this.updateBlendTrees();
  }

  // Utility methods
  hasState(stateName: string): boolean {
    return this.states.has(stateName);
  }

  getCurrentState(): string | null {
    return this.currentState;
  }

  getStateWeight(stateName: string): number {
    const state = this.states.get(stateName);
    return state ? state.weight : 0;
  }

  // Animation speed control
  setTimeScale(scale: number) {
    this.states.forEach((state) => {
      state.action.timeScale = scale;
    });
  }

  setStateTimeScale(stateName: string, scale: number) {
    const state = this.states.get(stateName);
    if (state) {
      state.action.timeScale = scale;
    }
  }

  // Event system
  private eventListeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(...args));
    }
  }

  // Cleanup
  dispose() {
    this.stop();
    this.mixer.stopAllAction();
    this.states.clear();
    this.transitions.clear();
    this.blendTrees.clear();
    this.parameters.clear();
    this.eventListeners.clear();
  }
}

// Animation presets for common character types
export const AnimationPresets = {
  // Basic humanoid animations
  humanoid: {
    states: ['idle', 'walk', 'run', 'jump', 'attack', 'emote'],
    parameters: ['speed', 'jump', 'attack', 'grounded', 'direction'],
    transitions: [
      { from: 'idle', to: 'walk', condition: 'speed > 0.1' },
      { from: 'walk', to: 'idle', condition: 'speed < 0.1' },
      { from: 'walk', to: 'run', condition: 'speed > 0.7' },
      { from: 'run', to: 'walk', condition: 'speed < 0.7' },
      { from: 'idle', to: 'jump', condition: 'jump > 0.5' },
      { from: 'walk', to: 'jump', condition: 'jump > 0.5' },
      { from: 'jump', to: 'idle', condition: 'grounded > 0.5' },
    ],
  },

  // NSFW character animations
  nsfw: {
    states: ['idle', 'nsfw_idle', 'nsfw_action', 'nsfw_transition', 'emote'],
    parameters: ['speed', 'nsfw_mode', 'nsfw_action', 'nsfw_intensity', 'grounded'],
    transitions: [
      { from: 'idle', to: 'nsfw_idle', condition: 'nsfw_mode > 0.5' },
      { from: 'nsfw_idle', to: 'idle', condition: 'nsfw_mode < 0.5' },
      { from: 'nsfw_idle', to: 'nsfw_action', condition: 'nsfw_action > 0.5' },
      { from: 'nsfw_action', to: 'nsfw_idle', condition: 'nsfw_action < 0.1' },
    ],
  },

  // Combat character animations
  combat: {
    states: ['idle', 'walk', 'run', 'attack', 'block', 'dodge', 'hit', 'death'],
    parameters: ['speed', 'attack', 'block', 'dodge', 'hit', 'health'],
    transitions: [
      { from: 'idle', to: 'attack', condition: 'attack > 0.5' },
      { from: 'walk', to: 'attack', condition: 'attack > 0.5' },
      { from: 'attack', to: 'idle', condition: 'attack < 0.1' },
      { from: 'idle', to: 'block', condition: 'block > 0.5' },
      { from: 'block', to: 'idle', condition: 'block < 0.1' },
      { from: 'idle', to: 'dodge', condition: 'dodge > 0.5' },
      { from: 'dodge', to: 'idle', condition: 'dodge < 0.1' },
    ],
  },
};

// Utility function to create animation controller from GLTF
export function createAnimationController(
  gltf: GLTF,
  options: AnimationControllerOptions = {},
): AnimationController | null {
  if (!gltf.animations || gltf.animations.length === 0) {
    getLogger().then((logger) => {
      logger.warn('No animations found in GLTF');
    });
    return null;
  }

  const scene = gltf.scene;
  const animations = gltf.animations;

  return new AnimationController(scene, animations, options);
}

// Animation manager for handling multiple characters
export class AnimationManager {
  private controllers: Map<string, AnimationController> = new Map();
  private clock: THREE.Clock;

  constructor() {
    this.clock = new THREE.Clock();
  }

  addController(id: string, controller: AnimationController) {
    this.controllers.set(id, controller);
    controller.play();
  }

  removeController(id: string) {
    const controller = this.controllers.get(id);
    if (controller) {
      controller.dispose();
      this.controllers.delete(id);
    }
  }

  getController(id: string): AnimationController | undefined {
    return this.controllers.get(id);
  }

  update() {
    const _deltaTime = this.clock.getDelta();

    this.controllers.forEach((controller) => {
      controller.update();
    });
  }

  pause() {
    this.controllers.forEach((controller) => {
      controller.pause();
    });
  }

  resume() {
    this.controllers.forEach((controller) => {
      controller.play();
    });
  }

  dispose() {
    this.controllers.forEach((controller) => {
      controller.dispose();
    });
    this.controllers.clear();
  }
}

// Singleton animation manager
export const animationManager = new AnimationManager();
