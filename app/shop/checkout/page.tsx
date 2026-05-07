'use client';

export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useCart } from '../../components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { paths } from '@/lib/paths';

type CheckoutLineItem = {
  productId: string;
  variantId: string;
  name: string;
  description?: string;
  images?: string[];
  quantity: number;
  priceCents: number;
  sku?: string;
};

function toAbsoluteImageUrl(image: string | undefined | null) {
  if (!image || typeof image !== 'string') return undefined;
  if (/^https?:\/\//i.test(image)) return image;
  if (typeof window === 'undefined') return undefined;
  if (image.startsWith('/')) return `${window.location.origin}${image}`;
  return undefined;
}

function makeIdempotencyKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `checkout_${crypto.randomUUID()}`;
  }

  return `checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export default function CheckoutPage() {
  const { items, total, itemCount } = useCart();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(paths.checkout())}`;

  const checkoutItems = useMemo<CheckoutLineItem[]>(() => {
    return items
      .filter((item) => item.selectedVariant?.id && item.price > 0 && item.quantity > 0)
      .map((item) => {
        const imageUrl = toAbsoluteImageUrl(item.image);
        return {
          productId: item.id,
          variantId: item.selectedVariant!.id,
          name: item.name,
          description: item.selectedVariant?.title,
          images: imageUrl ? [imageUrl] : undefined,
          quantity: item.quantity,
          priceCents: Math.round(item.price * 100),
          sku: `${item.id}-${item.selectedVariant!.id}`,
        };
      });
  }, [items]);

  async function startCheckout() {
    if (!isSignedIn) {
      setError('Please sign in to complete your purchase.');
      return;
    }

    if (checkoutItems.length === 0) {
      setError('Your cart has no checkout-ready items. Please return to cart and refresh your selections.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const origin = window.location.origin;
      const response = await fetch('/api/v1/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': makeIdempotencyKey(),
        },
        body: JSON.stringify({
          items: checkoutItems,
          successUrl: `${origin}${paths.checkoutSuccess()}?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}${paths.cart()}`,
          shippingInfo: {
            email: user?.primaryEmailAddress?.emailAddress,
            firstName: user?.firstName ?? undefined,
            lastName: user?.lastName ?? undefined,
          },
          shipping: {
            provider: 'stripe',
            fee: 0,
          },
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.ok || !result.data?.url) {
        throw new Error(result?.error || 'Stripe Checkout could not be started.');
      }

      window.location.assign(result.data.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Checkout failed. Please try again.');
      setIsSubmitting(false);
    }
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-[#080611] px-4 pt-28 text-white sm:px-6 lg:px-8">
        <section className="glass-panel card-stroke mx-auto max-w-2xl rounded-3xl p-8 text-center">
          <p className="font-ui text-xs uppercase tracking-[0.32em] text-sakura-50/70">Checkout</p>
          <h1 className="font-display mt-4 text-3xl font-semibold">Sign in to continue.</h1>
          <p className="font-body mt-4 text-white/70">Checkout is protected so your order can be connected to your account.</p>
          <Link href={signInHref} className="mt-7 inline-flex">
            <Button className="btn-primary">Sign in</Button>
          </Link>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#080611] px-4 pt-28 text-white sm:px-6 lg:px-8">
        <section className="glass-panel card-stroke mx-auto max-w-2xl rounded-3xl p-8 text-center">
          <p className="font-ui text-xs uppercase tracking-[0.32em] text-sakura-50/70">Checkout</p>
          <h1 className="font-display mt-4 text-3xl font-semibold">Your cart is empty.</h1>
          <p className="font-body mt-4 text-white/70">Add something from the grove before starting Stripe Checkout.</p>
          <Link href={paths.shop()} className="mt-7 inline-flex">
            <Button className="btn-primary">Return to shop</Button>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080611] px-4 pt-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl py-12">
        <Link href={paths.cart()} className="font-ui inline-flex items-center text-sm text-sakura-50/70 transition hover:text-sakura-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to cart
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="glass-card card-stroke rounded-3xl p-6 md:p-8">
            <p className="font-ui text-xs uppercase tracking-[0.32em] text-sakura-50/70">Secure Stripe Checkout</p>
            <h1 className="font-display mt-4 text-3xl font-semibold md:text-5xl">Review your order.</h1>
            <p className="font-body mt-4 max-w-2xl text-white/70">
              We hand you off to Stripe to collect payment, shipping, and tax details. Card data is handled by Stripe, not Otaku-mori.
            </p>

            <div className="mt-8 space-y-5">
              {items.map((item) => (
                <article key={`${item.id}-${item.selectedVariant?.id ?? 'default'}`} className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                    <Image src={item.image || '/placeholder-product.jpg'} alt={item.name} fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-xl text-white">{item.name}</h2>
                    {item.selectedVariant?.title ? <p className="font-body mt-1 text-sm text-white/58">{item.selectedVariant.title}</p> : null}
                    <p className="font-ui mt-3 text-sm text-sakura-50/80">Qty {item.quantity}</p>
                  </div>
                  <p className="font-ui shrink-0 text-sm text-white/80">${(item.price * item.quantity).toFixed(2)}</p>
                </article>
              ))}
            </div>
          </section>

          <aside className="glass-panel card-stroke h-fit rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 text-sakura-50">
              <ShieldCheck className="h-5 w-5" />
              <p className="font-ui text-xs uppercase tracking-[0.24em]">Protected payment</p>
            </div>
            <div className="mt-7 space-y-4 text-sm text-white/72">
              <div className="flex justify-between"><span>Items</span><span>{itemCount}</span></div>
              <div className="flex justify-between"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>Calculated by Stripe</span></div>
              <div className="flex justify-between"><span>Tax</span><span>Calculated by Stripe</span></div>
              <div className="flex justify-between border-t border-white/10 pt-4 text-base font-semibold text-white"><span>Due now</span><span>${total.toFixed(2)}+</span></div>
            </div>

            {error ? <p className="font-body mt-5 rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}

            <Button onClick={startCheckout} disabled={isSubmitting || checkoutItems.length === 0} className="btn-primary mt-6 w-full">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Opening Stripe...' : 'Continue to secure checkout'}
            </Button>

            <p className="font-body mt-4 text-xs leading-6 text-white/50">
              Product images are forwarded to Stripe when they are available as secure public URLs.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
