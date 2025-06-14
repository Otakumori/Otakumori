'use client';

import { useSession } from 'next-auth/react';
import { useAbyss } from '../../../context/AbyssContext';
import { useState } from 'react';

export default function MiniGames() {
  const { data: session, status } = useSession();
  const { petals, setPetals } = useAbyss();
  const [selectedGame, setSelectedGame] = useState(null);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to access mini-games.</div>;
  }

  const games = [
    {
      id: 1,
      name: 'Memory Match',
      description: 'Test your memory by matching pairs of cards',
      reward: 10,
    },
    {
      id: 2,
      name: 'Quick Math',
      description: 'Solve math problems as fast as you can',
      reward: 15,
    },
    // Add more games as needed
  ];

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const handleGameComplete = () => {
    if (selectedGame) {
      setPetals(petals + selectedGame.reward);
      setSelectedGame(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mini Games</h1>
      <div className="mb-4">
        <p>Your Petals: {petals}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div key={game.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{game.name}</h2>
            <p className="text-gray-600">{game.description}</p>
            <p className="text-lg font-bold mt-2">Reward: {game.reward} Petals</p>
            <button
              onClick={() => handleGameSelect(game)}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Play
            </button>
          </div>
        ))}
      </div>
      {selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">{selectedGame.name}</h2>
            <p>Game content will be implemented here.</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedGame(null)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
              <button
                onClick={handleGameComplete}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Complete Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
