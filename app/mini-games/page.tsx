
import { generateSEO } from '@/app/lib/seo';
import HubClient from './HubClient';

export function generateMetadata() {
  return generateSEO({
    title: 'Mini Games',
    description: 'Play mini-games and earn rewards',
    url: '/mini-games',
  });
}
export default function Page() {
  return <HubClient />;
}
