import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const sb = supabaseAdmin();
  const { data } = await sb.from('posts').select('title,excerpt').eq('slug', params.slug).single();
  return { title: data?.title ?? 'Post', description: data?.excerpt ?? undefined };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const sb = supabaseAdmin();
  const { data: post } = await sb.from('posts').select('*').eq('slug', params.slug).single();
  if (!post || post.status !== 'published') return notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <article className="prose prose-invert mx-auto max-w-3xl px-4 py-10">
        <h1>{post.title}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body_mdx}</ReactMarkdown>
      </article>
    </main>
  );
}
