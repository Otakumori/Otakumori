
import { generateSEO } from '@/app/lib/seo';
import { getGame } from '@/app/lib/assets/manifest';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return generateSEO({
    title: 'Game',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: `/games/${slug}`,
  });
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getGame(slug);
  if (!entry) return notFound();
  return (
    <div className="w-full h-[calc(100vh-4rem)] p-4">
      <iframe
        title={slug}
        src={entry}
        className="w-full h-full rounded-2xl shadow"
        allowFullScreen
      />
    </div>
  );
}
