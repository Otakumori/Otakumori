'use client';
import { create } from 'zustand';

export type HubFace = 'front' | 'games' | 'trade' | 'avatar' | 'music';
// chips rendered only when face === "front"
const ORDER: Exclude<HubFace, 'front'>[] = ['games', 'trade', 'avatar', 'music'];

type HubState = {
  face: HubFace; // "front" shows selector chips
  selectorIndex: number; // which chip is focused on front
  idle: boolean; // idle wobble on/off
  isZooming: boolean; // in transition
  setFace: (f: HubFace) => void;
  rotate: (dir: 1 | -1) => void; // rotate left/right among ORDER (skips "front")
  focusChip: (i: number) => void; // 0..3
  confirm: () => void; // if front -> rotate to focused; else -> zoom
  backToIdle: () => void; // reset after nav
};

export const useHub = create<HubState>((set, get) => ({
  face: 'front',
  selectorIndex: 0,
  idle: true,
  isZooming: false,
  setFace(f) {
    if (!get().isZooming) set({ face: f });
  },
  rotate(dir) {
    if (get().isZooming) return;
    const cur = get().face;
    if (cur === 'front') {
      const i = get().selectorIndex;
      const next = (i + (dir === 1 ? 1 : -1) + ORDER.length) % ORDER.length;
      set({ selectorIndex: next });
      return;
    }
    const idx = ORDER.indexOf(cur as any);
    const nextIdx = (idx + (dir === 1 ? 1 : -1) + ORDER.length) % ORDER.length;
    const next = ORDER[nextIdx];
    if (next) {
      set({ face: next });
    }
  },
  focusChip(i) {
    if (get().face === 'front') set({ selectorIndex: Math.max(0, Math.min(3, i)) });
  },
  async confirm() {
    if (get().isZooming) return;
    const state = get();
    if (state.face === 'front') {
      const target = ORDER[state.selectorIndex];
      if (target) {
        set({ face: target }); // spin toward that side first
      }
      return;
    }
    set({ isZooming: true, idle: false });
    // page effect handles routing after ~450ms
  },
  backToIdle() {
    set({ isZooming: false, idle: true, face: 'front' });
  },
}));

export { ORDER };
