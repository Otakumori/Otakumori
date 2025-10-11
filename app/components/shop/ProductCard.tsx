'use client';
import Image from 'next/image';
import { useCart } from '@/app/components/cart/CartProvider';
import { usePetalContext } from '@/providers';
import PetalIcon from '@/app/components/icons/Petal';
import type { Product } from '@/app/lib/shop/types';
import { PETAL_TO_USD as RATE } from '@/app/lib/shop/types';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { addPetals: earn, setPetals: spend } = usePetalContext()();
  const {
    id,
    title,
    image,
    priceUSD,
    petalPrice,
    petalBonus = Math.round(priceUSD * 0.1),
    tag,
    inStock = true,
  } = product;

  const handleAdd = () => {
    if (!inStock) return;
    addItem({
      id,
      name: title,
      price: priceUSD,
      quantity: 1,
      image,
    });
    // if sold for USD → earn petals; if sold in petals → spend petals
    if (typeof petalPrice === 'number') spend(petalPrice);
    else earn(petalBonus);
  };

  return (
    <article className="group relative rounded-3xl border border-white/10 bg-white/6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden transition-transform duration-300 ease-out hover:scale-[1.01]">
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent group-hover:ring-purple-400/40 transition-[ring] duration-300" />
      <div className="relative aspect-[4/5]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width:1024px) 25vw, (min-width:640px) 45vw, 90vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/0 to-black/25" />
        {tag && (
          <span className="absolute left-3 top-3 rounded-full bg-purple-500/80 px-2.5 py-1 text-[10px] font-semibold text-white">
            {tag}
          </span>
        )}
        {!inStock && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-600/80 px-2.5 py-1 text-[10px] font-semibold text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5 space-y-3">
        <h3 className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 drop-shadow-[0_1px_0_rgba(0,0,0,0.3)]">
          {title}
        </h3>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            {typeof petalPrice === 'number' ? (
              <>
                <div className="flex items-center gap-1.5 text-pink-200">
                  <PetalIcon className="h-4 w-4" />
                  <span className="text-sm font-bold">{petalPrice.toLocaleString()} petals</span>
                </div>
                <span className="text-xs text-white/60">
                  ≈ ${(petalPrice * RATE).toFixed(2)} USD
                </span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold">${priceUSD.toFixed(2)}</span>
                <div className="flex items-center gap-1.5 text-xs text-white/70">
                  <PetalIcon className="h-3 w-3" />
                  <span>Earn {petalBonus} petals</span>
                </div>
              </>
            )}
          </div>
          <button
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/90 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
            aria-label="Add to wishlist"
            title="Add to wishlist"
          >
            Wish
          </button>
        </div>
        <button
          disabled={!inStock}
          onClick={handleAdd}
          className={[
            'w-full rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors',
            inStock
              ? 'bg-pink-500/90 hover:bg-pink-400/90 text-black'
              : 'bg-white/10 text-white/50 cursor-not-allowed',
          ].join(' ')}
        >
          {inStock ? 'Add to bottomless cart' : 'Out of stock'}
        </button>
      </div>
    </article>
  );
}
