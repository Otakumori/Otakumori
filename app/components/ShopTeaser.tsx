import GlassPanel from './GlassPanel';
import Image from 'next/image';
import Link from 'next/link';
import { t } from '@/lib/microcopy';
import { env } from '@/env';

type Product = { id: string; name: string; price: number; image: string; slug?: string };

async function getFeatured(): Promise<Product[]> {
  const res = await fetch(`${env.NEXT_PUBLIC_SITE_URL ?? ''}/api/v1/products/featured`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  return (await res.json()) as Product[];
}

export default async function ShopTeaser() {
  const products = await getFeatured();
  if (!products.length) return null;

  return (
    <section id="shop" className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold text-fuchsia-100 md:text-2xl">{t("nav", "shop")}</h2>
        <Link href="/shop" className="text-sm text-fuchsia-300 hover:text-fuchsia-200">{t("cta", "download1")}</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {products.slice(0, 4).map((p) => (
          <GlassPanel key={p.id} className="group overflow-hidden">
            <Link href={`/shop/${p.slug ?? p.id}`} className="block">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-white">{p.name}</div>
                <div className="text-xs text-zinc-300/90">${p.price}</div>
              </div>
            </Link>
          </GlassPanel>
        ))}
      </div>
    </section>
  );
}
