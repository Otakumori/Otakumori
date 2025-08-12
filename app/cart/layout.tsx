import { CartProvider } from '../../components/cart/CartProvider';

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
