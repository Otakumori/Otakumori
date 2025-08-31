/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';
import useSWR from 'swr';
import Filters from './Filters';
import ShopItemCard from './ShopItemCard';
import EquipTray from './EquipTray';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Shop() {
  const { data, mutate } = useSWR('/api/shop', fetcher);
  const items = data?.items ?? [];
  const inv = data?.inventory ?? [];
  const balances = data?.balances ?? { petals: 0, runes: 0 };

  const handlePurchase = async (sku: string) => {
    // TODO: Implement purchase logic
    console.log(`Purchasing ${sku}`);
    // Refresh data after purchase
    await mutate();
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
      {/* left: catalog */}
      <section className="glass p-3">
        <Filters />
        <div className="sep" />
        <div className="grid-items">
          {items.map((it: any) => (
            <ShopItemCard key={it.sku} item={it} onPurchase={handlePurchase} />
          ))}
        </div>
      </section>

      {/* right: inventory & preview */}
      <aside className="glass-2 glass p-3">
        <EquipTray />
      </aside>
    </div>
  );
}
