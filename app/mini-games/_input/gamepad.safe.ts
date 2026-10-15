export type ControllerCapability =
  | 'FULL_GAMEPLAY'
  | 'GAMEPLAY_PARTIAL'
  | 'MENUS_ONLY'
  | 'UNSUPPORTED';

export type ActiveInputDevice = 'keyboard-mouse' | 'touch-pointer' | 'controller';

export type ControllerButtonState = {
  held: boolean;
  pressed: boolean;
  released: boolean;
  value: number;
};

export type ControllerSnapshot = {
  id: string;
  index: number;
  mapping: string;
  axes: readonly number[];
  buttons: readonly ControllerButtonState[];
  timestamp: number;
};

export type ControllerStatus = {
  activeDevice: ActiveInputDevice;
  connected: boolean;
  controllerId: string | null;
  controllerIndex: number | null;
};

export type CommonControllerAction =
  | 'confirm'
  | 'cancel'
  | 'pause'
  | 'exit'
  | 'menu-up'
  | 'menu-down'
  | 'menu-left'
  | 'menu-right';

type FrameSubscriber = (snapshot: ControllerSnapshot | null) => void;
type StatusSubscriber = (status: ControllerStatus) => void;

export type ControllerEnvironment = {
  getGamepads: () => readonly (Gamepad | null)[];
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (handle: number) => void;
  addWindowListener: (type: string, listener: EventListener) => void;
  removeWindowListener: (type: string, listener: EventListener) => void;
};

const DEFAULT_STATUS: ControllerStatus = {
  activeDevice: 'keyboard-mouse',
  connected: false,
  controllerId: null,
  controllerIndex: null,
};

const BUTTON_THRESHOLD = 0.5;
export const DEFAULT_CONTROLLER_DEADZONE = 0.18;

export function applyRadialDeadzone(
  x: number,
  y: number,
  deadzone = DEFAULT_CONTROLLER_DEADZONE,
): readonly [number, number] {
  const magnitude = Math.hypot(x, y);
  if (magnitude <= deadzone || magnitude === 0) return [0, 0];

  const normalizedMagnitude = Math.min(1, (magnitude - deadzone) / (1 - deadzone));
  const scale = normalizedMagnitude / magnitude;
  return [x * scale, y * scale];
}

export function getCommonControllerActions(
  snapshot: ControllerSnapshot,
): readonly CommonControllerAction[] {
  const actions: CommonControllerAction[] = [];
  const pressed = (index: number) => snapshot.buttons[index]?.pressed === true;

  if (pressed(0)) actions.push('confirm');
  if (pressed(1)) actions.push('cancel');
  if (pressed(9)) actions.push('pause');
  if (pressed(8)) actions.push('exit');
  if (pressed(12)) actions.push('menu-up');
  if (pressed(13)) actions.push('menu-down');
  if (pressed(14)) actions.push('menu-left');
  if (pressed(15)) actions.push('menu-right');
  return actions;
}

function browserEnvironment(): ControllerEnvironment | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return null;
  return {
    getGamepads: () => navigator.getGamepads?.() ?? [],
    requestFrame: (callback) => window.requestAnimationFrame(callback),
    cancelFrame: (handle) => window.cancelAnimationFrame(handle),
    addWindowListener: (type, listener) => window.addEventListener(type, listener),
    removeWindowListener: (type, listener) => window.removeEventListener(type, listener),
  };
}

export class ControllerService {
  private readonly frames = new Set<FrameSubscriber>();
  private readonly statuses = new Set<StatusSubscriber>();
  private readonly previousButtons = new Map<number, readonly boolean[]>();
  private readonly environment: ControllerEnvironment | null;
  private animationFrame: number | null = null;
  private activeControllerIndex: number | null = null;
  private status = DEFAULT_STATUS;
  private listening = false;

  constructor(environment: ControllerEnvironment | null = browserEnvironment()) {
    this.environment = environment;
  }

  subscribeFrames(subscriber: FrameSubscriber) {
    this.frames.add(subscriber);
    this.start();
    return () => {
      this.frames.delete(subscriber);
      this.stopWhenUnused();
    };
  }

  subscribeStatus(subscriber: StatusSubscriber) {
    this.statuses.add(subscriber);
    subscriber(this.status);
    this.start();
    return () => {
      this.statuses.delete(subscriber);
      this.stopWhenUnused();
    };
  }

  getStatus() {
    return this.status;
  }

  markInputDevice(activeDevice: ActiveInputDevice) {
    if (this.status.activeDevice === activeDevice) return;
    this.publishStatus({ ...this.status, activeDevice });
  }

  destroy() {
    this.frames.clear();
    this.statuses.clear();
    this.stop();
  }

