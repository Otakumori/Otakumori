'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { generateRecommendations, getAchievementSuggestions, type UserBehaviorProfile } from '@/app/lib/recommendations';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { SectionHeader } from './SectionHeader';
import { paths } from '@/lib/paths';

interface Recommendation {
  type: 'product' | 'game' | 'blog';
  id: string;
  title: string;
  reason: string;
  score: number;
  image?: string;
  slug?: string;
}

/**
 * "For You" personalized recommendations section
 */
export function ForYouSection() {
  const { isSignedIn, user } = useUser();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        // Fetch user behavior profile
        const profileResponse = await fetch('/api/v1/recommendations');
        if (!profileResponse.ok) {
          setLoading(false);
          return;
        }

        const profileResult = await profileResponse.json();
        if (!profileResult.ok) {
          setLoading(false);
          return;
        }

        const profile: UserBehaviorProfile = profileResult.data.profile;

        // Fetch available content
        const [productsRes, gamesRes, postsRes] = await Promise.all([
          fetch('/api/v1/products/featured?limit=20'),
          fetch('/api/v1/games?limit=20'),
          fetch('/api/v1/content/blog?limit=20'),
        ]);

        const products = productsRes.ok ? (await productsRes.json()).data?.products || [] : [];
        const games = gamesRes.ok ? (await gamesRes.json()).data?.games || [] : [];
        const posts = postsRes.ok ? (await postsRes.json()).data?.posts || [] : [];

        // Generate recommendations
        const recs = generateRecommendations(profile, products, games, posts);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isSignedIn]);

  if (!isSignedIn) {
    return null; // Don't show for non-authenticated users
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-8">
        <SectionHeader
          title="For You"
          description="Personalized recommendations based on your interests"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl p-8">
      <SectionHeader
        title="For You"
        description="Personalized recommendations based on your interests"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.slice(0, 6).map((rec) => {
          const href =
            rec.type === 'product'
              ? paths.product(rec.slug || rec.id)
              : rec.type === 'game'
                ? paths.game(rec.slug || rec.id)
                : paths.blogPost(rec.slug || rec.id);

          return (
            <Link
              key={`${rec.type}-${rec.id}`}
              href={href}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <GlassCard className="flex h-full flex-col">
                {rec.image && (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={rec.image}
                      alt={rec.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
                    <span className="absolute left-4 top-4 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-200 backdrop-blur">
                      {rec.type}
                    </span>
                  </div>
                )}
                <GlassCardContent className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="mb-3 font-semibold text-white transition-colors group-hover:text-pink-300">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-pink-200/80">{rec.reason}</p>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

