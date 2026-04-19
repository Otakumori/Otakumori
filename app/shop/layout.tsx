import type { ReactNode } from 'react';
import { CartProvider } from '@/app/components/cart/CartProvider';

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
