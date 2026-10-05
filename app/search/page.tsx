import { generateSEO } from '@/app/lib/seo';
import SearchInterface from '../components/search/SearchInterface';


export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/search',
  });
}
export default function SearchPage() {
  return (
    <main className="om-route-page om-route-page--search relative z-10 min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-8 md:py-12">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-normal md:text-4xl">Search</h1>
          </div>

          <SearchInterface />
        </div>
    </main>
  );
}
