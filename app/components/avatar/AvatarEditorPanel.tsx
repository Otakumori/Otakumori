/**
 * Avatar Editor Panel
 * Category-based customization interface with NSFW support
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarStore, type AvatarCategory } from '@/app/stores/avatarStore';
import {
  User,
  Smile,
  Scissors,
  Shirt,
  Sparkles,
  Eye,
  RotateCcw,
  Download,
  type LucideIcon,
} from 'lucide-react';

const CATEGORIES: Array<{
  id: AvatarCategory;
  name: string;
  icon: LucideIcon;
  nsfwOnly?: boolean;
}> = [
  { id: 'body', name: 'Body', icon: User },
  { id: 'face', name: 'Face', icon: Smile },
  { id: 'hair', name: 'Hair', icon: Scissors },
  { id: 'clothing', name: 'Clothing', icon: Shirt },
  { id: 'accessories', name: 'Accessories', icon: Sparkles },
  { id: 'nsfw', name: 'NSFW', icon: Eye, nsfwOnly: true },
];

// Mock parts data - in production, this would come from a database or API
const MOCK_PARTS = {
  body: [
    { id: 'body-slim', name: 'Slim', isNSFW: false },
    { id: 'body-athletic', name: 'Athletic', isNSFW: false },
    { id: 'body-curvy', name: 'Curvy', isNSFW: false },
  ],
  face: [
    { id: 'face-neutral', name: 'Neutral', isNSFW: false },
    { id: 'face-happy', name: 'Happy', isNSFW: false },
    { id: 'face-serious', name: 'Serious', isNSFW: false },
  ],
  hair: [
    { id: 'hair-short', name: 'Short', isNSFW: false },
    { id: 'hair-long', name: 'Long', isNSFW: false },
    { id: 'hair-ponytail', name: 'Ponytail', isNSFW: false },
    { id: 'hair-twintails', name: 'Twin Tails', isNSFW: false },
  ],
  clothing: [
    { id: 'clothing-casual', name: 'Casual', isNSFW: false },
    { id: 'clothing-formal', name: 'Formal', isNSFW: false },
    { id: 'clothing-sporty', name: 'Sporty', isNSFW: false },
    { id: 'clothing-cosplay', name: 'Cosplay', isNSFW: false },
  ],
  accessories: [
    { id: 'acc-glasses', name: 'Glasses', isNSFW: false },
    { id: 'acc-headphones', name: 'Headphones', isNSFW: false },
    { id: 'acc-necklace', name: 'Necklace', isNSFW: false },
  ],
  nsfw: [
    { id: 'nsfw-item-1', name: 'NSFW Option 1', isNSFW: true },
    { id: 'nsfw-item-2', name: 'NSFW Option 2', isNSFW: true },
  ],
};

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

function ColorPicker({ label, color, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-white">{label}</label>
      <div className="relative">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 cursor-pointer rounded-lg border-2 border-white/20 bg-transparent"
        />
      </div>
      <span className="text-xs text-gray-400">{color}</span>
    </div>
  );
}

export default function AvatarEditorPanel() {
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>('body');
  const [showNSFWWarning, setShowNSFWWarning] = useState(false);

  const {
    avatar,
    showNSFWCategories,
    updateAvatarPart,
    addAccessory,
    removeAccessory,
    updateColor,
    toggleNSFW,
    setNSFWCategories,
    resetAvatar,
  } = useAvatarStore();

  const handleCategoryClick = (category: AvatarCategory) => {
    if (category === 'nsfw' && !showNSFWCategories) {
      setShowNSFWWarning(true);
      return;
    }
    setActiveCategory(category);
  };

  const handleEnableNSFW = () => {
    setNSFWCategories(true);
    toggleNSFW();
    setShowNSFWWarning(false);
    setActiveCategory('nsfw');
  };

  const currentParts = MOCK_PARTS[activeCategory] || [];
  const isAccessoryCategory = activeCategory === 'accessories';

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/20 p-4">
        <h2 className="text-2xl font-bold text-white">Avatar Editor</h2>
        <div className="flex gap-2">
          <button
            onClick={resetAvatar}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white transition-colors hover:bg-white/20"
            aria-label="Reset avatar to default"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            className="flex items-center gap-2 rounded-lg bg-pink-500 px-3 py-2 text-sm text-white transition-colors hover:bg-pink-600"
            aria-label="Save avatar"
          >
            <Download className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-white/20 p-4">
        {CATEGORIES.map((category) => {
          if (category.nsfwOnly && !showNSFWCategories) {
            return null;
          }

          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
              aria-label={`Select ${category.name} category`}
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Parts Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {currentParts.map((part) => {
            const isSelected = isAccessoryCategory
              ? avatar.accessories.includes(part.id)
              : activeCategory === 'body' ||
                  activeCategory === 'face' ||
                  activeCategory === 'hair' ||
                  activeCategory === 'clothing'
                ? avatar[activeCategory] === part.id
                : false;

            return (
              <motion.button
                key={part.id}
                onClick={() => {
                  if (isAccessoryCategory) {
                    if (isSelected) {
                      removeAccessory(part.id);
                    } else {
                      addAccessory(part.id);
                    }
                  } else {
                    updateAvatarPart(activeCategory, part.id);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative aspect-square rounded-xl border-2 p-4 transition-all ${
                  isSelected
                    ? 'border-pink-500 bg-gradient-to-br from-pink-500/20 to-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
                aria-label={`${isSelected ? 'Deselect' : 'Select'} ${part.name}`}
              >
                <div className="flex h-full flex-col items-center justify-center">
                  {/* Placeholder icon */}
                  <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-400">
                    <span className="text-2xl" role="img" aria-label="Sparkles">
                      ✨
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">{part.name}</span>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Color Customization */}
      <div className="border-t border-white/20 p-4">
        <h3 className="mb-4 text-lg font-bold text-white">Colors</h3>
        <div className="space-y-3">
          <ColorPicker
            label="Skin"
            color={avatar.colors.skin}
            onChange={(color) => updateColor('skin', color)}
          />
          <ColorPicker
            label="Hair"
            color={avatar.colors.hair}
            onChange={(color) => updateColor('hair', color)}
          />
          <ColorPicker
            label="Eyes"
            color={avatar.colors.eyes}
            onChange={(color) => updateColor('eyes', color)}
          />
        </div>
      </div>

      {/* NSFW Warning Modal */}
      <AnimatePresence>
        {showNSFWWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowNSFWWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900 to-black p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/20">
                  <Eye className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold text-white">NSFW Content Warning</h3>
              </div>

              <p className="mb-6 text-gray-300">
                You are about to enable NSFW avatar customization options. These features are
                intended for mature audiences only. By proceeding, you confirm that you are 18 years
                or older.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNSFWWarning(false)}
                  className="flex-1 rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnableNSFW}
                  className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 font-medium text-white transition-all hover:scale-105"
                >
                  I'm 18+, Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
