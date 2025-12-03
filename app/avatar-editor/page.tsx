'use client';

import { generateSEO } from '@/app/lib/seo';
import { useState } from 'react';
import { motion } from 'framer-motion';
import AvatarSystem from '../../components/avatar/AvatarSystem';
import { type ProceduralCharacterConfig } from '@/lib/avatar/procedural-generator';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/avatar-editor',
  });
}
export default function AvatarEditorPage() {
  const [showAvatarSystem, setShowAvatarSystem] = useState(false);
  const [savedConfig, setSavedConfig] = useState<ProceduralCharacterConfig | null>(null);

  const handleSave = (config: ProceduralCharacterConfig) => {
    setSavedConfig(config);
    setShowAvatarSystem(false);

    // In a real app, this would save to the database
    localStorage.setItem('otakumori_avatar_config', JSON.stringify(config));
  };

  const handleOpenEditor = () => {
    setShowAvatarSystem(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
      {/* Header */}
      <div className="p-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Avatar Editor
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/70 mb-8"
        >
          Create and customize your perfect avatar with advanced physics and materials
        </motion.p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Features</h2>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Procedural Generation</h3>
                <p className="text-white/70">
                  Create unique characters with parametric mesh generation, auto-rigging, and morph
                  targets.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">GLB Import Support</h3>
                <p className="text-white/70">
                  Import characters from VRoid Studio, commissioned models, and other GLB sources.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Anime Toon Materials</h3>
                <p className="text-white/70">
                  Beautiful anime-style materials with toon ramps, rim lighting, and matcap
                  highlights.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Physics Simulation</h3>
                <p className="text-white/70">
                  Realistic hair, cloth, and soft body physics using Verlet/spring systems.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">50+ Customization Sliders</h3>
                <p className="text-white/70">
                  Fine-tune every aspect of your character with detailed sliders and controls.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Adult Content Gating</h3>
                <p className="text-white/70">
                  Age verification and content level controls for enhanced physics and revealing
                  content.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Get Started</h2>

            <div className="space-y-4">
              <button
                onClick={handleOpenEditor}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
              >
                Open Avatar Editor
              </button>

              <button
                onClick={handleOpenEditor}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Import GLB Character
              </button>

              <button
                onClick={handleOpenEditor}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Import VRoid Character
              </button>
            </div>

            {/* Saved Config Display */}
            {savedConfig && (
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Last Saved Configuration</h3>
                <div className="space-y-2 text-sm text-white/70">
                  <p>Gender: {savedConfig.gender}</p>
                  <p>Age: {savedConfig.age}</p>
                  <p>Height: {(savedConfig.body.height * 100).toFixed(0)}%</p>
                  <p>Weight: {(savedConfig.body.weight * 100).toFixed(0)}%</p>
                  <p>Hair Style: {savedConfig.hair.style}</p>
                  <p>Skin Tone: {savedConfig.materials.skinTone}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Avatar System Modal */}
      {showAvatarSystem && (
        <AvatarSystem
          onClose={() => setShowAvatarSystem(false)}
          onSave={handleSave}
          initialConfig={savedConfig || undefined}
          enablePhysics={true}
          enableAdultContent={true}
        />
      )}
    </div>
  );
}