  private start() {
    if (this.listening || !this.environment) return;
    this.listening = true;
    this.environment.addWindowListener('gamepadconnected', this.handleConnection);
    this.environment.addWindowListener('gamepaddisconnected', this.handleConnection);
    this.environment.addWindowListener('keydown', this.handleKeyboard);
    this.environment.addWindowListener('pointerdown', this.handlePointer);
    this.animationFrame = this.environment.requestFrame(this.poll);
  }

  private stopWhenUnused() {
    if (this.frames.size === 0 && this.statuses.size === 0) this.stop();
  }

  private stop() {
    if (!this.listening || !this.environment) return;
    this.environment.removeWindowListener('gamepadconnected', this.handleConnection);
    this.environment.removeWindowListener('gamepaddisconnected', this.handleConnection);
    this.environment.removeWindowListener('keydown', this.handleKeyboard);
    this.environment.removeWindowListener('pointerdown', this.handlePointer);
    if (this.animationFrame !== null) this.environment.cancelFrame(this.animationFrame);
    this.animationFrame = null;
    this.activeControllerIndex = null;
    this.previousButtons.clear();
    this.listening = false;
  }

  private readonly handleConnection: EventListener = () => this.sample();

  private readonly handleKeyboard: EventListener = () => {
    this.markInputDevice('keyboard-mouse');
  };

  private readonly handlePointer: EventListener = (event) => {
    const pointer = event as PointerEvent;
    this.markInputDevice(pointer.pointerType === 'touch' ? 'touch-pointer' : 'keyboard-mouse');
  };

  private readonly poll: FrameRequestCallback = () => {
    this.sample();
    if (this.listening && this.environment) {
      this.animationFrame = this.environment.requestFrame(this.poll);
    }
  };

  private sample() {
    if (!this.environment) return;
    const gamepads = Array.from(this.environment.getGamepads()).filter(
      (gamepad): gamepad is Gamepad => Boolean(gamepad?.connected),
    );

    const connectedIndexes = new Set(gamepads.map((gamepad) => gamepad.index));
    for (const index of this.previousButtons.keys()) {
      if (!connectedIndexes.has(index)) this.previousButtons.delete(index);
    }

    for (const gamepad of gamepads) {
      if (this.hasActivity(gamepad)) this.activeControllerIndex = gamepad.index;
    }

    if (!gamepads.some((gamepad) => gamepad.index === this.activeControllerIndex)) {
      this.activeControllerIndex = gamepads[0]?.index ?? null;
    }

    const active = gamepads.find((gamepad) => gamepad.index === this.activeControllerIndex) ?? null;
    const snapshot = active ? this.toSnapshot(active) : null;
    this.publishStatus({
      activeDevice:
        snapshot && this.hasSnapshotActivity(snapshot) ? 'controller' : this.status.activeDevice,
      connected: Boolean(snapshot),
      controllerId: snapshot?.id ?? null,
      controllerIndex: snapshot?.index ?? null,
    });
    for (const subscriber of this.frames) subscriber(snapshot);
  }

  private hasActivity(gamepad: Gamepad) {
    return (
      gamepad.buttons.some((button) => button.pressed || button.value > BUTTON_THRESHOLD) ||
      gamepad.axes.some((axis) => Math.abs(axis) > DEFAULT_CONTROLLER_DEADZONE)
    );
  }

  private hasSnapshotActivity(snapshot: ControllerSnapshot) {
    return (
      snapshot.buttons.some((button) => button.held) ||
      snapshot.axes.some((axis) => Math.abs(axis) > DEFAULT_CONTROLLER_DEADZONE)
    );
  }

  private toSnapshot(gamepad: Gamepad): ControllerSnapshot {
    const previous = this.previousButtons.get(gamepad.index) ?? [];
    const held = gamepad.buttons.map(
      (button) => button.pressed || button.value > BUTTON_THRESHOLD,
    );
    const buttons = gamepad.buttons.map((button, index) => ({
      held: held[index],
      pressed: held[index] && !previous[index],
      released: !held[index] && previous[index] === true,
      value: button.value,
    }));
    const [leftX, leftY] = applyRadialDeadzone(gamepad.axes[0] ?? 0, gamepad.axes[1] ?? 0);
    const [rightX, rightY] = applyRadialDeadzone(gamepad.axes[2] ?? 0, gamepad.axes[3] ?? 0);
    this.previousButtons.set(gamepad.index, held);
    return {
      id: gamepad.id,
      index: gamepad.index,
      mapping: gamepad.mapping,
      axes: [leftX, leftY, rightX, rightY, ...gamepad.axes.slice(4)],
      buttons,
      timestamp: gamepad.timestamp,
    };
  }

  private publishStatus(next: ControllerStatus) {
    if (
      next.activeDevice === this.status.activeDevice &&
      next.connected === this.status.connected &&
      next.controllerId === this.status.controllerId &&
      next.controllerIndex === this.status.controllerIndex
    ) {
      return;
    }
    this.status = next;
    for (const subscriber of this.statuses) subscriber(next);
  }
}

export const controllerService = new ControllerService();
