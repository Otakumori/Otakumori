'use client';

export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { paths } from '../../../lib/paths';
import { EmptyCart } from '@/app/components/empty-states';
import { buildCanonicalSignInUrl } from '@/app/lib/auth/accountUrls';
import { PetalBalanceDisplay } from '@/app/components/shop/PetalBalanceDisplay';

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

function getLineKey(item: CartItem) {
  return `${item.id}::${item.selectedVariant?.id ?? 'default'}`;
}

function normalizeCouponCodes(value: string | null): string[] {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(',')
        .map((code) => code.trim().toUpperCase())
        .filter((code) => /^[A-Z0-9-]{1,64}$/.test(code)),
    ),
  ).slice(0, 8);
}

export default function CartPage() {
  const { isSignedIn } = useAuth();
  const {
    items: cart,
    updateQuantity,
    removeItem: removeFromCart,
    total,
    syncWarning,
    retryServerSync,
  } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [couponInput, setCouponInput] = useState('');
  const couponCodes = useMemo(
    () => normalizeCouponCodes(searchParams.get('coupons')),
    [searchParams],
  );
  const checkoutPath = couponCodes.length
    ? `${paths.checkout()}?coupons=${encodeURIComponent(couponCodes.join(','))}`
    : paths.checkout();
  const checkoutHref = isSignedIn
    ? checkoutPath
    : buildCanonicalSignInUrl(checkoutPath);

  const updateCouponCodes = (nextCodes: string[]) => {
    const query = new URLSearchParams(searchParams.toString());
    if (nextCodes.length > 0) {
      query.set('coupons', nextCodes.join(','));
    } else {
      query.delete('coupons');
    }
    const suffix = query.toString();
    router.replace(suffix ? `${paths.cart()}?${suffix}` : paths.cart());
  };

  const addCouponCode = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = normalizeCouponCodes(couponInput)[0];
    if (!code || couponCodes.includes(code)) return;
    updateCouponCodes([...couponCodes, code]);
    setCouponInput('');
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <EmptyCart />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center">
          <Link href={paths.shop()} className="flex items-center text-secondary hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h1 className="mb-6 text-2xl font-bold text-primary">Shopping Cart</h1>
              <PetalBalanceDisplay />
              <form className="mb-6" onSubmit={addCouponCode}>
                <label htmlFor="cart-coupon-code" className="mb-2 block text-sm text-secondary">
                  Coupon code
                </label>
                <div className="flex gap-2">
                  <input
                    id="cart-coupon-code"
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    className="min-w-0 flex-1 rounded border border-glass-border bg-transparent px-3 py-2 text-primary"
                    placeholder="Enter code"
                  />
                  <Button type="submit" variant="outline">Apply</Button>
                </div>
                {couponCodes.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2" aria-live="polite">
                    {couponCodes.map((code) => (
                      <Button
                        key={code}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateCouponCodes(couponCodes.filter((value) => value !== code))}
                        aria-label={`Remove coupon ${code}`}
                      >
                        {code} ×
                      </Button>
                    ))}
                  </div>
                ) : null}
              </form>
              <p className="mb-6 text-sm text-secondary">
                Coupon eligibility and totals are confirmed securely at checkout.
              </p>
              {syncWarning ? (
                <div className="mb-6 rounded border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100" role="status">
                  <p>{syncWarning}</p>
                  <Button type="button" variant="outline" size="sm" className="mt-3" onClick={retryServerSync}>
                    Retry sync
                  </Button>
                </div>
              ) : null}
              <div className="space-y-6">
                {cart.map((item: CartItem) => {
                  const lineKey = getLineKey(item);
                  return (
                    <div key={lineKey} className="flex items-center gap-6">
                      <div className="relative h-24 w-24">
                        <Image src={item.image} alt={item.name} fill className="rounded-lg object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary">{item.name}</h3>
                        {item.selectedVariant && <p className="text-sm text-secondary">{item.selectedVariant.title}</p>}
                        <p className="text-accent-pink">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(lineKey, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity for ${item.name}`}
                          className="h-8 w-8 border-glass-border text-secondary hover:bg-glass-bg-hover"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <output className="w-8 text-center text-primary" aria-live="polite" aria-label={`Quantity for ${item.name}`}>
                          {item.quantity}
                        </output>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(lineKey, item.quantity + 1)}
                          aria-label={`Increase quantity for ${item.name}`}
                          className="h-8 w-8 border-glass-border text-secondary hover:bg-glass-bg-hover"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(lineKey)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="text-secondary hover:bg-glass-bg-hover hover:text-primary"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="glass-card p-6">
              <h2 className="mb-6 text-2xl font-bold text-primary">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-secondary"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-secondary"><span>Shipping</span><span>Calculated at checkout</span></div>
                <div className="flex justify-between text-secondary"><span>Tax</span><span>Calculated at checkout</span></div>
                <div className="flex justify-between border-t border-glass-border pt-4 font-semibold text-primary"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
              <div className="mt-6">
                <Link href={checkoutHref}>
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
