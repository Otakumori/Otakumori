'use client';
import Image from 'next/image';
import useSWR from 'swr';
import manifest from '../../../public/assets/manifest.json';

export default function TitlesWall() {
  const { data } = useSWR('/api/profile/me', (u) => fetch(u).then((r) => r.json()));
  const titles = data?.titles || [];

  return (
    <div>
      <div className="mb-2 text-sm opacity-80">Titles</div>
      <div className="chips">
        {titles.map((title: any) => (
          <span key={title.id || title} className="title-chip">
            <Image
              src={imageFromSku(title.id || title) || '/assets/ui/profile/title_chip.png'}
              alt=""
              width={14}
              height={14}
            />
            {pretty(title.id || title)}
          </span>
        ))}
        {!titles.length && <div className="text-sm opacity-60">No titles unlocked.</div>}
      </div>
    </div>
  );
}

function imageFromSku(sku: string) {
  if (sku === 'title.anime.master') return '/assets/cosmetics/titles/title_anime_master.png';
  if (sku === 'title.manga.expert') return '/assets/cosmetics/titles/title_manga_expert.png';
  if (sku === 'title.otaku.legend') return '/assets/cosmetics/titles/title_otaku_legend.png';
  if (sku === 'title.sakura.blossom') return '/assets/cosmetics/titles/title_sakura_blossom.png';

  // Try to find in manifest structure
  try {
    const manifestAny = manifest as any;
    if (manifestAny.cosmetics?.titles?.[sku]) return manifestAny.cosmetics.titles[sku];
    if (manifestAny.ui?.titles?.[sku]) return manifestAny.ui.titles[sku];
  } catch (e) {
    // Fallback to placeholder
  }

  return null;
}

function pretty(sku: string) {
  return sku
    .replace(/^title\./, '')
    .replace(/\./g, ' ')
    .toUpperCase();
}
