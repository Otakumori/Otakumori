import { generateSEO } from '@/app/lib/seo';
import { Suspense } from 'react';
import BlogIndex from '../components/blog/BlogIndex';
import { MoriArchetype, MoriSystemState } from '@/app/components/mori/MoriProduction';
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
    <MoriArchetype
      as="main"
      archetype="discovery"
      className="discovery-space discovery-space--stories om-route-page"
    >
      <header className="discovery-space__hero">
        <p className="discovery-space__eyebrow">Field notes</p>
        <h1>{t('nav', 'blog')}</h1>
        <p>Stories, updates, and records from the Otaku-mori world.</p>
      </header>

      <Suspense
        fallback={
          <MoriSystemState
            state="loading"
            title="Opening the story archive"
            description="Gathering the latest field notes."
          />
        }
      >
        <BlogIndex />
      </Suspense>
    </MoriArchetype>
  );
}
