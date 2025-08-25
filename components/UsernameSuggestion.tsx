'use client';

import { useState } from 'react';

interface UsernameSuggestionProps {
  onUsernameSelect: (username: string) => void;
  className?: string;
}

const USERNAME_PREFIXES = [
  'Cool',
  'Epic',
  'Awesome',
  'Mega',
  'Ultra',
  'Super',
  'Pro',
  'Elite',
  'Ninja',
  'Warrior',
  'Knight',
  'Mage',
  'Archer',
  'Paladin',
  'Rogue',
  'Shadow',
  'Light',
  'Dark',
  'Fire',
  'Ice',
  'Thunder',
  'Wind',
  'Earth',
  'Cosmic',
  'Galactic',
  'Stellar',
  'Lunar',
  'Solar',
  'Nebula',
  'Void',
];

const USERNAME_SUFFIXES = [
  'Gamer',
  'Player',
  'Master',
  'Lord',
  'King',
  'Queen',
  'Prince',
  'Princess',
  'Hero',
  'Legend',
  'Champion',
  'Victor',
  'Winner',
  'Star',
  'Angel',
  'Demon',
  'Dragon',
  'Phoenix',
  'Wolf',
  'Tiger',
  'Lion',
  'Eagle',
  'Hawk',
  'Falcon',
  'Ghost',
  'Spirit',
  'Soul',
  'Mind',
  'Heart',
  'Sword',
  'Shield',
  'Bow',
];

const USERNAME_NUMBERS = [
  '123',
  '456',
  '789',
  '007',
  '42',
  '69',
  '420',
  '1337',
  '2024',
  '99',
  '88',
  '77',
];

export function UsernameSuggestion({ onUsernameSelect, className = '' }: UsernameSuggestionProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = () => {
    setIsGenerating(true);

    const newSuggestions: string[] = [];
    const usedCombinations = new Set<string>();

    while (newSuggestions.length < 6 && usedCombinations.size < 50) {
      const prefix = USERNAME_PREFIXES[Math.floor(Math.random() * USERNAME_PREFIXES.length)];
      const suffix = USERNAME_SUFFIXES[Math.floor(Math.random() * USERNAME_SUFFIXES.length)];
      const number = USERNAME_NUMBERS[Math.floor(Math.random() * USERNAME_NUMBERS.length)];

      const combination1 = `${prefix}${suffix}`;
      const combination2 = `${prefix}${suffix}${number}`;
      const combination3 = `${prefix}${number}${suffix}`;

      if (!usedCombinations.has(combination1)) {
        newSuggestions.push(combination1);
        usedCombinations.add(combination1);
      }

      if (!usedCombinations.has(combination2) && newSuggestions.length < 6) {
        newSuggestions.push(combination2);
        usedCombinations.add(combination2);
      }

      if (!usedCombinations.has(combination3) && newSuggestions.length < 6) {
        newSuggestions.push(combination3);
        usedCombinations.add(combination3);
      }
    }

    setSuggestions(newSuggestions);
    setIsGenerating(false);
  };

  const handleUsernameClick = (username: string) => {
    onUsernameSelect(username);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Need a username?</h3>
        <button
          onClick={generateSuggestions}
          disabled={isGenerating}
          className="rounded-md bg-pink-600 px-3 py-1 text-xs text-white transition-colors hover:bg-pink-700 disabled:bg-gray-600"
        >
          {isGenerating ? 'Generating...' : 'Get Suggestions'}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((username, index) => (
            <button
              key={index}
              onClick={() => handleUsernameClick(username)}
              className="rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-left text-sm text-gray-300 transition-all duration-200 hover:border-pink-500 hover:bg-gray-700 hover:text-white"
            >
              {username}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">Click any suggestion to use it, or generate new ones!</p>
    </div>
  );
}
