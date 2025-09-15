// DEPRECATED: This component is a duplicate. Use app\lib\petals.ts instead.
'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';

type PetalCtx = { petals: number; earn: (n: number) => void; spend: (n: number) => void };
const P = createContext<PetalCtx | null>(null);

export function PetalProvider({ children }: { children: ReactNode }) {
  const [petals, set] = useState(0);
  const earn = (n: number) => set((v) => v + n);
  const spend = (n: number) => set((v) => Math.max(0, v - n));
  return <P.Provider value={{ petals, earn, spend }}>{children}</P.Provider>;
}
export function usePetals() {
  const v = useContext(P);
  if (!v) throw new Error('usePetals must be used within a PetalProvider');
  return v;
}
