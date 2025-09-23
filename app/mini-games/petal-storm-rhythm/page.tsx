'use client';
import { useState } from 'react';
import { type Metadata } from 'next';
import GameShell from '../_shared/GameShell';
import RhythmGameEngine from './RhythmGameEngine';

export default function PetalStormRhythmPage() {
  const [gameMode, setGameMode] = useState<'menu' | 'practice' | 'arcade'>('menu');
  const [calibration, setCalibration] = useState(0); // Latency calibration in ms

  // Game mode data with null guards
  const gameModes = {
    practice: {
      title: 'Practice Mode',
      description: 'Learn the rhythm with slower beats',
      tracks: [
        { id: 'intro', name: 'Petal Intro', bpm: 80, difficulty: 1 },
        { id: 'basic', name: 'Basic Storm', bpm: 120, difficulty: 2 },
      ],
    },
    arcade: {
      title: 'Arcade Mode',
      description: 'Fast-paced rhythm challenge',
      tracks: [
        { id: 'storm', name: 'Petal Storm', bpm: 160, difficulty: 4 },
        { id: 'tempest', name: 'Cherry Tempest', bpm: 180, difficulty: 5 },
      ],
    },
  };

  if (gameMode === 'practice' || gameMode === 'arcade') {
    const modeData = gameModes[gameMode];
    return (
      <GameShell title="Petal Storm Rhythm" gameKey="petal-storm-rhythm">
        <RhythmGameEngine
          mode={gameMode}
          tracks={modeData.tracks}
          calibration={calibration}
          onBack={() => setGameMode('menu')}
        />
      </GameShell>
    );
  }

  return (
    <GameShell title="Petal Storm Rhythm" gameKey="petal-storm-rhythm">
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-purple-900">
        <div className="max-w-md text-center text-white">
          <div className="text-6xl mb-6">⛈️</div>
          <h2 className="text-3xl font-bold mb-4">Petal Storm Rhythm</h2>
          <p className="text-gray-200 mb-8">Stormy rhythm playlist—precision timing for petals.</p>

          {/* Calibration */}
          <div className="mb-6 p-4 bg-black/20 rounded-lg">
            <label className="block text-sm text-gray-300 mb-2">
              Audio Latency ({calibration}ms)
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={calibration}
              onChange={(e) => setCalibration(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">Adjust if rhythm feels off-sync</p>
          </div>

          {/* Mode Selection */}
          <div className="space-y-4">
            <button
              onClick={() => setGameMode('practice')}
              className="w-full p-4 bg-green-600/20 border border-green-500/30 rounded-xl hover:bg-green-600/30 transition-colors"
            >
              <h3 className="font-semibold text-green-300">Practice Mode</h3>
              <p className="text-sm text-gray-300">Learn the rhythm with slower beats</p>
            </button>

            <button
              onClick={() => setGameMode('arcade')}
              className="w-full p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 transition-colors"
            >
              <h3 className="font-semibold text-purple-300">Arcade Mode</h3>
              <p className="text-sm text-gray-300">Fast-paced rhythm challenge</p>
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-6">
            "I didn't lose. Just ran out of health." – Edward Elric
          </p>
        </div>
      </div>
    </GameShell>
  );
}
