/**
 * Petal Shop Page
 * Unlock cosmetics (HUD skins, overlays) with petals
 * Uses localStorage for guest users, ready for backend sync
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCosmetics } from '@/app/lib/cosmetics/useCosmetics';
import { cosmeticItems, type CosmeticItem } from '@/app/lib/cosmetics/cosmeticsConfig';
import { OmButton, OmCard, OmPanel, OmTag } from '@/app/components/ui/om';

export default function PetalShopPage() {
  const { unlockedIds: _unlockedIds, hudSkin, isHydrated, unlockItem, selectHudSkin, isUnlocked } = useCosmetics();
  const [petalBalance] = useState(1000); // TODO: Replace with real petal balance from store/API

  // Stub unlock function - in production, this would deduct petals via API
  const handleUnlock = (item: CosmeticItem) => {
    if (petalBalance < item.costPetals) {
      alert(`Insufficient petals! You need ${item.costPetals} petals.`);
      return;
    }

    // TODO: Call API to deduct petals and unlock item
    // For now, just unlock locally
    unlockItem(item.id);

    // If it's a HUD skin, auto-select it
    if (item.type === 'hud-skin' && item.hudSkinId) {
      selectHudSkin(item.hudSkinId);
    }
  };

  const handleSelect = (item: CosmeticItem) => {
    if (item.type === 'hud-skin' && item.hudSkinId) {
      selectHudSkin(item.hudSkinId);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-pink-200">Loading petal shop...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black p-4">
      <div className="container mx-auto max-w-6xl py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-pink-400 mb-2">Petal Shop</h1>
              <p className="text-zinc-300">Unlock exclusive cosmetics with your petals</p>
            </div>
            <Link
              href="/mini-games"
              className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
            >
              Back to Arcade
            </Link>
          </div>

          {/* Petal Balance */}
          <OmCard className="inline-block">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-pink-200">{petalBalance.toLocaleString()}</span>
              <span className="text-zinc-400">petals</span>
            </div>
          </OmCard>
        </div>

        {/* Cosmetics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cosmeticItems.map((item) => {
            const unlocked = isUnlocked(item.id);
            const isSelected = item.type === 'hud-skin' && item.hudSkinId === hudSkin;

            return (
              <OmCard key={item.id} className="flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                    {isSelected && <OmTag variant="status" status="active">Selected</OmTag>}
                    {unlocked && !isSelected && <OmTag variant="status" status="active">Unlocked</OmTag>}
                  </div>

                  <p className="text-zinc-300 text-sm mb-4">{item.description}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-pink-400 font-semibold">{item.costPetals}</span>
                    <span className="text-zinc-500 text-sm">petals</span>
                  </div>
                </div>

                <div className="mt-auto">
                  {!unlocked ? (
                    <OmButton
                      variant="primary"
                      className="w-full"
                      onClick={() => handleUnlock(item)}
                      disabled={petalBalance < item.costPetals}
                    >
                      {petalBalance < item.costPetals ? 'Insufficient Petals' : 'Unlock'}
                    </OmButton>
                  ) : isSelected ? (
                    <OmButton variant="ghost" className="w-full" disabled>
                      Currently Selected
                    </OmButton>
                  ) : (
                    <OmButton variant="primary" className="w-full" onClick={() => handleSelect(item)}>
                      Select
                    </OmButton>
                  )}
                </div>
              </OmCard>
            );
          })}
        </div>

        {/* Info Panel */}
        <OmPanel className="mt-8">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white mb-2">About Cosmetics</h3>
            <p className="text-zinc-300 text-sm">
              Cosmetics are visual enhancements that change how your game interface looks. HUD skins affect the
              appearance of game overlays and achievement screens.
            </p>
            <p className="text-zinc-400 text-xs mt-4">
              Note: Current implementation uses localStorage. Your cosmetics will sync with your account when you sign
              in.
            </p>
          </div>
        </OmPanel>
      </div>
    </div>
  );
}

