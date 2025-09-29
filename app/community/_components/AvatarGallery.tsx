'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AvatarCard } from '@/app/components/avatar/AvatarCard';

interface GalleryAvatar {
  id: string;
  name: string;
  author: string;
  config: any;
  likes: number;
  downloads: number;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
}

export function AvatarGallery() {
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent' | 'popular'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real implementation, this would come from API
  const galleryAvatars: GalleryAvatar[] = [
    {
      id: '1',
      name: 'Cyberpunk Ninja',
      author: 'AnimeMaster',
      config: {
        gender: 'male',
        age: 'young-adult',
        hair: { color: '#00FFFF', style: 'short' },
        face: { eyes: { color: '#00FF00' }, skin: { tone: 0.5 } },
        outfit: { primary: { type: 'cyberpunk', color: '#1A1A1A' } }
      },
      likes: 247,
      downloads: 89,
      tags: ['cyberpunk', 'ninja', 'futuristic'],
      isPublic: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Kawaii Mage',
      author: 'PixelArtist',
      config: {
        gender: 'female',
        age: 'teen',
        hair: { color: '#FFB6C1', style: 'twintails' },
        face: { eyes: { color: '#9370DB' }, skin: { tone: 0.8 } },
        outfit: { primary: { type: 'kawaii', color: '#FF69B4' } }
      },
      likes: 189,
      downloads: 67,
      tags: ['kawaii', 'magic', 'cute'],
      isPublic: true,
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      name: 'Gothic Vampire',
      author: 'DarkCreator',
      config: {
        gender: 'male',
        age: 'adult',
        hair: { color: '#000000', style: 'long' },
        face: { eyes: { color: '#FF0000' }, skin: { tone: 0.3 } },
        outfit: { primary: { type: 'gothic', color: '#2F2F2F' } }
      },
      likes: 156,
      downloads: 45,
      tags: ['gothic', 'vampire', 'dark'],
      isPublic: true,
      createdAt: '2024-01-13'
    },
    {
      id: '4',
      name: 'Anime Warrior',
      author: 'SwordMaster',
      config: {
        gender: 'female',
        age: 'young-adult',
        hair: { color: '#FF69B4', style: 'long' },
        face: { eyes: { color: '#FFD700' }, skin: { tone: 0.7 } },
        outfit: { primary: { type: 'fantasy', color: '#8B0000' } }
      },
      likes: 312,
      downloads: 123,
      tags: ['anime', 'warrior', 'fantasy'],
      isPublic: true,
      createdAt: '2024-01-12'
    }
  ];

  const filteredAvatars = galleryAvatars.filter(avatar => {
    const matchesFilter = filter === 'all' || 
      (filter === 'trending' && avatar.likes > 200) ||
      (filter === 'recent' && new Date(avatar.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filter === 'popular' && avatar.downloads > 50);
    
    const matchesSearch = searchQuery === '' || 
      avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      avatar.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      avatar.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Community Avatar Gallery</h2>
        <p className="text-zinc-300 mb-6">
          Discover amazing avatars created by the community
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1 flex-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'trending', label: 'Trending' },
            { id: 'recent', label: 'Recent' },
            { id: 'popular', label: 'Popular' }
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id as any)}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                filter === filterOption.id
                  ? 'bg-pink-500 text-white'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          placeholder="Search avatars, authors, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAvatars.map((avatar) => (
          <motion.div
            key={avatar.id}
            className="bg-white/10 rounded-xl p-4 border border-white/20 hover:border-pink-500/50 transition-all duration-200 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Avatar Display */}
            <div className="flex justify-center mb-3">
              <AvatarCard
                config={avatar.config}
                size="medium"
                className="group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Avatar Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-white text-center truncate">{avatar.name}</h3>
              <p className="text-sm text-zinc-400 text-center">by {avatar.author}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 justify-center">
                {avatar.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center text-sm text-zinc-400">
                <div className="flex items-center space-x-1">
                  <span>❤️</span>
                  <span>{avatar.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📥</span>
                  <span>{avatar.downloads}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-3">
                <button className="flex-1 px-3 py-1 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors">
                  Like
                </button>
                <button className="flex-1 px-3 py-1 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors">
                  Download
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredAvatars.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No avatars found</h3>
          <p className="text-zinc-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
