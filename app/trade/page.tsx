import { generateSEO } from '@/app/lib/seo';
import Shop from './ui/Shop';
import './trade.css';
import SectionShell from '@/app/(sections)/_shared/SectionShell';

export function generateMetadata() {
  return generateSEO({
    title: 'Scarlet Bazaar',
    description: 'Trade items in the Scarlet Bazaar',
    url: '/trade',
  });
}
export default function TradePage() {
  return (
    <SectionShell title="Trade Center" subtitle="Runes & Petals">
      <div className="p-4">
        <Shop />
      </div>
    </SectionShell>
  );
}
