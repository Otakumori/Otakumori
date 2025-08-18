'use client';
import { useState, useEffect } from 'react';
import { useQuests } from '@/app/hooks/useQuests';

type AssetDemo = {
  id: string;
  name: string;
  type: 'button' | 'icon' | 'frame' | 'sfx';
  imageId?: string;
  sfxId?: string;
  description: string;
  tags: string[];
};

const DEMO_ASSETS: AssetDemo[] = [
  {
    id: 'demo-btn-1',
    name: 'Neon Start Button',
    type: 'button',
    imageId: 'minigame.arcade.neon.start',
    sfxId: 'spicy-female-yumi-sfx1',
    description: 'PS1-style neon button with hover glow',
    tags: ['PS1', 'Neon', 'Interactive']
  },
  {
    id: 'demo-btn-2',
    name: 'Retro Menu Frame',
    type: 'frame',
    imageId: 'ui.retro.menu.frame',
    sfxId: 'spicy-female-yumi-sfx2',
    description: 'Classic menu border with pixel-perfect edges',
    tags: ['Retro', 'Menu', 'Pixel']
  },
  {
    id: 'demo-icon-1',
    name: 'Health Potion',
    type: 'icon',
    imageId: 'icons.rpg.health.potion',
    sfxId: 'spicy-female-yumi-sfx3',
    description: '16x16 pixel health item icon',
    tags: ['RPG', 'Health', '16x16']
  },
  {
    id: 'demo-icon-2',
    name: 'Magic Scroll',
    type: 'icon',
    imageId: 'icons.rpg.magic.scroll',
    sfxId: 'spicy-female-yumi-sfx4',
    description: 'Magical scroll with glowing effects',
    tags: ['Magic', 'Scroll', 'Glow']
  }
];

export default function PlaygroundPage() {
  const [selectedAsset, setSelectedAsset] = useState<AssetDemo | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [playingSfx, setPlayingSfx] = useState<string | null>(null);
  const { trackQuest } = useQuests();

  useEffect(() => {
    // Track playground visit for quests
    trackQuest('browse-collection');
  }, [trackQuest]);

  function playSfx(sfxId: string) {
    if (playingSfx === sfxId) return;
    
    setPlayingSfx(sfxId);
    
    try {
      // Try to get the SFX asset and play it
      const audio = new Audio(`/assets/sfx/${sfxId}.wav`);
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback to a simple beep if asset not found
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
      });
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
    
    setTimeout(() => setPlayingSfx(null), 100);
  }

  function handleAssetClick(asset: AssetDemo) {
    setSelectedAsset(asset);
    
    // Play SFX if available
    if (asset.sfxId) {
      playSfx(asset.sfxId);
    }
  }

  function handleAssetHover(assetId: string, sfxId?: string) {
    setHoveredAsset(assetId);
    
    // Play hover SFX
    if (sfxId && hoveredAsset !== assetId) {
      playSfx(sfxId);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cube-900 via-cube-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slatey-200 mb-4">
            🎮 Asset Playground
          </h1>
          <p className="text-lg text-slatey-400 max-w-2xl mx-auto">
            Try out our retro gaming assets with interactive hover effects and SFX. 
            Click on anything to see it in action!
          </p>
        </header>

        {/* Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {DEMO_ASSETS.map((asset) => (
            <div
              key={asset.id}
              className={`
                group relative bg-slate-800/50 border border-slate-700 rounded-2xl p-4 cursor-pointer
                transition-all duration-300 hover:scale-105 hover:border-sakura-400 hover:shadow-glow
                ${hoveredAsset === asset.id ? 'border-sakura-400 shadow-glow' : ''}
                ${selectedAsset?.id === asset.id ? 'ring-2 ring-sakura-400 ring-opacity-50' : ''}
              `}
              onClick={() => handleAssetClick(asset)}
              onMouseEnter={() => handleAssetHover(asset.id, asset.sfxId)}
              onMouseLeave={() => setHoveredAsset(null)}
            >
              {/* Asset Preview */}
              <div className="aspect-square bg-slate-700 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {asset.imageId ? (
                  <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <span className="text-4xl text-slatey-300">🎨</span>
                  </div>
                ) : (
                  <div className="text-6xl text-slatey-400">
                    {asset.type === 'sfx' ? '🔊' : '🎮'}
                  </div>
                )}
              </div>

              {/* Asset Info */}
              <h3 className="text-slatey-200 font-semibold mb-2 group-hover:text-sakura-300 transition-colors">
                {asset.name}
              </h3>
              <p className="text-sm text-slatey-400 mb-3">
                {asset.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {asset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-700 text-slatey-300 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-sakura-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Selected Asset Details */}
        {selectedAsset && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-slatey-200">
                {selectedAsset.name}
              </h2>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slatey-400 hover:text-slatey-200 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Asset Preview */}
              <div className="bg-slate-700 rounded-xl p-6 flex items-center justify-center">
                <div className="text-8xl text-slatey-300">
                  {selectedAsset.type === 'sfx' ? '🔊' : '🎨'}
                </div>
              </div>
              
              {/* Asset Details */}
              <div>
                <p className="text-slatey-300 mb-4">
                  {selectedAsset.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-slatey-400 text-sm">Type:</span>
                    <span className="ml-2 text-slatey-200 capitalize">{selectedAsset.type}</span>
                  </div>
                  
                  <div>
                    <span className="text-slatey-400 text-sm">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedAsset.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-slate-700 text-slatey-300 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {selectedAsset.sfxId && (
                    <div>
                      <span className="text-slatey-400 text-sm">SFX:</span>
                      <button
                        onClick={() => playSfx(selectedAsset.sfxId!)}
                        disabled={playingSfx === selectedAsset.sfxId}
                        className="ml-2 bg-sakura-500/20 border border-sakura-400 text-slatey-200 px-3 py-1 rounded-lg text-sm hover:bg-sakura-500/30 disabled:opacity-50 transition-colors"
                      >
                        {playingSfx === selectedAsset.sfxId ? 'Playing...' : 'Play SFX'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-slate-800/30 border border-slate-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slatey-200 mb-4">
            Ready to Use These in Your Game?
          </h2>
          <p className="text-slatey-400 mb-6 max-w-2xl mx-auto">
            All assets come with multiple resolutions, source files, and are ready to drop into 
            your favorite game engine. No attribution required for commercial use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/starter-pack"
              className="bg-sakura-500/20 border border-sakura-400 text-slatey-200 px-6 py-3 rounded-xl hover:bg-sakura-500/30 transition-colors font-medium"
            >
              Get Free Starter Pack
            </a>
            <a
              href="/"
              className="bg-slate-700 border border-slate-600 text-slatey-200 px-6 py-3 rounded-xl hover:bg-slate-600 transition-colors font-medium"
            >
              Browse All Assets
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
