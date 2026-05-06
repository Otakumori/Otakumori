'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { AvatarCard } from '@/app/components/avatar/AvatarCard';

export function AdultContentGate() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<'outfits' | 'physics' | 'interactions'>(
    'outfits',
  );

  // Mock adult content data
  const adultOutfits = [
    {
      id: '1',
      name: 'Lingerie Set',
      config: {
        gender: 'female',
        outfit: { primary: { type: 'lingerie', color: '#FF69B4' } },
      },
      tags: ['lingerie', 'sexy', 'intimate'],
      downloads: 234,
    },
    {
      id: '2',
      name: 'Leather Bondage',
      config: {
        gender: 'male',
        outfit: { primary: { type: 'leather', color: '#2F2F2F' } },
      },
      tags: ['leather', 'bondage', 'fetish'],
      downloads: 189,
    },
  ];

  const adultPhysics = [
    {
      id: '1',
      name: 'Enhanced Jiggle Physics',
      description: 'Realistic breast and body physics simulation',
      config: {
        physics: { softBody: { enable: true, stiffness: 0.2 } },
      },
      tags: ['jiggle', 'realistic', 'enhanced'],
      downloads: 456,
    },
    {
      id: '2',
      name: 'Cloth Simulation',
      description: 'Advanced cloth physics for flowing garments',
      config: {
        physics: { cloth: { enable: true, wind: 0.8 } },
      },
      tags: ['cloth', 'flowing', 'wind'],
      downloads: 321,
    },
  ];

  const adultInteractions = [
    {
      id: '1',
      name: 'Intimate Poses',
      description: 'Collection of intimate and suggestive poses',
      config: {
        interactions: { poses: ['intimate1', 'intimate2', 'suggestive1'] },
      },
      tags: ['poses', 'intimate', 'suggestive'],
      downloads: 567,
    },
    {
      id: '2',
      name: 'Touch Interactions',
      description: 'Interactive touch and caress animations',
      config: {
        interactions: { touches: ['caress', 'stroke', 'hold'] },
      },
      tags: ['touch', 'caress', 'interactive'],
      downloads: 423,
    },
  ];

  const categories = [
    { id: 'outfits' as const, label: 'Adult Outfits', icon: '', count: adultOutfits.length },
    { id: 'physics' as const, label: 'Enhanced Physics', icon: '', count: adultPhysics.length },
    {
      id: 'interactions' as const,
      label: 'Adult Interactions',
      icon: '',
      count: adultInteractions.length,
    },
  ];

  const getCurrentContent = () => {
    switch (selectedCategory) {
      case 'outfits':
        return adultOutfits;
      case 'physics':
        return adultPhysics;
      case 'interactions':
        return adultInteractions;
      default:
        return [];
    }
  };

  if (!user?.publicMetadata?.adultVerified) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4"></div>
        <h3 className="text-2xl font-bold text-white mb-4">Adult Content Restricted</h3>
        <p className="text-zinc-300 mb-6">
          You must verify your age to access adult content and features.
        </p>
        <a
          href="/adults/verify"
          className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold"
        >
          Verify Age for Adult Content
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Gated Adult Content</h2>
        <p className="text-zinc-300 mb-6">Access premium adult content and features (18+ only)</p>
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg max-w-md mx-auto">
          <p className="text-red-200 text-sm">
            This content is for adults only. By accessing this area, you confirm you are 18+ years
            old.
          </p>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex space-x-1 bg-white/10 rounded-lg p-1 max-w-2xl mx-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-pink-500 text-white shadow-lg'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="font-medium">{category.label}</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{category.count}</span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getCurrentContent().map((item) => (
          <motion.div
            key={item.id}
            className="bg-white/10 rounded-xl p-4 border border-white/20 hover:border-pink-500/50 transition-all duration-200 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Preview */}
            <div className="flex justify-center mb-3">
              <AvatarCard
                config={item.config}
                size="medium"
                className="group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Content Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-white text-center">{item.name}</h3>
              {'description' in item && (
                <p className="text-sm text-zinc-400 text-center">{item.description}</p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 justify-center">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Downloads */}
              <div className="flex justify-center items-center text-sm text-zinc-400">
                <span></span>
                <span className="ml-1">{item.downloads} downloads</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-3">
                <button className="flex-1 px-3 py-1 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors">
                  Preview
                </button>
                <button className="flex-1 px-3 py-1 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors">
                  Download
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Custom Content */}
      <div className="text-center pt-8">
        <div className="bg-white/10 rounded-xl p-6 border border-white/20 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-white mb-2">Create Custom Adult Content</h3>
          <p className="text-zinc-300 text-sm mb-4">
            Design your own adult avatars with advanced customization options
          </p>
          <a
            href="/adults/editor"
            className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Open Adult Avatar Editor
          </a>
        </div>
      </div>
    </div>
  );
}
