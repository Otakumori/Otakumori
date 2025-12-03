
import { generateSEO } from '@/app/lib/seo';
import { getGame } from '@/app/lib/assets/manifest';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\games\:slug\page.tsx',
  });
}
export default function GamePage({ params }: { params: { slug: string } }) {
  const entry = getGame(params.slug);
  if (!entry) return notFound();
  return (
    <div className="w-full h-[calc(100vh-4rem)] p-4">
      <iframe
        title={params.slug}
        src={entry}
        className="w-full h-full rounded-2xl shadow"
        allowFullScreen
      />
    </div>
  );
}
