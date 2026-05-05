import { generateSEO } from '@/app/lib/seo';
import MaidCafeManagerClient from './MaidCafeManagerClient';

export function generateMetadata() {
  return generateSEO({
    title: 'Maid Café Manager',
    description: 'Manage shifts and keep guests smiling.',
    url: '/mini-games/maid-cafe-manager',
  });
}

export default function MaidCafeManagerPage() {
  return <MaidCafeManagerClient />;
}
