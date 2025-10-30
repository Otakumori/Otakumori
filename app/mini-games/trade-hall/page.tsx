// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { COPY } from '../../lib/copy';
import GlassButton from '../../components/ui/GlassButton';
import GlassCard from '../../components/ui/GlassCard';

interface TradeItem {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
  category: 'cosmetic' | 'powerup' | 'collectible';
  image: string;
  value: number;
  owned: number;
}

interface TradeOffer {
  id: string;
  userId: string;
  userName: string;
  offering: TradeItem[];
  requesting: TradeItem[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export default function TradeHallPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'crafting' | 'trading' | 'market'>(
    'inventory',
  );
  const [inventory, setInventory] = useState<TradeItem[]>([]);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [selectedItems, setSelectedItems] = useState<TradeItem[]>([]);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    setInventory([
      {
        id: '1',
        name: 'Cherry Blossom Petal',
        description: 'A delicate pink petal from the eternal cherry tree',
        rarity: 'common',
        category: 'collectible',
        image: '',
        value: 10,
        owned: 5,
      },
      {
        id: '2',
        name: 'Golden Rune Fragment',
        description: 'A shimmering fragment of ancient power',
        rarity: 'rare',
        category: 'collectible',
        image: '',
        value: 50,
        owned: 2,
      },
      {
        id: '3',
        name: 'Storm Cloud Essence',
        description: 'Condensed energy from the petal storm',
        rarity: 'legendary',
        category: 'powerup',
        image: '',
        value: 200,
        owned: 1,
      },
      {
        id: '4',
        name: 'Memory Crystal',
        description: 'Preserves perfect recall moments',
        rarity: 'rare',
        category: 'cosmetic',
        image: '◆',
        value: 75,
        owned: 3,
      },
    ]);

    setTradeOffers([
      {
        id: 'offer1',
        userId: 'user123',
        userName: 'PetalMaster',
        offering: [inventory[0], inventory[1]],
        requesting: [inventory[2]],
        status: 'active',
        createdAt: new Date(Date.now() - 3600000),
      },
    ]);
  }, [inventory]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 bg-gray-100';
      case 'rare':
        return 'text-blue-600 bg-blue-100';
      case 'legendary':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const canCraft = (item: TradeItem) => {
    if (item.rarity === 'common') return false;

    const requiredItems = item.rarity === 'rare' ? 3 : 3;
    const commonItems = inventory.filter((i) => i.rarity === 'common');
    return commonItems.reduce((sum, i) => sum + i.owned, 0) >= requiredItems;
  };

