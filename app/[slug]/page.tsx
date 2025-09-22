// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const page = await db.contentPage.findUnique({
    where: { slug },
    select: { title: true },
  });
  return { title: page?.title ?? 'Otaku-Mori' };
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Don't handle API routes or other system routes
  if (
    slug.startsWith('api/') ||
    slug.startsWith('_next/') ||
    slug.startsWith('admin/')
  ) {
    return notFound();
  }

  const db = await getDb();
  const page = await db.contentPage.findUnique({
    where: { slug },
  });
  if (!page || !page.published) return notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <article className="prose prose-invert mx-auto max-w-3xl px-4 py-10">
        <h1>{page.title}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body || ''}</ReactMarkdown>
      </article>
    </main>
  );
}
