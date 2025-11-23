import * as THREE from 'three';

/**
 * Combat System
 * Handles hit detection, damage calculation, and combo tracking
 */
export default class CombatSystem {
  private activeHits: Set<string> = new Set();
  private comboCount: number = 0;
  private lastHitTime: number = 0;
  private readonly COMBO_WINDOW = 2000; // 2 seconds

  reset() {
    this.activeHits.clear();
    this.comboCount = 0;
    this.lastHitTime = 0;
  }

  /**
   * Check if an attack hits a target
   */
  checkHit(
    attackerPosition: THREE.Vector3,
    targetPosition: THREE.Vector3,
    attackRange: number,
    hitId: string,
  ): boolean {
    const distance = attackerPosition.distanceTo(targetPosition);
    
    if (distance <= attackRange && !this.activeHits.has(hitId)) {
      this.activeHits.add(hitId);
      this.updateCombo();
      return true;
    }
    
    return false;
  }

  /**
   * Calculate damage based on combo and style
   */
  calculateDamage(baseDamage: number, combo: number, styleMultiplier: number): number {
    const comboMultiplier = 1 + combo * 0.1;
    return Math.floor(baseDamage * comboMultiplier * styleMultiplier);
  }

  /**
   * Update combo counter
   */
  private updateCombo() {
    const now = Date.now();
    if (now - this.lastHitTime < this.COMBO_WINDOW) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastHitTime = now;
  }

  /**
   * Get current combo count
   */
  getCombo(): number {
    const now = Date.now();
    if (now - this.lastHitTime > this.COMBO_WINDOW) {
      this.comboCount = 0;
    }
    return this.comboCount;
  }

  /**
   * Clear hit tracking (call after attack animation completes)
   */
  clearHits() {
    this.activeHits.clear();
  }
}

