'use client';

import Link from 'next/link';
import { paths } from '@/lib/paths';
import { approvedVisualAssets } from '@/lib/approved-visual-assets';
import { MoriArtwork } from '@/app/components/approved-art/MoriArtwork';

export function EmptyOrders() {
  return (
    <section className="commander-empty-orders">
      <MoriArtwork src={approvedVisualAssets.destinations.orders} />
      <h2>No orders yet</h2>
      <p>Your order history will appear here once you make your first purchase.</p>
      <Link href={paths.shop()} className="mori-foundation-button mt-5">
        Browse the goods
      </Link>
    </section>
  );
}
