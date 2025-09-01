 
 
'use client';
import useSWR from 'swr';
import manifest from '../../../public/assets/manifest.json';

export default function BadgeWall() {
  const { data } = useSWR('/api/profile/me', (u) => fetch(u).then((r) => r.json()));
  const badges = data?.badges || [];

  return (
    <div>
      <div className="mb-2 text-sm opacity-80">Badges</div>
      <div className="flex flex-wrap gap-8">
        {badges.map((badge: any) => (
          <div key={badge.id || badge} className="badge">
            <img
              src={imageFromSku(badge.id || badge) || '/assets/ui/profile/badge_placeholder.png'}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        ))}
        {!badges.length && <div className="text-sm opacity-60">No badges yet.</div>}
      </div>
    </div>
  );
}

function imageFromSku(sku: string) {
  if (sku === 'badge.sakura.v1') return '/assets/cosmetics/frames/frame_sakura_v1.png';
  if (sku === 'badge.anime.v1') return '/assets/cosmetics/frames/frame_anime_v1.png';
  if (sku === 'badge.manga.v1') return '/assets/cosmetics/frames/frame_manga_v1.png';
  if (sku === 'badge.otaku.v1') return '/assets/cosmetics/frames/frame_otaku_v1.png';

  // Try to find in manifest structure
  try {
    const manifestAny = manifest as any;
    if (manifestAny.cosmetics?.badges?.[sku]) return manifestAny.cosmetics.badges[sku];
    if (manifestAny.ui?.badges?.[sku]) return manifestAny.ui.badges[sku];
  } catch (e) {
    // Fallback to placeholder
  }

  return null;
}
