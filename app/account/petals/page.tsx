
'use client';

import { logger } from '@/app/lib/logger';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ShoppingBag, Sparkles, Coins, Search, Gamepad2 } from 'lucide-react';

interface ShopItem {
  id: string;
  sku: string;
  name: string;
  kind: 'COSMETIC' | 'OVERLAY' | 'TEXT' | 'CURSOR' | 'DISCOUNT';
  pricePetals: number;
  eventTag?: string;
  metadata: {
    description?: string;
    previewUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DiscountReward {
  id: string;
  name: string;
  description?: string | null;
  discountType: 'PERCENT' | 'OFF_AMOUNT';
  amountOff?: number | null;
  percentOff?: number | null;
  petalCost: number;
  nsfwOnly: boolean;
  minSpendCents?: number | null;
  validityDays: number;
  available: boolean;
  }

interface PetalStoreResponse {
  ok: boolean;
  data?: {
    items: ShopItem[];
    total: number;
  };
  error?: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: '' },
  { id: 'COSMETIC', name: 'Cosmetics', icon: '' },
  { id: 'OVERLAY', name: 'Overlays', icon: '' },
  { id: 'TEXT', name: 'Text Effects', icon: '' },
  { id: 'CURSOR', name: 'Cursors', icon: '' },
  { id: 'DISCOUNT', name: 'Discount Vouchers', icon: '' },
];

export default function PetalStorePage() {
  const { user } = useUser();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [discountRewards, setDiscountRewards] = useState<DiscountReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [petalBalance, setPetalBalance] = useState(0);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchShopItems();
      fetchDiscountRewards();
      fetchPetalBalance();
    } else {
      setLoading(false);
    }
  }, [user, selectedCategory]);

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/petal-shop/catalog`);
      const data: PetalStoreResponse = await response.json();

      if (data?.ok && data?.data?.items) {
        let list: ShopItem[] = data.data.items;
        if (selectedCategory !== 'all') {
          list = list.filter((i) => i.kind === selectedCategory);
        }
        setItems(list);
      } else {
        setError(data?.error || 'Failed to fetch shop items');
      }
    } catch (err) {
      setError('Failed to fetch shop items');
      logger.error('Error fetching shop items', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscountRewards = async () => {
    try {
      const response = await fetch('/api/v1/petals/shop/discounts');
      if (response.ok) {
        const data = await response.json();
        if (data?.ok && data?.data?.rewards) {
          setDiscountRewards(
            data.data.rewards.map((r: any) => ({
              ...r,
              available: true, // All rewards from API are already filtered for eligibility
            })),
          );
        }
      }
    } catch (err) {
      logger.error('Error fetching discount rewards', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    }
  };

  const fetchPetalBalance = async () => {
    try {
      const response = await fetch('/api/petals/wallet');
      if (response.ok) {
        const data = await response.json();
        if (typeof data.balance === 'number') setPetalBalance(data.balance);
      }
    } catch (err) {
      logger.error('Error fetching petal balance', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    if (petalBalance < item.pricePetals) {
      alert('Insufficient petals!');
      return;
    }

    try {
      setPurchasing(item.id);

      const response = await fetch('/api/petal-shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: item.sku }),
      });

      const data = await response.json();

      if (data.ok && data.data) {
        // Update local state
        if (typeof data.data.balance === 'number') setPetalBalance(data.data.balance);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        alert(`Successfully purchased ${item.name}!`);
      } else {
        throw new Error(data.error || 'Purchase failed');
      }
    } catch (err) {
      alert('Purchase failed. Please try again.');
      logger.error('Error purchasing item', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setPurchasing(null);
    }
  };

  const handlePurchaseDiscount = async (reward: DiscountReward) => {
    if (petalBalance < reward.petalCost) {
      alert('Insufficient petals!');
      return;
    }

    if (!reward.available) {
      alert(
        'This discount reward is not available. You may need to unlock a required achievement.',
      );
      return;
    }

    try {
      setPurchasing(reward.id);

      const response = await fetch('/api/v1/petals/shop/discounts/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountRewardId: reward.id,
        }),
      });

      const data = await response.json();

      if (data.ok && data.data) {
        // Update local state
        if (typeof data.data.newBalance === 'number') setPetalBalance(data.data.newBalance);
        setDiscountRewards((prev) => prev.filter((r) => r.id !== reward.id));
        alert(
          `Successfully purchased ${reward.name}! Your discount code is: ${data.data.couponGrant.code}. Valid for ${reward.validityDays} days.`,
        );
      } else {
        throw new Error(data.error || 'Purchase failed');
      }
    } catch (err) {
      alert('Purchase failed. Please try again.');
      logger.error('Error purchasing discount reward', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setPurchasing(null);
    }
  };

  const getCategoryIcon = (kind: string) => {
    switch (kind) {
      case 'COSMETIC':
        return '';
      case 'OVERLAY':
        return '';
      case 'TEXT':
        return '';
      case 'CURSOR':
        return '';
      default:
        return '';
    }
  };

  const getCategoryColor = (kind: string) => {
    switch (kind) {
      case 'COSMETIC':
        return 'from-pink-500/20 to-purple-500/20 border-pink-500/30';
      case 'OVERLAY':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'TEXT':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'CURSOR':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      default:
        return 'from-neutral-500/20 to-gray-500/20 border-neutral-500/30';
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredDiscounts =
    selectedCategory === 'all' || selectedCategory === 'DISCOUNT'
      ? discountRewards.filter(
          (reward) =>
            reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reward.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : [];

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-neutral-400">Loading petal store...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coins className="h-12 w-12 text-pink-400" />
            <h1 className="text-4xl font-bold">Petal Store</h1>
          </div>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Spend your hard-earned petals on exclusive cosmetics, overlays, and customizations.
          </p>
        </div>

        {/* Petal Balance */}
        {user && (
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl p-6 mb-8 text-center">
            <div className="text-4xl mb-2"></div>
            <div className="text-3xl font-bold text-pink-400">{petalBalance}</div>
            <div className="text-lg text-neutral-400">Petals Available</div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-pink-500 focus-visible:ring-2 focus-visible:ring-pink-400 transition-colors"
              aria-label="Search items"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
                  selectedCategory === category.id
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/25'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                }`}
                aria-pressed={selectedCategory === category.id}
                aria-label={`Filter ${category.name}`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Discount Rewards Section */}
        {(selectedCategory === 'all' || selectedCategory === 'DISCOUNT') &&
          filteredDiscounts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-white">Discount Vouchers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredDiscounts.map((reward) => (
                  <div
                    key={reward.id}
                    className="group bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl overflow-hidden hover:scale-105 transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">
                          {reward.name}
                        </h3>
                        {reward.nsfwOnly && (
                          <span className="text-xs px-2 py-1 bg-pink-500/20 text-pink-300 rounded-full">
                            NSFW
                          </span>
                        )}
                      </div>

                      {reward.description && (
                        <p className="text-sm text-neutral-400 mb-4">{reward.description}</p>
                      )}

                      <div className="mb-4 space-y-2">
                        <div className="text-lg font-bold text-green-400">
                          {reward.discountType === 'PERCENT'
                            ? `${reward.percentOff}% OFF`
                            : `$${(reward.amountOff || 0) / 100} OFF`}
                        </div>
                        {reward.minSpendCents && (
                          <div className="text-xs text-neutral-400">
                            Min. spend: ${(reward.minSpendCents / 100).toFixed(2)}
                          </div>
                        )}
                        <div className="text-xs text-neutral-400">
                          Valid for {reward.validityDays} days after purchase
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-pink-400">
                          <Coins className="h-4 w-4" />
                          <span className="font-semibold">{reward.petalCost.toLocaleString()}</span>
                          <span className="text-sm">petals</span>
                        </div>

                        <button
                          onClick={() => handlePurchaseDiscount(reward)}
                          disabled={
                            purchasing === reward.id ||
                            petalBalance < reward.petalCost ||
                            !reward.available
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 ${
                            petalBalance < reward.petalCost || !reward.available
                              ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                              : purchasing === reward.id
                                ? 'bg-blue-600 text-white cursor-wait'
                                : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                          }`}
                          aria-label={`Purchase ${reward.name}`}
                        >
                          {purchasing === reward.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Purchasing...
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-4 w-4" />
                              Purchase
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Items Grid */}
        {(selectedCategory === 'all' || selectedCategory !== 'DISCOUNT') &&
          filteredItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`group bg-neutral-900 rounded-xl border overflow-hidden hover:scale-105 transition-all duration-200 ${getCategoryColor(item.kind)}`}
                >
                  {/* Item Image */}
                  <div className="aspect-square bg-neutral-800 overflow-hidden">
                    {item.metadata.previewUrl ? (
                      <img
                        src={item.metadata.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {getCategoryIcon(item.kind)}
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white group-hover:text-pink-400 transition-colors">
                        {item.name}
                      </h3>
                      <div className="text-xs px-2 py-1 bg-neutral-800 rounded-full text-neutral-300">
                        {item.kind}
                      </div>
                    </div>

                    {item.metadata.description && (
                      <p className="text-sm text-neutral-400 mb-3 line-clamp-2">
                        {item.metadata.description}
                      </p>
                    )}

                    {/* Event Tag */}
                    {item.eventTag && (
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded-full">
                          <Sparkles className="h-3 w-3" />
                          {item.eventTag}
                        </span>
                      </div>
                    )}

                    {/* Price and Purchase */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-pink-400">
                        <Coins className="h-4 w-4" />
                        <span className="font-semibold">{item.pricePetals}</span>
                        <span className="text-sm">petals</span>
                      </div>

                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={purchasing === item.id || petalBalance < item.pricePetals}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
                          petalBalance < item.pricePetals
                            ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                            : purchasing === item.id
                              ? 'bg-blue-600 text-white cursor-wait'
                              : 'bg-pink-600 hover:bg-pink-700 text-white hover:scale-105'
                        }`}
                        aria-label={`Purchase ${item.name}`}
                      >
                        {purchasing === item.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Purchasing...
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="h-4 w-4" />
                            Purchase
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Empty State */}
        {filteredItems.length === 0 &&
          filteredDiscounts.length === 0 &&
          (selectedCategory === 'all' || selectedCategory !== 'DISCOUNT') && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-semibold text-neutral-400 mb-2">No items found</h3>
              <p className="text-neutral-500">
                {searchQuery
                  ? 'Try adjusting your search terms.'
                  : 'Check back later for new items!'}
              </p>
            </div>
          )}

        {/* How to Earn Petals */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">How to Earn More Petals</h2>
          <p className="text-neutral-300 mb-6">
            Complete daily challenges, unlock achievements, and improve your high scores to earn
            more petals!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-3"></div>
              <h3 className="font-semibold text-white mb-2">Play Mini-Games</h3>
              <p className="text-sm text-neutral-400">
                Earn petals by playing and improving your scores
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3"></div>
              <h3 className="font-semibold text-white mb-2">Unlock Achievements</h3>
              <p className="text-sm text-neutral-400">Complete milestones for big petal rewards</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3"></div>
              <h3 className="font-semibold text-white mb-2">Daily Challenges</h3>
              <p className="text-sm text-neutral-400">Complete daily tasks for bonus petals</p>
            </div>
          </div>
        </div>

        {/* Mini-Games Link */}
        <div className="text-center mt-12">
          <a
            href="/mini-games"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <Gamepad2 className="h-5 w-5" />
            Play Mini-Games to Earn Petals
          </a>
        </div>
      </div>
    </main>
  );
}
