/**
 * Micro-Interactions System
 *
 * Provides smooth, responsive interactions that make the UI feel alive
 * and engaging.
 */

export interface MicroInteractionConfig {
  duration: number;
  easing: string;
  scale?: number;
  glow?: string;
  sound?: string;
  haptic?: 'light' | 'medium' | 'heavy';
}

export class MicroInteractionSystem {
  private static instance: MicroInteractionSystem;
  private audioContext: AudioContext | null = null;
  private soundCache: Map<string, AudioBuffer> = new Map();

  static getInstance(): MicroInteractionSystem {
    if (!MicroInteractionSystem.instance) {
      MicroInteractionSystem.instance = new MicroInteractionSystem();
    }
    return MicroInteractionSystem.instance;
  }

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize audio context for sound effects
   */
  private initializeAudio(): void {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Hover interaction
   */
  hover(element: HTMLElement, config: Partial<MicroInteractionConfig> = {}): void {
    const defaultConfig: MicroInteractionConfig = {
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      scale: 1.05,
      glow: '0 0 20px rgba(255, 105, 180, 0.3)',
    };

    const finalConfig = { ...defaultConfig, ...config };

    element.style.transition = `transform ${finalConfig.duration}ms ${finalConfig.easing}`;
    element.style.transform = `scale(${finalConfig.scale})`;
    element.style.boxShadow = finalConfig.glow || 'none';
  }

  /**
   * Click interaction
   */
  click(element: HTMLElement, config: Partial<MicroInteractionConfig> = {}): void {
    const defaultConfig: MicroInteractionConfig = {
      duration: 100,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      scale: 0.95,
      sound: 'soft_click.wav',
      haptic: 'light',
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Visual feedback
    element.style.transition = `transform ${finalConfig.duration}ms ${finalConfig.easing}`;
    element.style.transform = `scale(${finalConfig.scale})`;

    // Sound feedback
    if (finalConfig.sound) {
      this.playSound(finalConfig.sound);
    }

    // Haptic feedback
    if (finalConfig.haptic && 'vibrate' in navigator) {
      const hapticPattern = {
        light: [10],
        medium: [20],
        heavy: [50],
      };
      navigator.vibrate(hapticPattern[finalConfig.haptic]);
    }

    // Reset after animation
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, finalConfig.duration);
  }

  /**
   * Loading interaction
   */
  loading(element: HTMLElement, config: Partial<MicroInteractionConfig> = {}): void {
    const defaultConfig: MicroInteractionConfig = {
      duration: 1000,
      easing: 'ease-in-out',
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Add shimmer effect
    element.style.background =
      'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)';
    element.style.backgroundSize = '200% 100%';
    element.style.animation = `shimmer ${finalConfig.duration}ms ${finalConfig.easing} infinite`;

    // Add CSS for shimmer animation
    if (!document.getElementById('shimmer-styles')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles';
      style.textContent = `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Success interaction
   */
  success(element: HTMLElement, config: Partial<MicroInteractionConfig> = {}): void {
    const defaultConfig: MicroInteractionConfig = {
      duration: 300,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      scale: 1.1,
      sound: 'success.wav',
      haptic: 'medium',
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Visual feedback
    element.style.transition = `transform ${finalConfig.duration}ms ${finalConfig.easing}`;
    element.style.transform = `scale(${finalConfig.scale})`;

    // Sound feedback
    if (finalConfig.sound) {
      this.playSound(finalConfig.sound);
    }

    // Haptic feedback
    if (finalConfig.haptic && 'vibrate' in navigator) {
      const hapticPattern = {
        light: [10],
        medium: [20],
        heavy: [50],
      };
      navigator.vibrate(hapticPattern[finalConfig.haptic]);
    }

    // Reset after animation
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, finalConfig.duration);
  }

  /**
   * Error interaction
   */
  error(element: HTMLElement, config: Partial<MicroInteractionConfig> = {}): void {
    const defaultConfig: MicroInteractionConfig = {
      duration: 200,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      scale: 0.95,
      sound: 'error.wav',
      haptic: 'heavy',
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Visual feedback with shake
    element.style.transition = `transform ${finalConfig.duration}ms ${finalConfig.easing}`;
    element.style.transform = `scale(${finalConfig.scale}) translateX(5px)`;

    // Sound feedback
    if (finalConfig.sound) {
      this.playSound(finalConfig.sound);
    }

    // Haptic feedback
    if (finalConfig.haptic && 'vibrate' in navigator) {
      const hapticPattern = {
        light: [10],
        medium: [20],
        heavy: [50],
      };
      navigator.vibrate(hapticPattern[finalConfig.haptic]);
    }

    // Reset after animation
    setTimeout(() => {
      element.style.transform = 'scale(1) translateX(0)';
    }, finalConfig.duration);
  }

  /**
   * Play sound effect
   */
  private async playSound(soundFile: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      let audioBuffer = this.soundCache.get(soundFile);

      if (!audioBuffer) {
        const response = await fetch(`/sounds/${soundFile}`);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.soundCache.set(soundFile, audioBuffer);
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Create custom interaction
   */
  createCustomInteraction(
    element: HTMLElement,
    animation: string,
    config: Partial<MicroInteractionConfig> = {},
  ): void {
    const defaultConfig: MicroInteractionConfig = {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const finalConfig = { ...defaultConfig, ...config };

    element.style.transition = `all ${finalConfig.duration}ms ${finalConfig.easing}`;
    element.style.animation = animation;
  }

  /**
   * Remove all interactions
   */
  removeInteractions(element: HTMLElement): void {
    element.style.transition = '';
    element.style.transform = '';
    element.style.boxShadow = '';
    element.style.background = '';
    element.style.animation = '';
  }
}

// Export singleton instance
export const microInteractions = MicroInteractionSystem.getInstance();
