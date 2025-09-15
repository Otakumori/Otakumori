// DEPRECATED: This component is a duplicate. Use src\lib\cart.ts instead.
'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';

type CartItem = { id: string; qty: number };
type CartCtx = {
  items: CartItem[];
  itemCount: number;
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
};
const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, set] = useState<CartItem[]>([]);
  const add = (id: string, qty = 1) =>
    set((s) => {
      const i = s.findIndex((x) => x.id === id);
      if (i >= 0) {
        const c = [...s];
        c[i] = { ...c[i], qty: c[i].qty + qty };
        return c;
      }
      return [...s, { id, qty }];
    });
  const remove = (id: string) => set((s) => s.filter((x) => x.id !== id));
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  return <Ctx.Provider value={{ items, itemCount, add, remove }}>{children}</Ctx.Provider>;
}
export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart must be used within a CartProvider');
  return v;
}
