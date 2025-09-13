'use client';

import { useState } from 'react';
import { gameAudio } from '@/app/lib/game-audio';

/**
 * Example component showing how to use Samus jingle after character creation
 * This can be used as a reference for implementing character creation flows
 */
export default function CharacterCreationExample() {
  const [characterCreated, setCharacterCreated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCharacter = async () => {
    setIsCreating(true);
    
    // Simulate character creation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Character created! Play Samus jingle
    gameAudio.playCharacterCreated();
    setCharacterCreated(true);
    setIsCreating(false);
  };

  if (characterCreated) {
    return (
      <div className="bg-gray-900 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Character Created!</h2>
        <p className="text-gray-300 mb-6">Samus jingle played when character was created</p>
        <button
          onClick={() => setCharacterCreated(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Another Character
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-8 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Character Creation</h2>
      <p className="text-gray-300 mb-6">Create a new character to hear the Samus jingle</p>
      
      <button
        onClick={handleCreateCharacter}
        disabled={isCreating}
        className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreating ? 'Creating Character...' : 'Create Character'}
      </button>
    </div>
  );
}
