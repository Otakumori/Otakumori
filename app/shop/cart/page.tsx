'use client';

// Force dynamic rendering to avoid static generation issues with context providers
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { useCart } from '../../components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';

import { paths } from '../../../lib/paths';
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedVariant?: {
    id: string;
    title: string;
  };
}

export default function CartPage() {
  const { items: cart, updateQuantity, removeItem: removeFromCart, total } = useCart();

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="glass-card p-8 text-center max-w-md mx-auto">
            <h1 className="mb-4 text-2xl font-bold text-primary">Your Cart is Empty</h1>
            <p className="mb-8 text-secondary">Add some items to your cart to start shopping</p>
            <Link href={paths.shop()}>
              <Button className="btn-primary">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center">
          <Link
            href={paths.shop()}
            className="flex items-center text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h1 className="mb-6 text-2xl font-bold text-primary">Shopping Cart</h1>
              <div className="space-y-6">
                {cart.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center gap-6">
                    <div className="relative h-24 w-24">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{item.name}</h3>
                      {item.selectedVariant && (
                        <p className="text-sm text-secondary">{item.selectedVariant.title}</p>
                      )}
                      <p className="text-accent-pink">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 border-glass-border text-secondary hover:bg-glass-bg-hover"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-primary">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 border-glass-border text-secondary hover:bg-glass-bg-hover"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-secondary hover:bg-glass-bg-hover hover:text-primary"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="glass-card p-6">
              <h2 className="mb-6 text-2xl font-bold text-primary">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-secondary">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between border-t border-glass-border pt-4 font-semibold text-primary">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href={paths.checkout()}>
                  <Button className="w-full btn-primary">Proceed to Checkout</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
