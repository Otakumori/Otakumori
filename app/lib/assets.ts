 
 
import { put, del, list } from '@vercel/blob';

export interface AssetManifest {
  icons: Record<string, string>;
  sprites: Record<string, string>;
  audio: Record<string, string>;
  music: Record<string, string>;
}

export interface AudioAsset {
  element: HTMLAudioElement;
  loaded: boolean;
  error?: string;
}

class AssetManager {
  private audioCache = new Map<string, AudioAsset>();
  private spriteCache = new Map<string, string>();
  private musicCache = new Map<string, HTMLAudioElement>();
  private isMuted = false;
  private volume = 0.7;
  private concurrencyGuard = new Set<string>();

  constructor() {
    // Load mute preference from localStorage
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('otakumori-sfx-muted') === 'true';
      const savedVolume = localStorage.getItem('otakumori-sfx-volume');
      if (savedVolume) {
        this.volume = parseFloat(savedVolume);
      }
    }
  }

  // Sprite management
  async getSprite(
    key: string,
    fallback?: 'circle' | 'square' | 'triangle' | 'star',
  ): Promise<string> {
    if (this.spriteCache.has(key)) {
      return this.spriteCache.get(key)!;
    }

    try {
      // Try to get from Vercel Blob
      const url = await this.getBlobUrl(`sprites/${key}.png`);
      this.spriteCache.set(key, url);
      return url;
    } catch (error) {
      // Generate procedural fallback
      const fallbackUrl = this.generateProceduralSprite(key, fallback || 'circle');
      this.spriteCache.set(key, fallbackUrl);
      return fallbackUrl;
    }
  }

  private generateProceduralSprite(
    key: string,
    shape: 'circle' | 'square' | 'triangle' | 'star',
  ): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 64;
    canvas.height = 64;

    // Generate based on key hash for consistent colors
    const hash = this.hashString(key);
    const hue = hash % 360;
    const saturation = 60 + (hash % 20);
    const lightness = 50 + (hash % 20);

    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness - 20}%)`;
    ctx.lineWidth = 2;

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(32, 32, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      case 'square':
        ctx.fillRect(16, 16, 32, 32);
        ctx.strokeRect(16, 16, 32, 32);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(32, 8);
        ctx.lineTo(48, 48);
        ctx.lineTo(16, 48);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case 'star':
        this.drawStar(ctx, 32, 32, 5, 20, 10);
        ctx.fill();
        ctx.stroke();
        break;
    }

    return canvas.toDataURL();
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
  ) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // Audio management
  async getAudio(key: string, preload = true): Promise<HTMLAudioElement> {
    if (this.audioCache.has(key)) {
      const asset = this.audioCache.get(key)!;
      if (asset.loaded) {
        return asset.element;
      }
    }

    try {
      const url = await this.getBlobUrl(`audio/${key}.mp3`);
      const audio = new Audio();
      audio.preload = preload ? 'auto' : 'none';
      audio.volume = this.volume;

      if (preload) {
        await this.loadAudio(audio, url, key);
      } else {
        audio.src = url;
      }

      const asset: AudioAsset = { element: audio, loaded: preload };
      this.audioCache.set(key, asset);
      return audio;
    } catch (error) {
      // Generate fallback audio
      const fallbackAudio = this.generateFallbackAudio(key);
      const asset: AudioAsset = { element: fallbackAudio, loaded: true };
      this.audioCache.set(key, asset);
      return fallbackAudio;
    }
  }

  private async loadAudio(audio: HTMLAudioElement, url: string, key: string): Promise<void> {
    if (this.concurrencyGuard.has(key)) {
      return;
    }

    this.concurrencyGuard.add(key);
    try {
      audio.src = url;
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });
    } finally {
      this.concurrencyGuard.delete(key);
    }
  }

  private generateFallbackAudio(key: string): HTMLAudioElement {
    const audio = new Audio();
    const hash = this.hashString(key);
    const frequency = 200 + (hash % 800);
    const duration = 0.1 + (hash % 200) / 1000;

    // Generate a simple beep using Web Audio API
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (error) {
        console.warn('Could not generate fallback audio:', error);
      }
    }

    return audio;
  }

  // SFX playback
  async playSfx(key: string): Promise<void> {
    if (this.isMuted) return;

    try {
      const audio = await this.getAudio(key, false);
      audio.currentTime = 0;
      audio.volume = this.volume;
      await audio.play();
    } catch (error) {
      console.warn('Could not play SFX:', key, error);
    }
  }

  // Music management
  async getMusic(key: string): Promise<HTMLAudioElement> {
    if (this.musicCache.has(key)) {
      return this.musicCache.get(key)!;
    }

    try {
      const url = await this.getBlobUrl(`music/${key}.mp3`);
      const audio = new Audio();
      audio.src = url;
      audio.loop = true;
      audio.volume = this.volume * 0.5; // Music is quieter than SFX
      audio.preload = 'metadata';

      this.musicCache.set(key, audio);
      return audio;
    } catch (error) {
      console.warn('Could not load music:', key, error);
      // Return a silent audio element
      const silentAudio = new Audio();
      silentAudio.src =
        'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      return silentAudio;
    }
  }

  // Volume and mute controls
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      localStorage.setItem('otakumori-sfx-volume', this.volume.toString());
    }

    // Update all cached audio
    this.audioCache.forEach((asset) => {
      if (asset.loaded) {
        asset.element.volume = this.volume;
      }
    });

    this.musicCache.forEach((audio) => {
      audio.volume = this.volume * 0.5;
    });
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('otakumori-sfx-muted', muted.toString());
    }

    // Mute/unmute all audio
    this.audioCache.forEach((asset) => {
      if (asset.loaded) {
        asset.element.muted = muted;
      }
    });

    this.musicCache.forEach((audio) => {
      audio.muted = muted;
    });
  }

  getVolume(): number {
    return this.volume;
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  // Blob URL management
  private async getBlobUrl(path: string): Promise<string> {
    // This would typically use Vercel Blob's get method
    // For now, return a placeholder that can be replaced with actual blob URLs
    return `https://your-blob-store.vercel-storage.com/${path}`;
  }

  // Cleanup
  dispose(): void {
    this.audioCache.forEach((asset) => {
      if (asset.loaded) {
        asset.element.pause();
        asset.element.src = '';
      }
    });
    this.audioCache.clear();

    this.musicCache.forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    this.musicCache.clear();

    this.spriteCache.clear();
  }
}

// Export singleton instance
export const assetManager = new AssetManager();

// Export convenience functions
export const getSprite = (key: string, fallback?: 'circle' | 'square' | 'triangle' | 'star') =>
  assetManager.getSprite(key, fallback);

export const getAudio = (key: string, preload?: boolean) => assetManager.getAudio(key, preload);

export const getMusic = (key: string) => assetManager.getMusic(key);

export const playSfx = (key: string) => assetManager.playSfx(key);

export const setVolume = (volume: number) => assetManager.setVolume(volume);

export const setMuted = (muted: boolean) => assetManager.setMuted(muted);

export const getVolume = () => assetManager.getVolume();

export const isMuted = () => assetManager.isMutedState();
