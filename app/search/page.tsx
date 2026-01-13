import { generateSEO } from '@/app/lib/seo';
import StarfieldPurple from '../components/StarfieldPurple';
import Navbar from '../components/layout/Navbar';
import FooterDark from '../components/FooterDark';
import SearchInterface from '../components/search/SearchInterface';
import { t } from '@/lib/microcopy';


export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/search',
  });
}
export default function SearchPage() {
  return (
    <>
      <StarfieldPurple />
      <Navbar />
      <main className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white md:text-4xl mb-4">Search</h1>
            <p className="text-lg text-zinc-300/90">{t('search', 'suggesting')}</p>
          </div>

          <SearchInterface />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
