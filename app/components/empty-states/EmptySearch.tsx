'use client';

import { paths } from '@/lib/paths';
import Link from 'next/link';
import { approvedVisualAssets } from '@/lib/approved-visual-assets';
import { MoriArtwork } from '@/app/components/approved-art/MoriArtwork';
import { MoriSystemState } from '@/app/components/mori/MoriProduction';

interface EmptySearchProps {
  query?: string;
}

export function EmptySearch({ query }: EmptySearchProps) {
  return (
    <div className="discovery-empty">
      <MoriArtwork
        src={approvedVisualAssets.emptyStates.search}
        className="discovery-empty__art"
        sizes="(max-width: 640px) 9rem, 11rem"
      />
      <MoriSystemState
        state="empty"
        title="No results found"
        description={
          query
            ? `Nothing matches “${query}”. Try a broader phrase or another section.`
            : 'Try searching for products, stories, games, or people.'
        }
        action={
          <Link href={paths.shop()} className="mori-button-secondary">
            Browse the shop
          </Link>
        }
      />
    </div>
  );
}
