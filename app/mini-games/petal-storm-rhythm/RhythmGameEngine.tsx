'use client';
import { useEffect, useRef, useState } from 'react';
import { useGameSave } from '../_shared/SaveSystem';

interface Track {
  id: string;
  name: string;
  bpm: number;
  difficulty: number;
}

interface RhythmGameEngineProps {
  mode: 'practice' | 'arcade';
  tracks: Track[];
  calibration: number;
  onBack: () => void;
}

interface Note {
  id: number;
  lane: number; // 0-3 for 4 lanes
  timing: number; // milliseconds from start
  hit: boolean;
}

export default function RhythmGameEngine({
  mode,
  tracks,
  calibration,
  onBack,
}: RhythmGameEngineProps) {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);

  const { saveOnExit, autoSave } = useGameSave('petal-storm-rhythm');
  const animationRef = useRef<number>();
  const gameRef = useRef<HTMLDivElement>(null);

  // Generate notes based on BPM
  const generateNotes = (track: Track): Note[] => {
    const notes: Note[] = [];
    const beatInterval = 60000 / track.bpm; // ms per beat
    const songLength = 60000; // 1 minute song

    let noteId = 0;
    for (let time = beatInterval; time < songLength; time += beatInterval) {
      // Add variation based on difficulty
      const notesPerBeat = Math.min(track.difficulty, 4);
      for (let i = 0; i < notesPerBeat; i++) {
        if (Math.random() < 0.7) {
          // 70% chance for each note
          notes.push({
            id: noteId++,
            lane: Math.floor(Math.random() * 4),
            timing: time + i * (beatInterval / notesPerBeat),
            hit: false,
          });
        }
      }
    }

    return notes.sort((a, b) => a.timing - b.timing);
  };

  const startGame = (track: Track) => {
    setSelectedTrack(track);
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setCurrentTime(0);
    setGameStartTime(Date.now());

    const gameNotes = generateNotes(track);
    setNotes(gameNotes);

    // Start animation loop
    const animate = () => {
      const now = Date.now();
      const elapsed = now - gameStartTime + calibration;
      setCurrentTime(elapsed);

      // Check if song is finished
      if (elapsed > 60000) {
        finishGame();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const finishGame = async () => {
    setGameState('finished');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Save game results
    try {
      await saveOnExit({
        score,
        level: selectedTrack?.difficulty || 1,
        progress: 1.0,
        stats: {
          mode,
          track: selectedTrack?.id,
          combo,
          accuracy: calculateAccuracy(),
          lastPlayed: Date.now(),
        },
      });
    } catch (error) {
      console.error('Failed to save rhythm game results:', error);
    }
  };

  const calculateAccuracy = () => {
    const hitNotes = notes.filter((n) => n.hit).length;
    return notes.length > 0 ? Math.round((hitNotes / notes.length) * 100) : 0;
  };

  const hitNote = (lane: number) => {
    const tolerance = mode === 'practice' ? 300 : 200; // ms tolerance
    const hitWindow = { min: currentTime - tolerance, max: currentTime + tolerance };

    // Find the closest note in this lane within the hit window
    const candidateNotes = notes.filter(
      (n) => n.lane === lane && !n.hit && n.timing >= hitWindow.min && n.timing <= hitWindow.max,
    );

    if (candidateNotes.length > 0) {
      const closest = candidateNotes.reduce((prev, curr) =>
        Math.abs(curr.timing - currentTime) < Math.abs(prev.timing - currentTime) ? curr : prev,
      );

      closest.hit = true;
      const hitAccuracy = Math.abs(closest.timing - currentTime);
      let points = 100;

      if (hitAccuracy < 50)
        points = 300; // Perfect
      else if (hitAccuracy < 100)
        points = 200; // Great
      else if (hitAccuracy < 150) points = 150; // Good

      setScore((prev) => prev + points + combo * 10);
      setCombo((prev) => prev + 1);

      // Auto-save every 10 combo
      if ((combo + 1) % 10 === 0) {
        autoSave({
          score: score + points + combo * 10,
          level: selectedTrack?.difficulty || 1,
          progress: currentTime / 60000,
          stats: { mode, combo: combo + 1 },
        }).catch(() => {}); // Ignore save errors during gameplay
      }
    } else {
      // Miss - reset combo
      setCombo(0);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      switch (e.key.toLowerCase()) {
        case 'a':
        case 'z':
          hitNote(0);
          break;
        case 's':
        case 'x':
          hitNote(1);
          break;
        case 'd':
        case 'c':
          hitNote(2);
          break;
        case 'f':
        case 'v':
          hitNote(3);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentTime, combo, score]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (gameState === 'finished') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-black">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Song Complete!</h2>
          <div className="text-xl mb-2">Score: {score.toLocaleString()}</div>
          <div className="text-lg mb-2">Max Combo: {combo}</div>
          <div className="text-lg mb-6">Accuracy: {calculateAccuracy()}%</div>
          <div className="space-x-4">
            <button
              onClick={() => setGameState('menu')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const visibleNotes = notes.filter(
      (n) => !n.hit && n.timing > currentTime - 2000 && n.timing < currentTime + 2000,
    );

    return (
      <div
        ref={gameRef}
        className="w-full h-full bg-gradient-to-b from-purple-900 to-black relative overflow-hidden"
      >
        {/* Game UI */}
        <div className="absolute top-4 left-4 text-white z-10">
          <div className="text-2xl font-bold">Score: {score.toLocaleString()}</div>
          <div className="text-lg">Combo: {combo}</div>
        </div>

        <div className="absolute top-4 right-4 text-white z-10">
          <div className="text-lg">{selectedTrack?.name}</div>
          <div className="text-sm text-gray-300">{Math.ceil((60000 - currentTime) / 1000)}s</div>
        </div>

        {/* Note lanes */}
        <div className="absolute bottom-0 w-full h-full flex">
          {[0, 1, 2, 3].map((lane) => (
            <div key={lane} className="flex-1 border-r border-purple-500/30 relative">
              {/* Hit line */}
              <div className="absolute bottom-20 w-full h-2 bg-pink-500/80 rounded"></div>

              {/* Notes */}
              {visibleNotes
                .filter((n) => n.lane === lane)
                .map((note) => {
                  const progress = (note.timing - currentTime + 2000) / 2000; // 0 to 1
                  const y = (1 - progress) * 100; // Top to bottom

                  return (
                    <div
                      key={note.id}
                      className="absolute w-12 h-4 bg-pink-400 rounded-full left-1/2 transform -translate-x-1/2"
                      style={{ bottom: `${y}%` }}
                    />
                  );
                })}

              {/* Lane key indicator */}
              <div className="absolute bottom-4 w-full text-center text-white font-bold">
                {['A', 'S', 'D', 'F'][lane]}
              </div>
            </div>
          ))}
        </div>

        {/* Petal storm effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-pink-300/60 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Track selection menu
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900">
      <div className="max-w-md text-center text-white">
        <h2 className="text-2xl font-bold mb-6">
          {mode === 'practice' ? 'Practice Mode' : 'Arcade Mode'}
        </h2>
        <p className="text-gray-300 mb-8">Choose a track to play:</p>

        <div className="space-y-4">
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => startGame(track)}
              className="w-full p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 transition-colors text-left"
            >
              <h3 className="font-semibold">{track.name}</h3>
              <p className="text-sm text-gray-300">
                {track.bpm} BPM • Difficulty {track.difficulty}/5
              </p>
            </button>
          ))}
        </div>

        <button
          onClick={onBack}
          className="mt-6 px-6 py-3 bg-gray-600/20 border border-gray-500/30 rounded-xl hover:bg-gray-600/30 transition-colors"
        >
          Back to Main Menu
        </button>

        <div className="mt-6 text-xs text-gray-400">
          <p>Controls: A S D F or Z X C V</p>
        </div>
      </div>
    </div>
  );
}
