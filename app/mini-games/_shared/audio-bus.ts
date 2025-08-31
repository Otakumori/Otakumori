/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

const ctx =
  typeof window !== 'undefined'
    ? new (window.AudioContext || (window as any).webkitAudioContext)()
    : null;
let musicGain: GainNode | null = null;
let isMuted = false;

export async function play(url: string, volumeDb = -12) {
  if (!ctx || isMuted) return;
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const audio = await ctx.decodeAudioData(buf);
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = audio;
  gain.gain.value = dbToGain(volumeDb);
  src.connect(gain).connect(ctx.destination);
  src.start();
}

export function setMusic(node: AudioBufferSourceNode) {
  if (!ctx) return;
  musicGain = ctx.createGain();
  node.connect(musicGain).connect(ctx.destination);
}

export function duck(ms = 300, targetDb = -24) {
  if (!musicGain || !ctx) return;
  const now = ctx.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.linearRampToValueAtTime(dbToGain(targetDb), now + ms / 1000);
}

export function unduck(ms = 300, targetDb = -12) {
  if (!musicGain || !ctx) return;
  const now = ctx.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.linearRampToValueAtTime(dbToGain(targetDb), now + ms / 1000);
}

export function fadeOut(ms = 500) {
  if (!musicGain || !ctx) return;
  const now = ctx.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.linearRampToValueAtTime(0.0001, now + ms / 1000);
}

export function fadeIn(ms = 500, targetDb = -12) {
  if (!musicGain || !ctx) return;
  const now = ctx.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(0.0001, now);
  musicGain.gain.linearRampToValueAtTime(dbToGain(targetDb), now + ms / 1000);
}

function dbToGain(db: number) {
  return Math.pow(10, db / 20);
}

export function setMuted(muted: boolean): void {
  isMuted = muted;
}

export function getMuted(): boolean {
  return isMuted;
}
