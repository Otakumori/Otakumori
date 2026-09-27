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
          throw new Error(
            typeof result?.error === 'string'
              ? result.error
              : 'We could not verify this checkout return.',
          );
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
      .catch((error) => {
        if (cancelled) return;
        setState({
          kind: 'unverified',
          message: error instanceof Error ? error.message : 'We could not verify this checkout return.',
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
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
          {state.kind === 'loading' ? (
            <div role="status" aria-live="polite">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-pink-200" aria-hidden="true" />
              <h1 className="mt-6 text-3xl font-bold text-white">Verifying your order</h1>
              <p className="mt-3 text-pink-100">Please wait while we confirm payment securely.</p>
            </div>
          ) : null}

          {state.kind === 'confirmed' ? (
            <>
              <CheckCircle2 className="mx-auto h-16 w-16 text-pink-500" aria-hidden="true" />
              <h1 className="mt-6 text-3xl font-bold text-white">Order Confirmed</h1>
              <p className="mt-3 text-pink-100">
                Thank you for your purchase. Order #{state.confirmation.orderNumber} is recorded.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link href={paths.shop()}>
                  <Button className="w-full bg-pink-500 hover:bg-pink-600 sm:w-auto">Continue Shopping</Button>
                </Link>
                <Link href={paths.orders()}>
                  <Button variant="outline" className="w-full border-pink-500/30 text-pink-200 hover:bg-pink-500/10 sm:w-auto">
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    View Orders
                  </Button>
                </Link>
              </div>
            </>
          ) : null}

          {state.kind === 'sign-in-required' ? (
            <>
              <h1 className="text-3xl font-bold text-white">Sign in to confirm your order</h1>
              <p className="mt-3 text-pink-100">Use the account that completed checkout to view the order record.</p>
              <Link href={signInHref} className="mt-8 inline-block">
                <Button>Sign In</Button>
              </Link>
            </>
          ) : null}

          {state.kind === 'unverified' ? (
            <>
              <h1 className="text-3xl font-bold text-white">Order confirmation unavailable</h1>
              <p className="mt-3 text-pink-100" role="alert">{state.message}</p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link href={paths.orders()}>
                  <Button variant="outline">View Orders</Button>
                </Link>
                <Link href={paths.shop()}>
                  <Button>Return to Shop</Button>
                </Link>
              </div>
            </>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
