'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GlassPanel from '../GlassPanel';
import { t } from '@/lib/microcopy';
import { useCart } from '@/app/components/cart/CartProvider';

export default function CartContent() {
  const { items, updateQuantity, removeItem } = useCart();
  const isUpdating = false;
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <GlassPanel className="p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            {t("cart", "empty")}
          </h2>
          <p className="text-zinc-400 mb-6">
            Time for some side quests to fill your inventory!
          </p>
          <Link
            href="/shop"
            className="inline-block rounded-xl bg-fuchsia-500/90 px-6 py-3 text-white hover:bg-fuchsia-500 transition-colors"
          >
            Start Shopping
          </Link>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <GlassPanel key={item.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{item.name}</h3>
                {item.selectedVariant?.title && (
                  <p className="text-sm text-zinc-400">{item.selectedVariant.title}</p>
                )}
                <p className="text-fuchsia-300 font-semibold">${item.price}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-8 text-center text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={isUpdating}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                disabled={isUpdating}
                className="rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove
              </button>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <GlassPanel className="p-6 sticky top-8">
          <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-zinc-300">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between text-lg font-semibold text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-xl bg-fuchsia-500/90 px-6 py-4 text-center font-semibold text-white hover:bg-fuchsia-500 transition-colors"
          >
            {t("cart", "checkoutClarity")}
          </Link>
          
          <p className="mt-2 text-center text-xs text-zinc-400">
            {t("cart", "checkoutFlavor")}
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
