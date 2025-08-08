import React, { useState } from 'react';

interface MemoryEntry {
  id: string;
  type: 'player' | 'senpai' | 'lore';
  content: string;
  spicy?: boolean;
}

interface MemoryLogProps {
  entries: MemoryEntry[];
}

const MemoryLog: React.FC<MemoryLogProps> = ({ entries }) => {
  const [censor, setCensor] = useState(true);
  return (
    <div className="bg-gray-900/90 rounded-xl p-6 shadow-2xl max-w-2xl mx-auto mt-8 font-mono border-2 border-pink-700/40 relative overflow-hidden">
      <div className="flex items-center mb-4">
        <span className="text-pink-400 font-bold text-lg mr-2">Senpai.exe Memory Log</span>
        <button
          className="ml-auto px-3 py-1 rounded bg-pink-700/80 text-white text-xs hover:bg-pink-600/90"
          onClick={() => setCensor(c => !c)}
        >
          {censor ? 'Show All' : 'Censor Spicy'}
        </button>
      </div>
      <div className="space-y-4">
        {entries.length === 0 && <div className="text-pink-200">No memories yet…</div>}
        {entries.map(entry => (
          <div
            key={entry.id}
            className={`p-3 rounded-lg border border-pink-800/40 bg-black/40 shadow-inner ${entry.spicy && censor ? 'blur-sm' : ''}`}
          >
            <span className={`block text-xs mb-1 ${entry.type === 'senpai' ? 'text-pink-400' : entry.type === 'lore' ? 'text-violet-400' : 'text-white'}`}>
              {entry.type === 'senpai' ? 'Senpai.exe' : entry.type === 'lore' ? 'Lore Fragment' : 'Player'}
            </span>
            <span className="whitespace-pre-line text-pink-100">{entry.content}</span>
            {entry.spicy && censor && (
              <span className="ml-2 text-xs text-pink-500">[Censored]</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryLog; 