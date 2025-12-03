'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import FooterDark from '../../components/FooterDark';
import GlassPanel from '../../components/GlassPanel';

// L-Room 404 Puzzle - Death Note inspired
);
}
export default function LRoom404Page() {
  const [currentPhase, setCurrentPhase] = useState<
    'timeline' | 'herring' | 'name' | 'complete' | 'fallback'
  >('timeline');
  const [_timelineOrder, _setTimelineOrder] = useState<number[]>([]);
  const [selectedTimestamps, setSelectedTimestamps] = useState<number[]>([]);
  const [herringSelections, setHerringSelections] = useState<number[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [showFlash, setShowFlash] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Timeline Anomaly data - 5 timestamps out of order
  const timestamps = [
    { id: 0, time: '2024-01-15 14:30:00', label: 'Initial breach detected' },
    { id: 1, time: '2024-01-15 14:25:00', label: 'System logs corrupted' },
    { id: 2, time: '2024-01-15 14:35:00', label: 'Security protocols activated' },
    { id: 3, time: '2024-01-15 14:20:00', label: 'First anomaly reported' },
    { id: 4, time: '2024-01-15 14:40:00', label: 'Containment successful' },
  ];

  // Red Herring data - 4 most frequent characters
  const characters = [
    { id: 0, name: 'L', frequency: 847, isCorrect: true },
    { id: 1, name: 'Kira', frequency: 623, isCorrect: true },
    { id: 2, name: 'Ryuk', frequency: 445, isCorrect: true },
    { id: 3, name: 'Misa', frequency: 389, isCorrect: true },
    { id: 4, name: 'Light', frequency: 234, isCorrect: false },
    { id: 5, name: 'Near', frequency: 198, isCorrect: false },
    { id: 6, name: 'Mello', frequency: 156, isCorrect: false },
    { id: 7, name: 'Rem', frequency: 134, isCorrect: false },
  ];

  // True Name anagram - DEATH / SHINIGAMI
  const correctNames = ['DEATH', 'SHINIGAMI'];

  useEffect(() => {
    // Set up timeout for fallback 404
    const timeout = setTimeout(() => {
      setCurrentPhase('fallback');
    }, 300000); // 5 minutes timeout
    setTimeoutId(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
      setTimeoutId(null);
    };
  }, []);

  // Clear timeout when puzzle is completed or fallback is triggered
  useEffect(() => {
    if ((currentPhase === 'complete' || currentPhase === 'fallback') && timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [currentPhase, timeoutId]);

  // Phase 1: Timeline Anomaly
  const handleTimestampClick = (id: number) => {
    if (selectedTimestamps.includes(id)) {
      setSelectedTimestamps((prev) => prev.filter((t) => t !== id));
    } else if (selectedTimestamps.length < 5) {
      setSelectedTimestamps((prev) => [...prev, id]);
    }
  };

  const confirmTimeline = () => {
    if (selectedTimestamps.length !== 5) return;

    // Check if timestamps are in correct chronological order
    const sortedTimestamps = [...selectedTimestamps].sort(
      (a, b) => new Date(timestamps[a].time).getTime() - new Date(timestamps[b].time).getTime(),
    );

    const isCorrect = JSON.stringify(selectedTimestamps) === JSON.stringify(sortedTimestamps);

    if (isCorrect) {
      // Track telemetry
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', '404_p1', { event_category: 'puzzle' });
      }
      setCurrentPhase('herring');
    } else {
      // Reset and try again
      setSelectedTimestamps([]);
    }
  };

  // Phase 2: Red Herring
  const handleCharacterClick = (id: number) => {
    if (herringSelections.includes(id)) {
      setHerringSelections((prev) => prev.filter((c) => c !== id));
    } else if (herringSelections.length < 4) {
      setHerringSelections((prev) => [...prev, id]);
    }
  };

  const confirmHerring = () => {
    if (herringSelections.length !== 4) return;

    // Check if all selected characters are correct
    const isCorrect = herringSelections.every(
      (id) => characters.find((c) => c.id === id)?.isCorrect,
    );

    if (isCorrect) {
      // Track telemetry
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', '404_p2', { event_category: 'puzzle' });
      }
      setCurrentPhase('name');
    } else {
      // Reset and try again
      setHerringSelections([]);
    }
  };

  // Phase 3: True Name
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const upperName = nameInput.toUpperCase();

    if (correctNames.includes(upperName)) {
      // Track telemetry
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', '404_p3', { event_category: 'puzzle' });
        window.gtag('event', '404_complete', { event_category: 'puzzle' });
      }

      setShowFlash(true);
      setTimeout(() => {
        setCurrentPhase('complete');
      }, 1000);
    } else {
      setNameInput('');
    }
  };

  const resetPuzzle = () => {
    setCurrentPhase('timeline');
    setSelectedTimestamps([]);
    setHerringSelections([]);
    setNameInput('');
    setShowFlash(false);
  };

  const goToFallback = () => {
    setCurrentPhase('fallback');
  };

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen bg-otaku-space">
        {/* White flash effect */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-display text-pink-400 md:text-5xl mb-4">The L-Room</h1>
            <p className="text-zinc-300/90 text-lg">
              Logic has been corrupted. Restore the data sequence.
            </p>
          </div>

          {/* Phase 1: Timeline Anomaly */}
          {currentPhase === 'timeline' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <GlassPanel className="p-6">
                <h2 className="text-2xl font-display text-white mb-4">Timeline Anomaly</h2>
                <p className="text-zinc-300 mb-6">
                  Select the 5 timestamps in chronological order to restore the timeline.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {timestamps.map((timestamp) => (
                    <button
                      key={timestamp.id}
                      onClick={() => handleTimestampClick(timestamp.id)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        selectedTimestamps.includes(timestamp.id)
                          ? 'bg-pink-500/20 border-2 border-pink-400'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-mono text-sm text-zinc-400">{timestamp.time}</div>
                      <div className="text-white text-sm mt-1">{timestamp.label}</div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-zinc-400">
                    Selected: {selectedTimestamps.length}/5
                  </div>
                  <button
                    onClick={confirmTimeline}
                    disabled={selectedTimestamps.length !== 5}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Timeline
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {/* Phase 2: Red Herring */}
          {currentPhase === 'herring' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <GlassPanel className="p-6">
                <h2 className="text-2xl font-display text-white mb-4">Red Herring</h2>
                <p className="text-zinc-300 mb-6">
                  Select the 4 most frequent characters to identify the pattern.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {characters.map((character) => (
                    <button
                      key={character.id}
                      onClick={() => handleCharacterClick(character.id)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        herringSelections.includes(character.id)
                          ? 'bg-pink-500/20 border-2 border-pink-400'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-white font-semibold mb-1">{character.name}</div>
                      <div className="text-sm text-zinc-400">{character.frequency} occurrences</div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-zinc-400">
                    Selected: {herringSelections.length}/4
                  </div>
                  <button
                    onClick={confirmHerring}
                    disabled={herringSelections.length !== 4}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Selection
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {/* Phase 3: True Name */}
          {currentPhase === 'name' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <GlassPanel className="p-6">
                <h2 className="text-2xl font-display text-white mb-4">True Name</h2>
                <p className="text-zinc-300 mb-6">
                  Enter the anagram keyword to complete the restoration.
                </p>

                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <label htmlFor="true-name-input" className="sr-only">
                    Enter the true name to complete the restoration
                  </label>
                  <input
                    id="true-name-input"
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value.toUpperCase())}
                    placeholder="Enter the true name..."
                    className="form-input w-full text-center text-lg"
                    autoComplete="off"
                  />
                  <button type="submit" className="btn-primary w-full">
                    Restore Data
                  </button>
                </form>
              </GlassPanel>
            </motion.div>
          )}

          {/* Completion */}
          {currentPhase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <GlassPanel className="p-8 text-center">
                <h2 className="text-3xl font-display text-green-400 mb-4">Logic Restored</h2>
                <p className="text-xl text-white mb-6">The data can now be recovered.</p>
                <div className="space-y-4">
                  <button onClick={() => (window.location.href = '/')} className="btn-primary">
                    Return to the Homepage
                  </button>
                  <button onClick={resetPuzzle} className="btn-secondary">
                    Try Another Puzzle
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {/* Fallback 404 */}
          {currentPhase === 'fallback' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <GlassPanel className="p-8 text-center">
                <h2 className="text-4xl font-display text-white mb-4">Lost in the Digital Abyss</h2>
                <p className="text-xl text-zinc-300 mb-6">
                  The page you seek has vanished into the void.
                </p>
                <div className="space-y-4">
                  <button onClick={() => (window.location.href = '/')} className="btn-primary">
                    Return to the Homepage
                  </button>
                  <button onClick={goToFallback} className="btn-secondary">
                    Try the L-Room Puzzle
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {/* Skip/Timeout button */}
          {currentPhase !== 'fallback' && (
            <div className="text-center mt-8">
              <button
                onClick={goToFallback}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Skip to 404
              </button>
            </div>
          )}
        </div>
      </main>
      <FooterDark />
    </>
  );
}
