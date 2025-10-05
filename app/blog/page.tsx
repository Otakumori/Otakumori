import type { Metadata } from 'next';
import { Suspense } from 'react';
import StarfieldPurple from '../components/StarfieldPurple';
import Navbar from '../components/layout/Navbar';
import FooterDark from '../components/FooterDark';
import BlogIndex from '../components/blog/BlogIndex';
import { t } from '@/lib/microcopy';

export const metadata: Metadata = {
  title: 'Blog — Otaku-mori',
  description: 'Discover the latest insights, stories, and community highlights.',
};

export default function BlogPage() {
  return (
    <>
      <StarfieldPurple />
      <Navbar />
      <main
        className="relative z-10 min-h-screen"
        style={{ ['--om-star-duration-base' as any]: '760s' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary md:text-4xl mb-4">{t('nav', 'blog')}</h1>
            <p className="text-lg text-secondary">
              Discover the latest insights, stories, and community highlights
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <div className="glass-card p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-pink mx-auto"></div>
                  <p className="text-secondary mt-4">Loading blog posts...</p>
                </div>
              </div>
            }
          >
            <BlogIndex />
          </Suspense>
        </div>
      </main>
      <FooterDark />
    </>
  );
}
