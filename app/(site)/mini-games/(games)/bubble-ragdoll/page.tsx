import { generateSEO } from '@/app/lib/seo';
import BubbleRagdollClient from './BubbleRagdollClient';

export function generateMetadata() {
  return generateSEO({
    title: 'Bubble Ragdoll',
    description: 'Toss the ragdoll into bubbles. Survive the chaos.',
    url: '/mini-games/bubble-ragdoll',
  });
}

export default function Page() {
  return <BubbleRagdollClient />;
}
