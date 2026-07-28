'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import FooterDark from '@/app/components/FooterDark';
import { EmptyWishlist } from '@/app/components/empty-states';
import { ShopGridSkeleton } from '@/app/components/ui/Skeleton';
import GlassPanel from '@/app/components/GlassPanel';
import { buildCanonicalSignInUrl } from '@/app/lib/auth/accountUrls';
import { normalizeApiErrorMessage } from '@/app/lib/api-error-message';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
}

export default function WishlistPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const fetchedUserIdRef = useRef<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/v1/wishlist');
      const data = await response.json();
      if (data.ok) {
        setWishlist(data.data.items || []);
      } else {
        setError(normalizeApiErrorMessage(data.error, 'Failed to load wishlist'));
      }
    } catch (err) {
      setError('Failed to load wishlist');
      const logger = await getLogger();
      logger.error('Wishlist fetch error:', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      fetchedUserIdRef.current = null;
      setLoading(false);
      router.push(buildCanonicalSignInUrl('/wishlist'));
      return;
    }
    if (userId && fetchedUserIdRef.current !== userId) {
      fetchedUserIdRef.current = userId;
      void fetchWishlist();
    }
  }, [fetchWishlist, isLoaded, isSignedIn, router, userId]);

  const handleRemove = async (itemId: string, productId: string) => {
    if (removing.has(itemId)) return;
    try {
      setRemoving((prev) => new Set(prev).add(itemId));
      const idempotencyKey = `wishlist-remove-${itemId}-${Date.now()}`;
      const response = await fetch('/api/v1/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await response.json();
      if (data.ok && !data.data.isInWishlist) {
        // Item was removed, update local state
        setWishlist((prev) => prev.filter((item) => item.id !== itemId));
      } else if (!data.ok) {
        setError(normalizeApiErrorMessage(data.error, 'Failed to remove item'));
      }
    } catch (err) {
      setError('Failed to remove item');
      const logger = await getLogger();
      logger.error('Remove wishlist error:', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  if (isLoaded && !isSignedIn) {
    return null; // Will redirect
  }

  if (!isLoaded || loading) {
    return (
      <>
        <main className="relative z-10 min-h-screen bg-[#080611]">
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white md:text-4xl">My Wishlist</h1>
              <p className="mt-2 text-zinc-300/90">Items you've saved for later</p>
            </div>
            <ShopGridSkeleton count={6} />
          </div>
        </main>
        <FooterDark />
      </>
    );
  }

  if (error) {
    return (
      <>
        <main className="relative z-10 min-h-screen bg-[#080611]">
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white md:text-4xl">My Wishlist</h1>
              <p className="mt-2 text-zinc-300/90">Items you've saved for later</p>
            </div>
            <GlassPanel className="p-8 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchWishlist}
                className="rounded-xl bg-pink-500/90 px-6 py-3 text-white hover:bg-pink-500 transition-colors"
              >
                Try Again
              </button>
            </GlassPanel>
          </div>
        </main>
        <FooterDark />
      </>
    );
  }

  return (
    <>
      <main className="relative z-10 min-h-screen bg-[#080611]">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white md:text-4xl">My Wishlist</h1>
            <p className="mt-2 text-zinc-300/90">
              {wishlist.length > 0
                ? `${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} saved`
                : "Items you've saved for later"}
            </p>
          </div>
          {wishlist.length === 0 ? (
            <div className="text-center py-12">
              <EmptyWishlist />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <GlassPanel
                  key={item.id}
                  className="group relative overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                >
                  <Link
                    href={`/shop/${item.product.id}`}
                    className="block"
                    aria-label={`View ${item.product.name}`}
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                          <Heart className="h-12 w-12 text-pink-400/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/40" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-white line-clamp-2 mb-2 group-hover:text-pink-200 transition-colors">
                        {item.product.name}
                      </h3>
                      {item.product.price > 0 && (
                        <p className="text-xs text-zinc-300/90">${item.product.price.toFixed(2)}</p>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(item.id, item.productId);
                    }}
                    disabled={removing.has(item.id)}
                    className="absolute right-3 top-3 rounded-full bg-black/60 backdrop-blur-sm p-2 text-white/90 hover:bg-red-500/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Remove ${item.product.name} from wishlist`}
                  >
                    {removing.has(item.id) ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </GlassPanel>
              ))}
            </div>
          )}
        </div>
      </main>
      <FooterDark />
    </>
  );
}
