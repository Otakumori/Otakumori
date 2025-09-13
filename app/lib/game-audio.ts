'use client';

import { audio } from './audio';

/**
 * Game-specific audio utilities
 * Centralized SFX management for different game states
 */

export const gameAudio = {
  /**
   * Play Samus jingle - used after creating a character
   */
  playCharacterCreated: () => {
    audio.play('samus_jingle', { gain: 0.8 });
  },

  /**
   * Play Midna's lament - used in pause menus
   */
  playPauseMenu: () => {
    audio.play('midna_lament', { gain: 0.6, loop: true });
  },

  /**
   * Stop pause menu music
   */
  stopPauseMenu: () => {
    // This would need to be tracked per component
    // For now, components should manage their own stop functions
  },

  /**
   * Play boot whoosh - used during startup
   */
  playBootWhoosh: () => {
    audio.play('boot_whoosh', { gain: 0.7 });
  },

  /**
   * Play gamecube menu - used for navigation and background
   */
  playGamecubeMenu: (options: { gain?: number; loop?: boolean } = {}) => {
    return audio.play('gamecube_menu', { 
      gain: options.gain || 0.3, 
      loop: options.loop || false 
    });
  },

  /**
   * Play confirm sound - used for activation
   */
  playConfirm: () => {
    audio.play('samus_jingle', { gain: 0.5 });
  }
};
