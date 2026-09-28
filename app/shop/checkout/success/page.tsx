'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '../../../components/cart/CartProvider';
import { buildCanonicalSignInUrl } from '@/app/lib/auth/accountUrls';
import { paths } from '@/lib/paths';

type Confirmation = {
  orderId: string;
  orderNumber: number;
  status: string;
};

type ConfirmationState =
  | { kind: 'loading' }
  | { kind: 'confirmed'; confirmation: Confirmation }
  | { kind: 'unverified'; message: string }
  | { kind: 'sign-in-required' };

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const clearedSessionRef = useRef<string | null>(null);
  const [state, setState] = useState<ConfirmationState>(() => {
    if (!sessionId) {
      return { kind: 'unverified', message: 'We could not identify this checkout return.' };
    }
    return { kind: 'loading' };
  });

  useEffect(() => {
    if (!sessionId) {
      setState({ kind: 'unverified', message: 'We could not identify this checkout return.' });
      return;
    }

    if (!isSignedIn) {
      setState({ kind: 'sign-in-required' });
      return;
    }

    let cancelled = false;
    setState({ kind: 'loading' });

    void fetch(`/api/v1/checkout/confirmation?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.ok || !result.data) {
          throw new Error('We could not verify this checkout return.');
        }
        return result.data as Confirmation;
      })
      .then((confirmation) => {
        if (cancelled) return;
        setState({ kind: 'confirmed', confirmation });
        if (clearedSessionRef.current !== sessionId) {
          clearCart();
          clearedSessionRef.current = sessionId;
        }
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          kind: 'unverified',
          message: 'We could not verify this checkout return.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [clearCart, isSignedIn, sessionId]);

  const signInHref = buildCanonicalSignInUrl(
    sessionId
      ? `${paths.checkoutSuccess()}?session_id=${encodeURIComponent(sessionId)}`
      : paths.checkoutSuccess(),
  );

  return (
    <main className="om-route-page om-route-page--success min-h-screen pt-20">
      <div className="container mx-auto px-4 py-16">
        <Card className="om-route-state om-route-state--bounded mx-auto max-w-2xl border-[#c6a77d]/36 bg-transparent p-8 text-center shadow-none backdrop-blur-none">
          {state.kind === 'loading' ? (
            <div role="status" aria-live="polite">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#c6a77d]" aria-hidden="true" />
              <h1 className="mt-6 font-display text-3xl font-semibold text-[#f6eddf]">Verifying your order</h1>
              <p className="mt-3 text-[#d9cdbd]">Please wait while we confirm payment securely.</p>
            </div>
          ) : null}

          {state.kind === 'confirmed' ? (
            <>
              <span aria-hidden="true" className="om-provisional-seal" />
              <CheckCircle2 className="mx-auto h-12 w-12 text-[#c6a77d]" aria-hidden="true" />
              <h1 className="mt-6 font-display text-3xl font-semibold text-[#f6eddf]">Order Confirmed</h1>
              <p className="mt-3 text-[#d9cdbd]">
                Thank you for your purchase. Order #{state.confirmation.orderNumber} is recorded.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link href={paths.shop()}>
                  <Button className="mori-button-primary w-full sm:w-auto">Continue Shopping</Button>
                </Link>
                <Link href={paths.orders()}>
                  <Button variant="outline" className="mori-button-secondary w-full sm:w-auto">
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    View Orders
                  </Button>
                </Link>
              </div>
            </>
          ) : null}

          {state.kind === 'sign-in-required' ? (
            <>
              <h1 className="font-display text-3xl font-semibold text-[#f6eddf]">Sign in to confirm your order</h1>
              <p className="mt-3 text-[#d9cdbd]">Use the account that completed checkout to view the order record.</p>
              <Link href={signInHref} className="mt-8 inline-block">
                <Button>Sign In</Button>
              </Link>
            </>
          ) : null}

          {state.kind === 'unverified' ? (
            <>
              <span aria-hidden="true" className="om-provisional-seal om-provisional-seal--quiet" />
              <h1 className="font-display text-3xl font-semibold text-[#f6eddf]">Order confirmation unavailable</h1>
              <p className="mt-3 text-[#d9cdbd]" role="alert">{state.message}</p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link href={paths.orders()}>
                  <Button variant="outline" className="mori-button-secondary">View Orders</Button>
                </Link>
                <Link href={paths.shop()}>
                  <Button className="mori-button-primary">Return to Shop</Button>
                </Link>
              </div>
            </>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
