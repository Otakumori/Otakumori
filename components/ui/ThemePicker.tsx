'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemePickerProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  className?: string;
}

const THEMES = [
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    description: 'Classic pink petals with warm lighting',
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#fbbf24',
    },
    preview: '🌸',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    description: 'Pure white petals with soft lighting',
    colors: {
      primary: '#f8fafc',
      secondary: '#f1f5f9',
      accent: '#e2e8f0',
    },
    preview: '🌸',
  },
  {
    id: 'autumn',
    name: 'Autumn',
    description: 'Warm orange and gold tones',
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#b45309',
    },
    preview: '🍂',
  },
  {
    id: 'night',
    name: 'Night',
    description: 'Dark theme with starry sky',
    colors: {
      primary: '#1a1320',
      secondary: '#2d1b3d',
      accent: '#4c1d4d',
    },
    preview: '🌙',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Dramatic orange and purple skies',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#dc2626',
    },
    preview: '🌅',
  },
];

export default function ThemePicker({
  currentTheme,
  onThemeChange,
  className = '',
}: ThemePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(
    THEMES.find((theme) => theme.id === currentTheme) || THEMES[0],
  );

  const handleThemeSelect = (theme: (typeof THEMES)[0]) => {
    setSelectedTheme(theme);
    onThemeChange(theme.id);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Theme selector button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black"
        aria-label="Select theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="text-2xl">{selectedTheme.preview}</div>
        <div className="text-left">
          <div className="text-white font-medium text-sm">{selectedTheme.name}</div>
          <div className="text-white/60 text-xs">{selectedTheme.description}</div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto"
        >
          <svg
            className="w-4 h-4 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {/* Theme options dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl p-2 z-50"
            role="listbox"
            aria-label="Theme options"
          >
            {THEMES.map((theme) => (
              <motion.button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                  selectedTheme.id === theme.id
                    ? 'bg-pink-500/20 border border-pink-500/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
                role="option"
                aria-selected={selectedTheme.id === theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl">{theme.preview}</div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{theme.name}</div>
                  <div className="text-white/60 text-xs">{theme.description}</div>
                </div>

                {/* Color preview */}
                <div className="flex gap-1">
                  <div
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
