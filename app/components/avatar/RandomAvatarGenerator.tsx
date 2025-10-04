'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AvatarCard } from './AvatarCard';

interface RandomAvatarGeneratorProps {
  onGenerate?: (config: any) => void;
  className?: string;
}

export function RandomAvatarGenerator({ onGenerate, className = '' }: RandomAvatarGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<any>(null);
  const [theme, setTheme] = useState('anime');
  const [gender, setGender] = useState('random');

  const themes = [
    { id: 'anime', name: 'Anime', icon: '', description: 'Classic anime style' },
    { id: 'cyberpunk', name: 'Cyberpunk', icon: '', description: 'Futuristic tech aesthetic' },
    { id: 'fantasy', name: 'Fantasy', icon: '‍️', description: 'Magical fantasy world' },
    { id: 'kawaii', name: 'Kawaii', icon: '', description: 'Cute and colorful' },
    { id: 'gothic', name: 'Gothic', icon: '', description: 'Dark and mysterious' },
  ];

  const genders = [
    { id: 'random', name: 'Random', icon: '' },
    { id: 'male', name: 'Male', icon: '️' },
    { id: 'female', name: 'Female', icon: '️' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/v1/avatar/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          gender,
          style: 'anime',
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const result = await response.json();

      if (result.ok) {
        setGeneratedConfig(result.data.config);
        onGenerate?.(result.data.config);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Random Avatar Generator</h3>
        <p className="text-zinc-300 text-sm">
          Generate random avatars with different themes and styles
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <h4 className="font-medium text-white">Choose Theme</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                theme === themeOption.id
                  ? 'border-pink-500 bg-pink-500/20 text-white'
                  : 'border-white/20 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="text-2xl mb-1">{themeOption.icon}</div>
              <div className="font-medium text-sm">{themeOption.name}</div>
              <div className="text-xs opacity-75">{themeOption.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Gender Selection */}
      <div className="space-y-3">
        <h4 className="font-medium text-white">Choose Gender</h4>
        <div className="flex space-x-2">
          {genders.map((genderOption) => (
            <button
              key={genderOption.id}
              onClick={() => setGender(genderOption.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                gender === genderOption.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/10 text-zinc-300 hover:text-white hover:bg-white/20'
              }`}
            >
              <span>{genderOption.icon}</span>
              <span className="font-medium">{genderOption.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isGenerating
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
          }`}
          whileHover={!isGenerating ? { scale: 1.05 } : {}}
          whileTap={!isGenerating ? { scale: 0.95 } : {}}
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span></span>
              <span>Generate Random Avatar</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Generated Avatar Preview */}
      {generatedConfig && (
        <motion.div
          className="bg-white/10 rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-semibold text-white mb-4 text-center">Generated Avatar</h4>
          <div className="flex flex-col items-center space-y-4">
            <AvatarCard
              config={generatedConfig}
              size="large"
              showName={true}
              name="Random Avatar"
            />

            <div className="flex space-x-3">
              <button
                onClick={() => onGenerate?.(generatedConfig)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Use This Avatar
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Generate Another
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Generation Tips */}
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-200 mb-2">Generation Tips</h4>
        <ul className="text-sm text-blue-100 space-y-1">
          <li>• Each generation creates a completely unique avatar</li>
          <li>• Themes affect colors, styles, and overall aesthetic</li>
          <li>• Random gender will create either male or female avatars</li>
          <li>• Generated avatars can be further customized in the editor</li>
          <li>• You can generate as many as you want until you find one you like</li>
        </ul>
      </div>
    </div>
  );
}

export default RandomAvatarGenerator;
