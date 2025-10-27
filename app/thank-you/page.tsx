// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import RuneGlyph from '@/components/runes/RuneGlyph';
import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Crown, Flower } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OrderResult {
  id: string;
  petalsAwarded: number;
  runes: Array<{
    id: string;
    canonicalId: string;
    displayName?: string;
    glyph?: string;
    lore?: string;
  }>;
  combos: Array<{
    id: string;
    comboId: string;
    revealCopy?: string;
    cosmeticBurst?: string;
  }>;
}

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBurst, setShowBurst] = useState(false);
  const [showComboReveal, setShowComboReveal] = useState(false);

  const sessionId = searchParams.get('s');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    if (!isSignedIn) {
      router.push('/sign-in?redirect=/thank-you?s=' + sessionId);
      return;
    }

    fetchOrderResult(sessionId);
  }, [sessionId, isSignedIn, router]);

  const fetchOrderResult = async (stripeSessionId: string) => {
    try {
      const response = await fetch(`/api/orders/by-session?sessionId=${stripeSessionId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrderResult(data);

      // Trigger burst if petals were awarded
      if (data.petalsAwarded > 0) {
        setTimeout(() => setShowBurst(true), 500);
      }

      // Check for combo reveals
      if (data.combos && data.combos.length > 0) {
        setTimeout(() => setShowComboReveal(true), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-32 w-32 animate-spin rounded-full border-b-2 border-pink-500"></div>
          <p className="text-lg text-pink-300">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-400">
            <span role="img" aria-label="Warning">
              ⚠️
            </span>
          </div>
          <h1 className="mb-4 text-2xl font-bold text-white">Order Not Found</h1>
          <p className="mb-6 text-neutral-300">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!orderResult) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Purchase Burst Effect */}
      <AnimatePresence>
        {showBurst && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="mb-4 text-8xl"
              >
                <span role="img" aria-label="Cherry blossom">
                  🌸
                </span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-pink-300"
              >
                +{orderResult.petalsAwarded} petals!
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo Reveal */}
      <AnimatePresence>
        {showComboReveal && orderResult.combos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed left-1/2 top-4 z-40 -translate-x-1/2 transform"
          >
            <div className="max-w-md rounded-2xl border border-purple-400/30 bg-gradient-to-r from-purple-600/90 to-pink-600/90 p-6 shadow-2xl backdrop-blur-sm">
              <div className="text-center">
                <Crown className="mx-auto mb-3 h-8 w-8 text-yellow-400" />
                <h3 className="mb-2 text-lg font-bold text-white">Combo Revealed!</h3>
                <p className="text-sm text-purple-100">
                  {orderResult.combos[0]?.revealCopy ||
                    'A mysterious combination has been unlocked.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20"
            >
              <CheckCircle className="h-12 w-12 text-green-400" />
            </motion.div>

            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">Order Complete!</h1>

            <p className="mx-auto max-w-2xl text-xl text-neutral-300">
              Thank you for your purchase. Your items are being prepared with care.
            </p>
          </motion.div>

          {/* Petals Awarded */}
          {orderResult.petalsAwarded > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12 rounded-2xl border border-pink-400/30 bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-8"
            >
              <div className="text-center">
                <div className="mb-4 flex items-center justify-center space-x-3">
                  <Flower className="h-8 w-8 text-pink-400" />
                  <h2 className="text-2xl font-bold text-white">Petal Bonus</h2>
                  <Flower className="h-8 w-8 text-pink-400" />
                </div>

                <div className="mb-2 text-4xl font-bold text-pink-300">
                  +{orderResult.petalsAwarded} petals
                </div>

                <p className="text-pink-200">You feel petals pull at the air.</p>
              </div>
            </motion.div>
          )}

          {/* Runes Awarded */}
          {orderResult.runes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-12"
            >
              <h2 className="mb-8 text-center text-3xl font-bold text-white">Runes Discovered</h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {orderResult.runes.map((rune, _index) => (
                  <motion.div
                    key={rune.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + _index * 0.1 }}
                    className="rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-6 transition-colors hover:border-amber-300/50"
                  >
                    <div className="text-center">
                      <div className="mb-3 text-4xl leading-none">
                        <RuneGlyph
                          canonicalId={rune.canonicalId as any}
                          glyph={rune.glyph ?? undefined}
                          displayName={rune.displayName ?? undefined}
                          size="lg"
                          animated={true}
                        />
                      </div>
                      <div className="mb-3 text-4xl hidden">{rune.glyph || '✶'}</div>
                      <h3 className="mb-2 text-lg font-bold text-white">
                        {rune.displayName ||
                          `Rune ${rune.canonicalId.split('_')[1]?.toUpperCase()}`}
                      </h3>
                      <p className="text-sm text-amber-200">{rune.lore || 'Origin withheld.'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Combo Information */}
          {orderResult.combos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="mb-12 rounded-2xl border border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-8"
            >
              <div className="text-center">
                <Crown className="mx-auto mb-4 h-12 w-12 text-yellow-400" />
                <h2 className="mb-4 text-2xl font-bold text-white">Combo Unlocked!</h2>

                {orderResult.combos.map((combo, _index) => (
                  <div key={combo.id} className="mb-4 last:mb-0">
                    <p className="text-lg text-purple-200">
                      {combo.revealCopy || 'A mysterious combination has been revealed.'}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-center"
          >
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() => router.push('/shop')}
                className="rounded-lg bg-pink-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-pink-700"
              >
                Continue Shopping
              </button>

              <button
                onClick={() => router.push('/profile')}
                className="rounded-lg border-2 border-pink-500/50 bg-transparent px-8 py-4 font-semibold text-pink-400 transition-colors hover:border-pink-400 hover:text-pink-300"
              >
                View Profile
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
