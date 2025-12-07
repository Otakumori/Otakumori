import * as THREE from 'three';

/**
 * Input Controls System
 * Handles keyboard, mouse, and gamepad input
 */
export interface ControlState {
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  attack: boolean;
  dodge: boolean;
  dimensionShift: boolean;
  mouseX: number;
  mouseY: number;

export default class Controls {
  private keys: Set<string> = new Set();
  private mousePosition: THREE.Vector2 = new THREE.Vector2();
  private controlState: ControlState = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    attack: false,
    dodge: false,
    dimensionShift: false,
    mouseX: 0,
    mouseY: 0,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('mousedown', this.handleMouseDown);
      window.addEventListener('mouseup', this.handleMouseUp);
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    this.keys.add(event.key.toLowerCase());
    this.updateControlState();
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.key.toLowerCase());
    this.updateControlState();
  };

  private handleMouseMove = (event: MouseEvent) => {
    this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.updateControlState();
  };

  private handleMouseDown = (event: MouseEvent) => {
    if (event.button === 0) {
      // Left click - attack
      this.keys.add('mouse0');
    } else if (event.button === 2) {
      // Right click - dodge
      this.keys.add('mouse2');
    }
    this.updateControlState();
  };

  private handleMouseUp = (event: MouseEvent) => {
    if (event.button === 0) {
      this.keys.delete('mouse0');
    } else if (event.button === 2) {
      this.keys.delete('mouse2');
    }
    this.updateControlState();
  };

  private updateControlState() {
    this.controlState = {
      moveForward: this.keys.has('w') || this.keys.has('arrowup'),
      moveBackward: this.keys.has('s') || this.keys.has('arrowdown'),
      moveLeft: this.keys.has('a') || this.keys.has('arrowleft'),
      moveRight: this.keys.has('d') || this.keys.has('arrowright'),
      attack: this.keys.has('mouse0') || this.keys.has(' '),
      dodge: this.keys.has('mouse2') || this.keys.has('shift'),
      dimensionShift: this.keys.has('q') || this.keys.has('e'),
      mouseX: this.mousePosition.x,
      mouseY: this.mousePosition.y,
    };
  }

  getControlState(): ControlState {
    return { ...this.controlState };
  }

  getMovementVector(): THREE.Vector3 {
    const state = this.controlState;
    const move = new THREE.Vector3();
    
    if (state.moveForward) move.z -= 1;
    if (state.moveBackward) move.z += 1;
    if (state.moveLeft) move.x -= 1;
    if (state.moveRight) move.x += 1;
    
    return move.normalize();
  }

  dispose() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mousedown', this.handleMouseDown);
      window.removeEventListener('mouseup', this.handleMouseUp);
    }
  }
}

