'use client';

import { useCosmetics } from '@/app/lib/cosmetics/useCosmetics';
import Link from 'next/link';
import { cosmeticItems, type HudSkinId } from '@/app/lib/cosmetics/cosmeticsConfig';

/**
 * Cosmetics tab content
 * Shows equipped HUD and owned cosmetics
 */
export default function CosmeticsTab() {
  const { unlockedIds, hudSkin, isHydrated } = useCosmetics();

  // HUD skin display names
  const hudSkinNames: Record<HudSkinId, { name: string; description: string; icon: string }> = {
    default: { name: 'Default HUD', description: 'Standard game interface', icon: '🎮' },
    quake: { name: 'Quake-Style HUD', description: 'Retro arena shooter vibes', icon: '💀' },
  };

  const equippedHud = hudSkinNames[hudSkin];
  const ownedItems = cosmeticItems.filter((item) =>
    unlockedIds.includes(item.id),
  );

  if (!isHydrated) {
    return <div className="text-center py-8 text-zinc-400">Loading cosmetics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Equipped HUD */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Equipped HUD</h3>
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-white/20 bg-black/50 p-3">
            <div className="text-2xl">{equippedHud.icon}</div>
          </div>
          <div>
            <div className="text-white font-medium">{equippedHud.name}</div>
            <div className="text-sm text-zinc-400">{equippedHud.description}</div>
          </div>
        </div>
      </div>

      {/* Owned Cosmetics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Owned Cosmetics</h3>
          <Link
            href="/petal-shop"
            className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
          >
            Open Petal Shop →
          </Link>
        </div>

        {ownedItems.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5">
            <p className="text-zinc-400 mb-2">No cosmetics owned yet</p>
            <Link
              href="/petal-shop"
              className="inline-block mt-4 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-sm text-white transition-colors"
            >
              Visit Petal Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ownedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-white/10 bg-white/5 p-4 text-center"
              >
                <div className="text-3xl mb-2">
                  <span role="img" aria-label="Sparkle">✨</span>
                </div>
                <div className="text-sm text-white font-medium">{item.name}</div>
                <div className="text-xs text-zinc-400 mt-1">{item.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

