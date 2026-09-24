import { generateSEO } from '@/app/lib/seo';
import { Suspense } from 'react';
import BlogIndex from '../components/blog/BlogIndex';
import { t } from '@/lib/microcopy';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateMetadata() {
  return generateSEO({
    title: 'Blog',
    description: 'Stories, notes, and community updates from Otaku-mori.',
    url: '/blog',
  });
}

export default function BlogPage() {
  return (
    <main className="mori-page pt-24">
      <div className="mori-shell py-10 sm:py-14">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#fff1e4] md:text-4xl">
            {t('nav', 'blog')}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-[#cdbbb7]">
            Stories, updates, and field notes from the Otaku-mori world.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="mori-panel-soft flex min-h-52 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border border-[#efc7d2]/20 border-t-[#efc7d2]/70" />
                <p className="mt-4 text-sm text-[#cdbbb7]">Loading stories…</p>
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
