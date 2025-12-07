/**
 * Standardized Game Entry Flow Component
 *
 * Provides a consistent UX for entering games:
 * 1. Splash screen with title, description, difficulty selection
 * 2. Avatar choice (if game supports it)
 * 3. Instructions/How to Play
 * 4. Start Game button
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AvatarPresetChoice, type AvatarChoice } from './AvatarPresetChoice';
import { getGameAvatarUsage } from './miniGameConfigs';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import { getGameDisplayName } from './gameVisuals';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

export type DifficultyLevel = 'easy' | 'normal' | 'medium' | 'hard' | 'expert';

export interface GameEntryFlowProps {
  gameId: string;
  title?: string;
  description?: string;
  instructions?: string[];
  difficultyLevels?: DifficultyLevel[];
  defaultDifficulty?: DifficultyLevel;
  onStart: (options: {
    difficulty: DifficultyLevel;
    avatarChoice: AvatarChoice | null;
    selectedAvatar?: AvatarProfile | AvatarConfiguration;
  }) => void;
  onCancel?: () => void;
  showInstructions?: boolean;

interface DifficultyOption {
  value: DifficultyLevel;
  label: string;
  description?: string;

const DEFAULT_DIFFICULTY_OPTIONS: Record<DifficultyLevel, DifficultyOption> = {
  easy: {
    value: 'easy',
    label: 'Easy',
    description: 'Perfect for beginners',
  },
  normal: {
    value: 'normal',
    label: 'Normal',
    description: 'Balanced challenge',
  },
  medium: {
    value: 'medium',
    label: 'Medium',
    description: 'Moderate difficulty',
  },
  hard: {
    value: 'hard',
    label: 'Hard',
    description: 'For experienced players',
  },
  expert: {
    value: 'expert',
    label: 'Expert',
    description: 'Maximum challenge',
  },
};

export function GameEntryFlow({
  gameId,
  title,
  description,
  instructions = [],
  difficultyLevels = ['easy', 'normal', 'hard'],
  defaultDifficulty = 'normal',
  onStart,
  onCancel,
  showInstructions = true,
}: GameEntryFlowProps) {
  const [currentStep, setCurrentStep] = useState<
    'splash' | 'difficulty' | 'avatar' | 'instructions'
  >('splash');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(defaultDifficulty);
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | AvatarConfiguration | null>(
    null,
  );

  const avatarUsage = getGameAvatarUsage(gameId);
  const displayName = title || getGameDisplayName(gameId);
  const needsAvatarChoice = isAvatarsEnabled() && avatarUsage === 'avatar-or-preset';

  // Auto-advance from splash to difficulty
  useEffect(() => {
    if (currentStep === 'splash') {
      const timer = setTimeout(() => {
        setCurrentStep('difficulty');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Handle difficulty selection
  const handleDifficultySelect = useCallback(
    (difficulty: DifficultyLevel) => {
      setSelectedDifficulty(difficulty);
      if (needsAvatarChoice) {
        setCurrentStep('avatar');
      } else if (showInstructions && instructions.length > 0) {
        setCurrentStep('instructions');
      } else {
        // Start immediately if no avatar choice and no instructions
        handleStart();
      }
    },
    [needsAvatarChoice, showInstructions, instructions.length],
  );

  // Handle avatar choice
  const handleAvatarChoice = useCallback(
    (choice: AvatarChoice, avatar?: AvatarProfile | AvatarConfiguration) => {
      setAvatarChoice(choice);
      if (choice === 'creator' && avatar) {
        setSelectedAvatar(avatar);
      }
      if (showInstructions && instructions.length > 0) {
        setCurrentStep('instructions');
      } else {
        handleStart();
      }
    },
    [showInstructions, instructions.length],
  );

  // Handle start game
  const handleStart = useCallback(() => {
    onStart({
      difficulty: selectedDifficulty,
      avatarChoice,
      selectedAvatar: selectedAvatar || undefined,
    });
  }, [onStart, selectedDifficulty, avatarChoice, selectedAvatar]);

  // Skip to start if no avatar choice needed and no instructions
  useEffect(() => {
    if (!needsAvatarChoice && (!showInstructions || instructions.length === 0)) {
      if (currentStep === 'difficulty') {
        // Auto-start after difficulty selection
        const timer = setTimeout(() => {
          handleStart();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [needsAvatarChoice, showInstructions, instructions.length, currentStep, handleStart]);

  // Splash screen
  if (currentStep === 'splash') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-pink-200 mb-2">{displayName}</h1>
          {description && <p className="text-lg text-pink-200/70">{description}</p>}
          <div className="mt-8">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </motion.div>
      </div>
    );
  }

  // Difficulty selection
  if (currentStep === 'difficulty') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 max-w-2xl w-full mx-4"
        >
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Choose Difficulty</h2>
            <p className="text-sm text-slate-300 mb-6">{description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficultyLevels.map((diff) => {
                const option = DEFAULT_DIFFICULTY_OPTIONS[diff] || {
                  value: diff,
                  label: diff.charAt(0).toUpperCase() + diff.slice(1),
                };
                return (
                  <button
                    key={diff}
                    onClick={() => handleDifficultySelect(diff)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedDifficulty === diff
                        ? 'border-pink-400 bg-pink-400/20 text-pink-300'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-semibold capitalize">{option.label}</div>
                    {option.description && (
                      <div className="text-sm opacity-75 mt-1">{option.description}</div>
                    )}
                  </button>
                );
              })}
            </div>

            {onCancel && (
              <button
                onClick={onCancel}
                className="mt-4 text-sm text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Avatar choice
  if (currentStep === 'avatar' && needsAvatarChoice) {
    return (
      <div className="fixed inset-0 z-50">
        <AvatarPresetChoice
          gameId={gameId}
          onChoice={handleAvatarChoice}
          onCancel={onCancel}
        />
      </div>
    );
  }

  // Instructions
  if (currentStep === 'instructions' && instructions.length > 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 max-w-md w-full mx-4"
        >
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
            <ul className="text-left space-y-2 mb-6 text-slate-300">
              {instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-4">
              <button
                onClick={handleStart}
                className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105 bg-pink-500 text-white hover:bg-pink-600"
              >
                Start Game
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 bg-slate-700 text-slate-300 hover:bg-slate-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Should not reach here, but return null as fallback
  return null;
}

