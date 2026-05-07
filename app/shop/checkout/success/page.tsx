'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, PackageCheck, Sparkles } from 'lucide-react';
import { useCart } from '../../../components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { paths } from '@/lib/paths';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="min-h-screen bg-[#080611] px-4 pt-28 text-white sm:px-6 lg:px-8">
      <section className="glass-panel card-stroke mx-auto max-w-3xl rounded-3xl p-8 text-center shadow-2xl shadow-black/30 md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-sakura-300/30 bg-sakura-300/10 text-sakura-50">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <p className="font-ui mt-6 text-xs uppercase tracking-[0.32em] text-sakura-50/70">Order confirmed</p>
        <h1 className="font-display mt-4 text-3xl font-semibold md:text-5xl">Your order is in the grove.</h1>
        <p className="font-body mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70">
          Thank you for your purchase. Stripe has confirmed the checkout handoff, and your order details will appear in your account once processing finishes.
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 text-left md:grid-cols-2">
          <div className="flex gap-3">
            <PackageCheck className="mt-1 h-5 w-5 shrink-0 text-sakura-50" />
            <div>
              <h2 className="font-display text-lg text-white">Fulfillment next</h2>
              <p className="font-body mt-1 text-sm leading-6 text-white/60">We will prepare the order and update tracking when shipping details are available.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Sparkles className="mt-1 h-5 w-5 shrink-0 text-sakura-50" />
            <div>
              <h2 className="font-display text-lg text-white">Petal rewards later</h2>
              <p className="font-body mt-1 text-sm leading-6 text-white/60">Purchase-linked Petal Pouch rewards should settle through the server reward flow when that system is enabled.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href={paths.shop()}>
            <Button className="btn-primary w-full sm:w-auto">Continue shopping</Button>
          </Link>
          <Link href="/account/orders">
            <Button variant="outline" className="focus-ring w-full border-sakura-300/25 text-sakura-50 hover:bg-sakura-300/10 sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              View orders
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
