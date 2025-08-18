"use client";
import { create } from "zustand";

export type AnchorKey = "games" | "trade" | "avatar" | "music" | "drawerTop" | "drawerBottom";
export type Pt = { x: number; y: number; visible: boolean };

type AnchorState = {
  anchors: Partial<Record<AnchorKey, Pt>>;
  setAnchor: (k: AnchorKey, pt: Pt) => void;
  setMany: (m: Partial<Record<AnchorKey, Pt>>) => void;
};

export const useAnchors = create<AnchorState>((set) => ({
  anchors: {},
  setAnchor(k, pt) { set(s => ({ anchors: { ...s.anchors, [k]: pt } })); },
  setMany(m) { set(s => ({ anchors: { ...s.anchors, ...m } })); }
}));
