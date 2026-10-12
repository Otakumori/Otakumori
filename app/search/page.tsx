import { generateSEO } from '@/app/lib/seo';
import { MoriArchetype } from '@/app/components/mori/MoriProduction';
import SearchInterface from '../components/search/SearchInterface';


export function generateMetadata() {
  return generateSEO({
    title: 'Search',
    description: 'Search Otaku-mori products, stories, games, and community records.',
    url: '/search',
  });
}
export default function SearchPage() {
  return (
    <MoriArchetype
      as="main"
      archetype="discovery"
      className="discovery-space discovery-space--search om-route-page om-route-page--search"
    >
      <header className="discovery-space__hero">
        <p className="discovery-space__eyebrow">Archive index</p>
        <h1>Search Otaku-mori</h1>
        <p>Products, stories, games, and people gathered in one index.</p>
      </header>
      <SearchInterface />
    </MoriArchetype>
  );
}
