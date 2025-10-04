export interface GamepadState {
  connected: boolean;
  index: number;
  buttons: {
    pressed: boolean[];
    justPressed: boolean[];
    justReleased: boolean[];
  };
  axes: number[];
  timestamp: number;
}

export interface GamepadInput {
  A: boolean;
  B: boolean;
  X: boolean;
  Y: boolean;
  L1: boolean;
  R1: boolean;
  L2: boolean;
  R2: boolean;
  SELECT: boolean;
  START: boolean;
  L3: boolean;
  R3: boolean;
  UP: boolean;
  DOWN: boolean;
  LEFT: boolean;
  RIGHT: boolean;
  LEFT_STICK_X: number;
  LEFT_STICK_Y: number;
  RIGHT_STICK_X: number;
  RIGHT_STICK_Y: number;
}

export class GamepadManager {
  private gamepads: Map<number, GamepadState> = new Map();
  private lastButtonStates: Map<number, boolean[]> = new Map();
  private listeners: Set<(gamepad: GamepadState) => void> = new Set();
  private animationFrameId: number | null = null;
  private isPolling = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('gamepadconnected', (e) => {
      // Gamepad connected
      this.startPolling();
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      // Gamepad disconnected
      this.gamepads.delete(e.gamepad.index);
      this.lastButtonStates.delete(e.gamepad.index);

      if (this.gamepads.size === 0) {
        this.stopPolling();
      }
    });
  }

  private startPolling() {
    if (this.isPolling) return;

    this.isPolling = true;
    this.poll();
  }

  private stopPolling() {
    this.isPolling = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private poll() {
    if (!this.isPolling) return;

    const gamepads = navigator.getGamepads();

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;

      const lastButtonState = this.lastButtonStates.get(i) || [];
      const currentButtonState = Array.from(gamepad.buttons).map((btn) => btn.pressed);

      const justPressed = currentButtonState.map(
        (pressed, index) => pressed && !lastButtonState[index],
      );

      const justReleased = currentButtonState.map(
        (pressed, index) => !pressed && lastButtonState[index],
      );

      const gamepadState: GamepadState = {
        connected: true,
        index: i,
        buttons: {
          pressed: currentButtonState,
          justPressed,
          justReleased,
        },
        axes: Array.from(gamepad.axes),
        timestamp: gamepad.timestamp,
      };

      this.gamepads.set(i, gamepadState);
      this.lastButtonStates.set(i, currentButtonState);

      // Notify listeners
      this.listeners.forEach((listener) => listener(gamepadState));
    }

    this.animationFrameId = requestAnimationFrame(() => this.poll());
  }

  addListener(listener: (gamepad: GamepadState) => void) {
    this.listeners.add(listener);
  }

  removeListener(listener: (gamepad: GamepadState) => void) {
    this.listeners.delete(listener);
  }

  getGamepad(index: number): GamepadState | undefined {
    return this.gamepads.get(index);
  }

  getAllGamepads(): GamepadState[] {
    return Array.from(this.gamepads.values());
  }

  getConnectedCount(): number {
    return this.gamepads.size;
  }

  // Convert gamepad state to input mapping
  getInput(gamepadIndex: number = 0): GamepadInput | null {
    const gamepad = this.getGamepad(gamepadIndex);
    if (!gamepad) return null;

    const { buttons, axes } = gamepad;

    return {
      A: buttons.pressed[0] || false,
      B: buttons.pressed[1] || false,
      X: buttons.pressed[2] || false,
      Y: buttons.pressed[3] || false,
      L1: buttons.pressed[4] || false,
      R1: buttons.pressed[5] || false,
      L2: buttons.pressed[6] || false,
      R2: buttons.pressed[7] || false,
      SELECT: buttons.pressed[8] || false,
      START: buttons.pressed[9] || false,
      L3: buttons.pressed[10] || false,
      R3: buttons.pressed[11] || false,
      UP: buttons.pressed[12] || false,
      DOWN: buttons.pressed[13] || false,
      LEFT: buttons.pressed[14] || false,
      RIGHT: buttons.pressed[15] || false,
      LEFT_STICK_X: axes[0] || 0,
      LEFT_STICK_Y: axes[1] || 0,
      RIGHT_STICK_X: axes[2] || 0,
      RIGHT_STICK_Y: axes[3] || 0,
    };
  }

  // Check if a specific button was just pressed
  isButtonJustPressed(gamepadIndex: number, buttonIndex: number): boolean {
    const gamepad = this.getGamepad(gamepadIndex);
    return gamepad?.buttons.justPressed[buttonIndex] || false;
  }

  // Check if a specific button was just released
  isButtonJustReleased(gamepadIndex: number, buttonIndex: number): boolean {
    const gamepad = this.getGamepad(gamepadIndex);
    return gamepad?.buttons.justReleased[buttonIndex] || false;
  }

  // Get stick deadzone
  getStickValue(stick: 'left' | 'right', axis: 'x' | 'y', deadzone: number = 0.1): number {
    const gamepad = this.getGamepad(0);
    if (!gamepad) return 0;

    const stickIndex = stick === 'left' ? 0 : 2;
    const axisIndex = axis === 'x' ? 0 : 1;
    const value = gamepad.axes[stickIndex + axisIndex] || 0;

    return Math.abs(value) < deadzone ? 0 : value;
  }

  destroy() {
    this.stopPolling();
    this.listeners.clear();
    this.gamepads.clear();
    this.lastButtonStates.clear();
  }
}

// Singleton instance
export const gamepadManager = new GamepadManager();

// Keyboard input mapping
export interface KeyboardInput {
  keys: Set<string>;
  justPressed: Set<string>;
  justReleased: Set<string>;
}

export class KeyboardManager {
  private keys = new Set<string>();
  private justPressed = new Set<string>();
  private justReleased = new Set<string>();
  private lastKeys = new Set<string>();
  private listeners: Set<(input: KeyboardInput) => void> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      const key = e.code;
      if (!this.keys.has(key)) {
        this.keys.add(key);
        this.justPressed.add(key);
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.code;
      this.keys.delete(key);
      this.justReleased.add(key);
    });

    // Update just pressed/released on each frame
    const updateFrame = () => {
      this.justPressed.clear();
      this.justReleased.clear();

      // Check for just pressed
      this.keys.forEach((key) => {
        if (!this.lastKeys.has(key)) {
          this.justPressed.add(key);
        }
      });

      // Check for just released
      this.lastKeys.forEach((key) => {
        if (!this.keys.has(key)) {
          this.justReleased.add(key);
        }
      });

      this.lastKeys = new Set(this.keys);

      // Notify listeners
      const input: KeyboardInput = {
        keys: new Set(this.keys),
        justPressed: new Set(this.justPressed),
        justReleased: new Set(this.justReleased),
      };

      this.listeners.forEach((listener) => listener(input));

      requestAnimationFrame(updateFrame);
    };

    requestAnimationFrame(updateFrame);
  }

  addListener(listener: (input: KeyboardInput) => void) {
    this.listeners.add(listener);
  }

  removeListener(listener: (input: KeyboardInput) => void) {
    this.listeners.delete(listener);
  }

  isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }

  isKeyJustPressed(key: string): boolean {
    return this.justPressed.has(key);
  }

  isKeyJustReleased(key: string): boolean {
    return this.justReleased.has(key);
  }

  destroy() {
    this.listeners.clear();
    this.keys.clear();
    this.justPressed.clear();
    this.justReleased.clear();
    this.lastKeys.clear();
  }
}

// Singleton instance
export const keyboardManager = new KeyboardManager();
