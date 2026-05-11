'use client';

export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { useCart } from '@/app/components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { getCartCheckoutReadiness, getLineKey } from '@/lib/cart/reconciliation';
import { paths } from '@/lib/paths';
import { EmptyCart } from '@/app/components/empty-states';

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
  let isSignedIn = false;
  try {
    isSignedIn = Boolean(useAuth().isSignedIn);
  } catch {
    isSignedIn = false;
  }
  const { items: cart, updateQuantity, removeItem: removeFromCart, total } = useCart();
  const checkoutHref = isSignedIn
    ? paths.checkout()
    : paths.signIn(paths.checkout());
  const checkoutReadiness = getCartCheckoutReadiness(cart);

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#06040c] pt-24 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <EmptyCart />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#06040c] pt-24 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(255,106,169,0.14),transparent_30%),linear-gradient(180deg,#120817,#06040c_58%,#020103)]" />
      <div className="relative container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center">
          <Link href={paths.shop()} className="flex items-center text-pink-100/70 transition-colors hover:text-pink-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-md">
              <h1 className="mb-6 text-2xl font-semibold text-pink-50">Shopping Cart</h1>
              <div className="space-y-6">
                {cart.map((item: CartItem) => {
                  const lineKey = getLineKey(item);
                  return (
                    <div key={lineKey} className="flex flex-col gap-4 rounded-lg border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:gap-6">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-pink-50">{item.name}</h3>
                        {item.selectedVariant ? <p className="text-sm text-pink-100/60">{item.selectedVariant.title}</p> : <p className="text-sm text-amber-200">Choose options again before checkout.</p>}
                        <p className="text-pink-200">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(lineKey, item.quantity - 1)} className="h-8 w-8 border-glass-border text-secondary hover:bg-glass-bg-hover">
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-pink-50">{item.quantity}</span>
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(lineKey, item.quantity + 1)} className="h-8 w-8 border-glass-border text-secondary hover:bg-glass-bg-hover">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFromCart(lineKey)} className="text-secondary hover:bg-glass-bg-hover hover:text-primary">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-md">
              <h2 className="mb-6 text-2xl font-semibold text-pink-50">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-pink-50/70"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-pink-50/70"><span>Shipping</span><span>Calculated at payment</span></div>
                <div className="flex justify-between text-pink-50/70"><span>Tax</span><span>Calculated at payment</span></div>
                <div className="flex justify-between border-t border-white/10 pt-4 font-semibold text-pink-50"><span>Estimated subtotal</span><span>${total.toFixed(2)}</span></div>
              </div>
              {!checkoutReadiness.ready && (
                <p className="mt-5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
                  {checkoutReadiness.issues[0]?.message ?? 'Review cart options before checkout.'}
                </p>
              )}
              <div className="mt-6">
                {checkoutReadiness.ready ? (
                  <Link href={checkoutHref}>
                    <Button className="w-full bg-pink-500 hover:bg-pink-400">Proceed to Checkout</Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full bg-pink-500 hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-50">Proceed to Checkout</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
