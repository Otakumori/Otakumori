// DEPRECATED: This component is a duplicate. Use components\hero\BlogTeaser.tsx instead.
import GlassPanel from './GlassPanel';
import Link from 'next/link';
import { t } from '@/lib/microcopy';
import { env } from '@/env';

type Post = { id: string; slug: string; title: string; excerpt?: string; publishedAt?: string };

async function getPosts(): Promise<Post[]> {
  // Always use localhost for now to avoid production URL issues
  const baseUrl = 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/v1/content/blog?limit=3`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) return [];
  return (await res.json()) as Post[];
}

export default async function BlogTeaser() {
  const posts = await getPosts();
  if (!posts.length) return null;

  return (
    <section id="blog" className="relative z-10 mx-auto mt-10 max-w-7xl px-4 md:mt-14 md:px-6">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold text-fuchsia-100 md:text-2xl">
          {t('cta', 'newPost1')}
        </h2>
        <Link href="/blog" className="text-sm text-fuchsia-300 hover:text-fuchsia-200">
          {t('cta', 'download2')}
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {posts.map((p) => (
          <GlassPanel key={p.id} className="p-4">
            <Link href={`/blog/${p.slug}`} className="block">
              <h3 className="text-base font-semibold text-white">{p.title}</h3>
              {p.excerpt ? (
                <p className="mt-2 line-clamp-3 text-sm text-zinc-300/90">{p.excerpt}</p>
              ) : null}
            </Link>
          </GlassPanel>
        ))}
      </div>

      {/* Insiders nudge (subtle, optional) */}
      <div className="mt-6 text-center">
        <Link
          href="/insiders"
          className="text-sm text-fuchsia-300 hover:text-fuchsia-200 underline underline-offset-4"
        >
          {t('cta', 'signUp2')} {t('cta', 'signUp3')}.
        </Link>
      </div>
    </section>
  );
}
