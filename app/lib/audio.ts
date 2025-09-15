'use client';

class AudioMgr {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private unlocked = false;

  async load(name: string, url: string) {
    try {
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      this.ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
      const buf = await this.ctx.decodeAudioData(arr);
      this.buffers.set(name, buf);
    } catch (error) {
      console.warn(`Failed to load audio: ${name}`, error);
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
    if (!buf || !this.ctx) return;

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
        } catch (e) {
          // Ignore errors when stopping already stopped sources
        }
      };
    } catch (error) {
      console.warn(`Failed to play audio: ${name}`, error);
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
