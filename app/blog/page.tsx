import type { Metadata } from 'next';
import { Suspense } from 'react';
import BlogIndex from '../components/blog/BlogIndex';
import { t } from '@/lib/microcopy';

export const metadata: Metadata = {
  title: 'Blog — Otaku-mori',
  description: 'Discover the latest insights, stories, and community highlights.',
};

// Force dynamic rendering to prevent timeout during static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function BlogPage() {
  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-pink-200 md:text-4xl mb-4">{t('nav', 'blog')}</h1>
          <p className="text-lg text-pink-200/70">
            Discover the latest insights, stories, and community highlights
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <div className="glass-panel rounded-2xl p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
                <p className="text-pink-200/70 mt-4">Loading blog posts...</p>
              </div>
            </div>
          }
        >
          <BlogIndex />
        </Suspense>
      </div>
    </main>
  );
}
