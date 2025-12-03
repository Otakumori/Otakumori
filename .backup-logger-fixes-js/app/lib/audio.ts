'use client';

import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
class AudioMgr {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private unlocked = false;

  async load(name: string, url: string) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const arr = await res.arrayBuffer();
      if (arr.byteLength === 0) {
        throw new Error('Empty audio file');
      }

      this.ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();

      // Check if the audio context is suspended (common on mobile)
      if (this.ctx.state === 'suspended') {
        logger.warn(`Audio context suspended, cannot load: ${name}`);
        return;
      }

      const buf = await this.ctx.decodeAudioData(arr);
      this.buffers.set(name, buf);
      // `Successfully loaded audio: ${name} (${buf.duration.toFixed(2}s)`);
    } catch (error) {
      logger.warn(`Failed to load audio: ${name}`, error);
      // Don't throw, just log the error and continue
    }
  }

  unlock = () => {
    if (this.unlocked) return;
    this.ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    // resume on first user gesture
    this.ctx.resume();
    this.unlocked = true;
  };

  play(name: string, { rate = 1, gain = 0.9, loop = false } = {}) {
    const buf = this.buffers.get(name);
    if (!buf || !this.ctx) {
      logger.warn(`Cannot play audio: ${name} (not loaded or no audio context)`);
      return null;
    }

    // Check if audio context is suspended
    if (this.ctx.state === 'suspended') {
      logger.warn(`Cannot play audio: ${name} (audio context suspended)`);
      return null;
    }

    try {
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = rate;
      const g = this.ctx.createGain();
      g.gain.value = gain;
      src.loop = loop;
      src.connect(g).connect(this.ctx.destination);
      src.start();
      return () => {
        try {
          src.stop();
        } catch {
          // Ignore errors when stopping already stopped sources
        }
      };
    } catch {
      logger.warn(`Failed to play audio: ${name}`);
      return null;
    }
  }

  // Preload multiple audio files
  async preload(files: Array<[string, string]>) {
    const promises = files.map(([name, url]) => this.load(name, url));
    await Promise.allSettled(promises);
  }
}

export const audio = new AudioMgr();
