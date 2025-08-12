import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const sb = supabaseAdmin();
  const { data } = await sb.from('pages').select('title').eq('slug', params.slug).single();
  return { title: data?.title ?? 'Otaku-Mori' };
}

export default async function StaticPage({ params }: { params: { slug: string } }) {
  const sb = supabaseAdmin();
  const { data: page } = await sb.from('pages').select('*').eq('slug', params.slug).single();
  if (!page || page.status !== 'published') return notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <article className="prose prose-invert mx-auto max-w-3xl px-4 py-10">
        <h1>{page.title}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body_mdx}</ReactMarkdown>
      </article>
    </main>
  );
}
