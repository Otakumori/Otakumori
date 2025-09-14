import type { Metadata } from 'next';
import StarfieldPurple from '../components/StarfieldPurple';
import NavBar from '../components/NavBar';
import FooterDark from '../components/FooterDark';
import SearchInterface from '../components/search/SearchInterface';
import { t } from '@/lib/microcopy';

export const metadata: Metadata = {
  title: 'Search — Otaku-mori',
  description: 'Search for products, posts, and games.',
};

export default function SearchPage() {
  return (
    <>
      <StarfieldPurple />
      <NavBar />
      <main className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white md:text-4xl mb-4">
              Search
            </h1>
            <p className="text-lg text-zinc-300/90">
              {t("search", "suggesting")}
            </p>
          </div>

          <SearchInterface />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
