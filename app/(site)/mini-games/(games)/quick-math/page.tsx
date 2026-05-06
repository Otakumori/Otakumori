import { generateSEO } from '@/app/lib/seo';
import QuickMathClient from './QuickMathClient';

export function generateMetadata() {
  return generateSEO({
    title: 'Quick Math',
    description: 'Answer fast. Pressure builds with each correct streak.',
    url: '/mini-games/quick-math',
  });
}

export default function Page() {
  return <QuickMathClient />;
}
