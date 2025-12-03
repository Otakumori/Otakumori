import { generateSEO } from '@/app/lib/seo';


export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/health',
  });
}
export default function Page() {
  return 'ok';
}
