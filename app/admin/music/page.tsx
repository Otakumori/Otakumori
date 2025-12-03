
import { generateSEO } from '@/app/lib/seo';
import AdminMusicClient from './page.client';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\admin\music\page.tsx',
  });
}
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        {
          <>
            <span role="img" aria-label="emoji">
              M
            </span>
            <span role="img" aria-label="emoji">
              u
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              c
            </span>
            ' '
            <span role="img" aria-label="emoji">
              P
            </span>
            <span role="img" aria-label="emoji">
              l
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              y
            </span>
            <span role="img" aria-label="emoji">
              l
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
          </>
        }
      </h1>
      <AdminMusicClient />
    </main>
  );
}