  const handleCraft = (item: TradeItem) => {
    if (!canCraft(item)) return;

    const requiredItems = item.rarity === 'rare' ? 3 : 3;
    let remaining = requiredItems;

    setInventory((prev) =>
      prev.map((invItem) => {
        if (invItem.rarity === 'common' && remaining > 0) {
          const toUse = Math.min(invItem.owned, remaining);
          remaining -= toUse;
          return { ...invItem, owned: invItem.owned - toUse };
        }
        return invItem;
      }),
    );

    // Add crafted item
    const existingItem = inventory.find((i) => i.id === item.id);
    if (existingItem) {
      setInventory((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, owned: i.owned + 1 } : i)),
      );
    } else {
      setInventory((prev) => [...prev, { ...item, owned: 1 }]);
    }
  };

  const handleCreateOffer = () => {
    if (selectedItems.length === 0) return;

    const newOffer: TradeOffer = {
      id: `offer_${Date.now()}`,
      userId: 'current_user',
      userName: 'You',
      offering: selectedItems,
      requesting: [], // Would be set by user
      status: 'active',
      createdAt: new Date(),
    };

    setTradeOffers((prev) => [newOffer, ...prev]);
    setSelectedItems([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100">
      <div className="container mx-auto max-w-6xl p-4">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Trade Hall</h1>
              <p className="text-gray-600">Collect, craft, and trade with other players</p>
            </div>
            <GlassButton href="/mini-games" variant="secondary">
              {COPY.games.backToHub}
            </GlassButton>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'inventory', label: 'Inventory', icon: '' },
            { id: 'crafting', label: 'Crafting', icon: '️' },
            { id: 'trading', label: 'Trading', icon: '' },
            { id: 'market', label: 'Market', icon: '' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-white/20 text-gray-700 hover:bg-white/30'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => (
              <GlassCard key={item.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{item.image}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(item.rarity)}`}
                  >
                    {item.rarity}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Owned: {item.owned}</span>
                  <span className="text-sm font-medium text-pink-600">{item.value} petals</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'crafting' && (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Crafting Recipes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'Golden Rune Fragment',
                    description: 'Craft from 3 common items',
                    rarity: 'rare',
                    image: '',
                    cost: 3,
                  },
                  {
                    name: 'Storm Cloud Essence',
                    description: 'Craft from 3 rare items',
                    rarity: 'legendary',
                    image: '',
                    cost: 3,
                  },
                ].map((recipe) => (
                  <div key={recipe.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{recipe.image}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(recipe.rarity)}`}
                      >
                        {recipe.rarity}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{recipe.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                    <motion.button
                      className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!canCraft(recipe as any)}
                      onClick={() => handleCraft(recipe as any)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Craft ({recipe.cost} items)
                    </motion.button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'trading' && (
          <div className="space-y-6">
            {/* Create Trade Offer */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create Trade Offer</h2>
              <div className="space-y-4">
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    Select items to offer:
                  </div>
                  <div
                    className="grid grid-cols-2 md:grid-cols-4 gap-2"
                    role="group"
                    aria-label="Select items to offer"
                  >
                    {inventory
                      .filter((item) => item.owned > 0)
                      .map((item) => (
                        <motion.button
                          key={item.id}
                          className={`p-2 rounded-lg border-2 transition-colors ${
                            selectedItems.some((s) => s.id === item.id)
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            if (selectedItems.some((s) => s.id === item.id)) {
                              setSelectedItems((prev) => prev.filter((s) => s.id !== item.id));
                            } else {
                              setSelectedItems((prev) => [...prev, item]);
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-lg">{item.image}</span>
                          <div className="text-xs text-gray-600">{item.name}</div>
                          <div className="text-xs text-gray-500">x{item.owned}</div>
                        </motion.button>
                      ))}
                  </div>
                </div>
                <motion.button
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedItems.length === 0}
                  onClick={handleCreateOffer}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Offer
                </motion.button>
              </div>
            </GlassCard>

            {/* Active Trade Offers */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Trade Offers</h2>
              <div className="space-y-4">
                {tradeOffers.map((offer) => (
                  <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">{offer.userName}</span>
                      <span className="text-sm text-gray-500">
                        {offer.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Offering:</h4>
                        <div className="flex gap-2">
                          {offer.offering.map((item) => (
                            <div key={item.id} className="text-center">
                              <span className="text-lg">{item.image}</span>
                              <div className="text-xs text-gray-600">{item.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Requesting:</h4>
                        <div className="flex gap-2">
                          {offer.requesting.map((item) => (
                            <div key={item.id} className="text-center">
                              <span className="text-lg">{item.image}</span>
                              <div className="text-xs text-gray-600">{item.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <motion.button
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Accept Trade
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Counter Offer
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Market Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl mb-2"></div>
                  <div className="font-semibold text-gray-900">Rising</div>
                  <div className="text-sm text-gray-600">Storm Cloud Essence</div>
                  <div className="text-sm text-green-600">+15% this week</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl mb-2"></div>
                  <div className="font-semibold text-gray-900">Falling</div>
                  <div className="text-sm text-gray-600">Cherry Blossom Petal</div>
                  <div className="text-sm text-red-600">-8% this week</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <div className="text-2xl mb-2"></div>
                  <div className="font-semibold text-gray-900">Hot Item</div>
                  <div className="text-sm text-gray-600">Memory Crystal</div>
                  <div className="text-sm text-blue-600">High demand</div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </main>
  );
}
