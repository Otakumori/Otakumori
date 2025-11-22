/**
 * Petal Shop Page
 * Unlock cosmetics (HUD skins, overlays) with petals
 * Uses localStorage for guest users, ready for backend sync
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCosmetics } from '@/app/lib/cosmetics/useCosmetics';
import {
  type CosmeticItem,
  getAvatarCosmetics,
  getHudSkinCosmetics,
} from '@/app/lib/cosmetics/cosmeticsConfig';
import { DISCOUNT_VOUCHER_TIERS } from '@/app/config/petalTuning';
import { OmButton, OmCard, OmPanel, OmTag } from '@/app/components/ui/om';

export default function PetalShopPage() {
  const {
    unlockedIds: _unlockedIds,
    hudSkin,
    isHydrated,
    unlockItem,
    selectHudSkin,
    isUnlocked,
  } = useCosmetics();
  const [petalBalance, setPetalBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchasingVoucher, setPurchasingVoucher] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<
    Array<{ code: string; percentOff: number | null; expiresAt: Date | null }>
  >([]);
  const [discountEnabled, setDiscountEnabled] = useState(false);

  // Fetch petal balance and vouchers
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceResponse = await fetch('/api/v1/petals/balance');
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          if (balanceData.ok && balanceData.data?.balance !== undefined) {
            setPetalBalance(balanceData.data.balance);
          }
        } else {
          // Fallback to legacy API
          const legacyResponse = await fetch('/api/petals/me');
          if (legacyResponse.ok) {
            const legacyData = await legacyResponse.json();
            setPetalBalance(legacyData.total || 0);
          }
        }

        // Fetch vouchers (if discount feature is enabled)
        try {
          const voucherResponse = await fetch('/api/v1/petals/vouchers/list');
          if (voucherResponse.ok) {
            const voucherData = await voucherResponse.json();
            if (voucherData.ok && voucherData.data?.vouchers) {
              setVouchers(voucherData.data.vouchers);
              setDiscountEnabled(true); // Feature is enabled if API responds
            }
          }
        } catch {
          // Discount vouchers not enabled or API unavailable
          setDiscountEnabled(false);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setPetalBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Purchase function - calls API and updates local state
  const handleUnlock = async (item: CosmeticItem) => {
    if (petalBalance === null || petalBalance < item.costPetals) {
      alert(`Insufficient petals! You need ${item.costPetals} petals.`);
      return;
    }

    if (isUnlocked(item.id)) {
      // Already unlocked, just select it
      if (item.type === 'hud-skin' && item.hudSkinId) {
        selectHudSkin(item.hudSkinId);
      }
      return;
    }

    try {
      setPurchasing(item.id);

      const response = await fetch('/api/v1/petals/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      });

      const data = await response.json();

      if (data.ok && data.data) {
        // Update balance
        if (data.data.balance !== null && data.data.balance !== undefined) {
          setPetalBalance(data.data.balance);
        }

        // Unlock the item locally
        await unlockItem(item.id);

        // If it's a HUD skin, auto-select it
        if (item.type === 'hud-skin' && item.hudSkinId) {
          await selectHudSkin(item.hudSkinId);
        }

        // Dispatch event for PetalHUD to sync (includes lifetime)
        window.dispatchEvent(
          new CustomEvent('petal:spend', {
            detail: {
              balance: data.data.balance,
              lifetimePetalsEarned: data.data.lifetimePetalsEarned,
            },
          }),
        );

        alert(`Successfully purchased ${item.name}!`);
      } else {
        throw new Error(data.error || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.message || 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleSelect = (item: CosmeticItem) => {
    if (item.type === 'hud-skin' && item.hudSkinId) {
      selectHudSkin(item.hudSkinId);
    }
  };

  // Purchase discount voucher
  const handlePurchaseVoucher = async (tier: 'tier1' | 'tier2' | 'tier3') => {
    const voucherConfig = DISCOUNT_VOUCHER_TIERS[tier];

    if (petalBalance === null || petalBalance < voucherConfig.costPetals) {
      alert(`Insufficient petals! You need ${voucherConfig.costPetals} petals.`);
      return;
    }

    try {
      setPurchasingVoucher(tier);

      const response = await fetch('/api/v1/petals/vouchers/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.ok && data.data) {
        // Update balance
        if (data.data.balance !== null && data.data.balance !== undefined) {
          setPetalBalance(data.data.balance);
        }

        // Add voucher to list
        setVouchers((prev) => [
          ...prev,
          {
            code: data.data.voucherCode,
            percentOff: data.data.percentOff,
            expiresAt: data.data.expiresAt ? new Date(data.data.expiresAt) : null,
          },
        ]);

        // Dispatch event for PetalHUD to sync
        window.dispatchEvent(
          new CustomEvent('petal:spend', {
            detail: {
              balance: data.data.balance,
              lifetimePetalsEarned: data.data.lifetimePetalsEarned,
            },
          }),
        );

        alert(
          `Successfully purchased ${voucherConfig.name}! Your voucher code is: ${data.data.voucherCode}`,
        );
      } else {
        throw new Error(data.error || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Voucher purchase error:', error);
      alert(error.message || 'Purchase failed. Please try again.');
    } finally {
      setPurchasingVoucher(null);
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
              {loading ? (
                <span className="text-zinc-400">Loading...</span>
              ) : (
                <>
                  <span className="text-xl font-semibold text-pink-200">
                    {petalBalance !== null ? petalBalance.toLocaleString() : '0'}
                  </span>
                  <span className="text-zinc-400">petals</span>
                </>
              )}
            </div>
          </OmCard>
        </div>

        {/* Cosmetics Grid - Grouped by Category */}
        <div className="space-y-8">
          {/* HUD Skins Section */}
          <div>
            <h2 className="text-2xl font-bold text-pink-400 mb-4">HUD Skins</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getHudSkinCosmetics().map((item) => {
                const unlocked = isUnlocked(item.id);
                const isSelected = item.type === 'hud-skin' && item.hudSkinId === hudSkin;

                return (
                  <OmCard key={item.id} className="flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                        {isSelected && (
                          <OmTag variant="status" status="active">
                            Selected
                          </OmTag>
                        )}
                        {unlocked && !isSelected && (
                          <OmTag variant="status" status="active">
                            Unlocked
                          </OmTag>
                        )}
                        {item.rarity && <OmTag variant="category">{item.rarity}</OmTag>}
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
                          disabled={
                            purchasing === item.id ||
                            petalBalance === null ||
                            petalBalance < item.costPetals
                          }
                        >
                          {purchasing === item.id
                            ? 'Purchasing...'
                            : petalBalance === null || petalBalance < item.costPetals
                              ? 'Insufficient Petals'
                              : 'Unlock'}
                        </OmButton>
                      ) : isSelected ? (
                        <OmButton variant="ghost" className="w-full" disabled>
                          Currently Selected
                        </OmButton>
                      ) : (
                        <OmButton
                          variant="primary"
                          className="w-full"
                          onClick={() => handleSelect(item)}
                        >
                          Select
                        </OmButton>
                      )}
                    </div>
                  </OmCard>
                );
              })}
            </div>
          </div>

          {/* Avatar Cosmetics Section */}
          <div>
            <h2 className="text-2xl font-bold text-pink-400 mb-4">Avatar Cosmetics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getAvatarCosmetics().map((item) => {
                const unlocked = isUnlocked(item.id);

                return (
                  <OmCard key={item.id} className="flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                        {unlocked && (
                          <OmTag variant="status" status="active">
                            Unlocked
                          </OmTag>
                        )}
                        {item.rarity && <OmTag variant="category">{item.rarity}</OmTag>}
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
                          disabled={
                            purchasing === item.id ||
                            petalBalance === null ||
                            petalBalance < item.costPetals
                          }
                        >
                          {purchasing === item.id
                            ? 'Purchasing...'
                            : petalBalance === null || petalBalance < item.costPetals
                              ? 'Insufficient Petals'
                              : 'Unlock'}
                        </OmButton>
                      ) : (
                        <OmButton variant="ghost" className="w-full" disabled>
                          Owned
                        </OmButton>
                      )}
                    </div>
                  </OmCard>
                );
              })}
            </div>
          </div>
        </div>

        {/* Discount Vouchers Section */}
        {discountEnabled && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-pink-400 mb-4">Discount Vouchers</h2>
            <p className="text-zinc-300 text-sm mb-4">
              Purchase discount vouchers with petals to save on shop orders. Vouchers expire after
              30 days.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(DISCOUNT_VOUCHER_TIERS).map(([tier, config]) => (
                <OmCard key={tier} className="flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white">{config.name}</h3>
                      {'limitedTime' in config && config.limitedTime && (
                        <OmTag variant="category">Limited</OmTag>
                      )}
                    </div>

                    <p className="text-zinc-300 text-sm mb-4">
                      Get {config.percent}% off your next order (minimum order: $20)
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-pink-400 font-semibold">{config.costPetals}</span>
                      <span className="text-zinc-500 text-sm">petals</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <OmButton
                      variant="primary"
                      className="w-full"
                      onClick={() => handlePurchaseVoucher(tier as 'tier1' | 'tier2' | 'tier3')}
                      disabled={
                        purchasingVoucher === tier ||
                        petalBalance === null ||
                        petalBalance < config.costPetals
                      }
                    >
                      {purchasingVoucher === tier
                        ? 'Purchasing...'
                        : petalBalance === null || petalBalance < config.costPetals
                          ? 'Insufficient Petals'
                          : 'Purchase Voucher'}
                    </OmButton>
                  </div>
                </OmCard>
              ))}
            </div>

            {/* Active Vouchers */}
            {vouchers.length > 0 && (
              <OmPanel className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Your Active Vouchers</h3>
                <div className="space-y-2">
                  {vouchers.map((v) => (
                    <div
                      key={v.code}
                      className="flex items-center justify-between p-2 bg-black/20 rounded"
                    >
                      <div>
                        <span className="text-pink-400 font-mono text-sm">{v.code}</span>
                        {v.percentOff && (
                          <span className="text-zinc-300 ml-2">{v.percentOff}% off</span>
                        )}
                      </div>
                      {v.expiresAt && (
                        <span className="text-zinc-400 text-xs">
                          Expires: {new Date(v.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-zinc-400 text-xs mt-4">
                  Use these codes at checkout to apply your discount.
                </p>
              </OmPanel>
            )}
          </div>
        )}

        {/* Info Panel */}
        <OmPanel className="mt-8">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white mb-2">About Cosmetics</h3>
            <p className="text-zinc-300 text-sm">
              Cosmetics are visual enhancements that change how your game interface and avatar look.
              HUD skins affect the appearance of game overlays and achievement screens. Avatar
              cosmetics (outfits, accessories, VFX) customize your character's appearance.
            </p>
            <p className="text-zinc-400 text-xs mt-4">
              Note: Current implementation uses localStorage. Your cosmetics will sync with your
              account when you sign in.
            </p>
          </div>
        </OmPanel>
      </div>
    </div>
  );
}
