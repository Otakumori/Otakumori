export interface InputEvent {
  type: 'keydown' | 'keyup' | 'gamepad' | 'touchstart' | 'touchend' | 'touchmove';
  action: string;
  value?: number;
  timestamp: number;
}

export interface InputBinding {
  action: string;
  keys: string[];
  gamepadButtons?: number[];
  touchGestures?: string[];
}

export class InputManager {
  private listeners = new Map<string, Set<(event: InputEvent) => void>>();
  private bindings = new Map<string, InputBinding>();
  private gamepadState = new Map<number, Set<number>>();
  private touchState = new Map<number, { x: number; y: number; startTime: number }>();
  private isEnabled = true;
  private gamepadPollInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupEventListeners();
    this.startGamepadPolling();
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Touch events
    window.addEventListener('touchstart', this.handleTouchStart.bind(this));
    window.addEventListener('touchend', this.handleTouchEnd.bind(this));
    window.addEventListener('touchmove', this.handleTouchMove.bind(this));

    // Gamepad events
    window.addEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
  }

  private startGamepadPolling(): void {
    if (typeof window === 'undefined') return;

    this.gamepadPollInterval = setInterval(() => {
      const gamepads = navigator.getGamepads();
      for (const gamepad of gamepads) {
        if (gamepad) {
          this.pollGamepad(gamepad);
        }
      }
    }, 16); // 60 FPS polling
  }

  private pollGamepad(gamepad: Gamepad): void {
    const currentState = new Set<number>();

    // Check button states
    for (let i = 0; i < gamepad.buttons.length; i++) {
      if (gamepad.buttons[i].pressed) {
        currentState.add(i);

        // Check if this button was just pressed
        const previousState = this.gamepadState.get(gamepad.index) || new Set();
        if (!previousState.has(i)) {
          this.emitInputEvent({
            type: 'gamepad',
            action: `gamepad_${gamepad.index}_button_${i}`,
            value: gamepad.buttons[i].value,
            timestamp: performance.now(),
          });
        }
      }
    }

    // Check analog stick thresholds
    const leftStickThreshold = 0.5;
    const rightStickThreshold = 0.5;
    const triggerThreshold = 0.5;

    // Left stick
    if (
      Math.abs(gamepad.axes[0]) > leftStickThreshold ||
      Math.abs(gamepad.axes[1]) > leftStickThreshold
    ) {
      this.emitInputEvent({
        type: 'gamepad',
        action: `gamepad_${gamepad.index}_left_stick`,
        value: Math.sqrt(gamepad.axes[0] ** 2 + gamepad.axes[1] ** 2),
        timestamp: performance.now(),
      });
    }

    // Right stick
    if (
      Math.abs(gamepad.axes[2]) > rightStickThreshold ||
      Math.abs(gamepad.axes[3]) > rightStickThreshold
    ) {
      this.emitInputEvent({
        type: 'gamepad',
        action: `gamepad_${gamepad.index}_right_stick`,
        value: Math.sqrt(gamepad.axes[2] ** 2 + gamepad.axes[3] ** 2),
        timestamp: performance.now(),
      });
    }

    // Triggers
    if (gamepad.axes[4] > triggerThreshold) {
      this.emitInputEvent({
        type: 'gamepad',
        action: `gamepad_${gamepad.index}_left_trigger`,
        value: gamepad.axes[4],
        timestamp: performance.now(),
      });
    }

    if (gamepad.axes[5] > triggerThreshold) {
      this.emitInputEvent({
        type: 'gamepad',
        action: `gamepad_${gamepad.index}_right_trigger`,
        value: gamepad.axes[5],
        timestamp: performance.now(),
      });
    }

    this.gamepadState.set(gamepad.index, currentState);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    const action = this.getActionForKey(event.code);
    if (action) {
      this.emitInputEvent({
        type: 'keydown',
        action,
        timestamp: performance.now(),
      });
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    const action = this.getActionForKey(event.code);
    if (action) {
      this.emitInputEvent({
        type: 'keyup',
        action,
        timestamp: performance.now(),
      });
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    if (!this.isEnabled) return;

    for (const touch of event.changedTouches) {
      this.touchState.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        startTime: performance.now(),
      });

      this.emitInputEvent({
        type: 'touchstart',
        action: `touch_${touch.identifier}_start`,
        timestamp: performance.now(),
      });
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!this.isEnabled) return;

    for (const touch of event.changedTouches) {
      const touchData = this.touchState.get(touch.identifier);
      if (touchData) {
        const duration = performance.now() - touchData.startTime;
        const distance = Math.sqrt(
          (touch.clientX - touchData.x) ** 2 + (touch.clientY - touchData.y) ** 2,
        );

        // Determine gesture type
        let gesture = 'tap';
        if (duration > 500) gesture = 'hold';
        if (distance > 50) gesture = 'swipe';

        this.emitInputEvent({
          type: 'touchend',
          action: `touch_${touch.identifier}_${gesture}`,
          value: distance,
          timestamp: performance.now(),
        });

        this.touchState.delete(touch.identifier);
      }
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.isEnabled) return;

    for (const touch of event.changedTouches) {
      const touchData = this.touchState.get(touch.identifier);
      if (touchData) {
        const distance = Math.sqrt(
          (touch.clientX - touchData.x) ** 2 + (touch.clientY - touchData.y) ** 2,
        );

        if (distance > 10) {
          // Only emit if moved significantly
          this.emitInputEvent({
            type: 'touchmove',
            action: `touch_${touch.identifier}_move`,
            value: distance,
            timestamp: performance.now(),
          });
        }
      }
    }
  }

  private handleGamepadConnected(event: GamepadEvent): void {
    console.log('Gamepad connected:', event.gamepad);
  }

  private handleGamepadDisconnected(event: GamepadEvent): void {
    console.log('Gamepad disconnected:', event.gamepad);
    this.gamepadState.delete(event.gamepad.index);
  }

  private getActionForKey(keyCode: string): string | null {
    for (const [action, binding] of this.bindings) {
      if (binding.keys.includes(keyCode)) {
        return action;
      }
    }
    return null;
  }

  // Public API
  bindAction(action: string, binding: InputBinding): void {
    this.bindings.set(action, binding);
  }

  unbindAction(action: string): void {
    this.bindings.delete(action);
  }

  on(action: string, callback: (event: InputEvent) => void): () => void {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, new Set());
    }

    this.listeners.get(action)!.add(callback);

    // Return unsubscribe function
    return () => {
      const actionListeners = this.listeners.get(action);
      if (actionListeners) {
        actionListeners.delete(callback);
        if (actionListeners.size === 0) {
          this.listeners.delete(action);
        }
      }
    };
  }

  off(action: string, callback: (event: InputEvent) => void): void {
    const actionListeners = this.listeners.get(action);
    if (actionListeners) {
      actionListeners.delete(callback);
      if (actionListeners.size === 0) {
        this.listeners.delete(action);
      }
    }
  }

  private emitInputEvent(event: InputEvent): void {
    const actionListeners = this.listeners.get(event.action);
    if (actionListeners) {
      actionListeners.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in input callback:', error);
        }
      });
    }
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  isInputEnabled(): boolean {
    return this.isEnabled;
  }

  // Utility methods
  getGamepadCount(): number {
    if (typeof navigator === 'undefined') return 0;
    return navigator.getGamepads().filter(Boolean).length;
  }

  getTouchCount(): number {
    return this.touchState.size;
  }

  // Cleanup
  dispose(): void {
    if (this.gamepadPollInterval) {
      clearInterval(this.gamepadPollInterval);
      this.gamepadPollInterval = null;
    }

    this.listeners.clear();
    this.bindings.clear();
    this.gamepadState.clear();
    this.touchState.clear();

    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown.bind(this));
      window.removeEventListener('keyup', this.handleKeyUp.bind(this));
      window.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      window.removeEventListener('touchend', this.handleTouchEnd.bind(this));
      window.removeEventListener('touchmove', this.handleTouchMove.bind(this));
      window.removeEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
      window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
    }
  }
}

// Export singleton instance
export const inputManager = new InputManager();

// Export convenience functions
export const bindAction = (action: string, binding: InputBinding) =>
  inputManager.bindAction(action, binding);

export const unbindAction = (action: string) => inputManager.unbindAction(action);

export const onInput = (action: string, callback: (event: InputEvent) => void) =>
  inputManager.on(action, callback);

export const offInput = (action: string, callback: (event: InputEvent) => void) =>
  inputManager.off(action, callback);

export const enableInput = () => inputManager.enable();

export const disableInput = () => inputManager.disable();
