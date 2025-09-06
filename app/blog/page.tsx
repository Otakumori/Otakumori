import { Metadata } from 'next';
import { Suspense } from 'react';
import StarfieldPurple from '../components/StarfieldPurple';
import NavBar from '../components/NavBar';
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
      <NavBar />
      <main className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white md:text-4xl mb-4">
              {t("nav", "blog")}
            </h1>
            <p className="text-lg text-zinc-300/90">
              Discover the latest insights, stories, and community highlights
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
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
