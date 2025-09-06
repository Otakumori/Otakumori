// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import { getGame } from '@/app/lib/assets/manifest';
import { notFound } from 'next/navigation';

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
