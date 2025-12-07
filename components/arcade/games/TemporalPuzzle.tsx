'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

interface TimelineEvent {
  id: string;
  label: string;
  time: string;
  description: string;
  order: number; // Correct chronological order
}

// Sample timeline events (anime/gaming themed)
const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'event-1',
    label: 'The Great Petal War',
    time: 'Year 0',
    description: 'The ancient conflict that shaped the realm',
    order: 1,
  },
  {
    id: 'event-2',
    label: 'First Cherry Blossom Bloom',
    time: 'Year 150',
    description: 'The sacred tree awakens for the first time',
    order: 2,
  },
  {
    id: 'event-3',
    label: 'The Rune Forging',
    time: 'Year 300',
    description: 'Masters create the first magical runes',
    order: 3,
  },
  {
    id: 'event-4',
    label: 'The Traveler\'s Arrival',
    time: 'Year 450',
    description: 'First outsider discovers Otaku-mori',
    order: 4,
  },
  {
    id: 'event-5',
    label: 'The Bazaar Opens',
    time: 'Year 600',
    description: 'Scarlet Bazaar becomes a trading hub',
    order: 5,
  },
  {
    id: 'event-6',
    label: 'The Modern Era',
    time: 'Year 750',
    description: 'Current age of prosperity',
    order: 6,
  },
];

export default function TemporalPuzzle({ onComplete, onFail, duration }: GameProps) {
  const [availableEvents, setAvailableEvents] = useState<TimelineEvent[]>(TIMELINE_EVENTS);
  const [selectedSequence, setSelectedSequence] = useState<TimelineEvent[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    wrongIndices?: number[];
  }>({ type: null, message: '' });
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration);

  // Countdown timer
  useEffect(() => {
    if (isComplete || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onFail();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isComplete, onFail]);

  // Show hint after 2 failed attempts
  useEffect(() => {
    if (attempts >= 2) {
      setShowHint(true);
    }
  }, [attempts]);

  const handleEventClick = useCallback(
    (event: TimelineEvent) => {
      if (isComplete) return;

      // Check if event is already in sequence
      const isSelected = selectedSequence.some((e) => e.id === event.id);

      if (isSelected) {
        // Remove from sequence
        setSelectedSequence((prev) => prev.filter((e) => e.id !== event.id));
      } else {
        // Add to sequence
        setSelectedSequence((prev) => [...prev, event]);
      }

      // Clear feedback when making changes
      setFeedback({ type: null, message: '' });
    },
    [selectedSequence, isComplete],
  );

  const handleRemoveFromSequence = useCallback(
    (eventId: string) => {
      if (isComplete) return;
      setSelectedSequence((prev) => prev.filter((e) => e.id !== eventId));
      setFeedback({ type: null, message: '' });
    },
    [isComplete],
  );

  const handleMoveInSequence = useCallback(
    (index: number, direction: 'up' | 'down') => {
      if (isComplete) return;

      const newSequence = [...selectedSequence];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newSequence.length) return;

      // Swap elements
      [newSequence[index], newSequence[targetIndex]] = [
        newSequence[targetIndex],
        newSequence[index],
      ];

      setSelectedSequence(newSequence);
      setFeedback({ type: null, message: '' });
    },
    [selectedSequence, isComplete],
  );

  const handleConfirm = useCallback(() => {
    if (isComplete || selectedSequence.length === 0) return;

    setAttempts((prev) => prev + 1);

    // Check if all events are selected
    if (selectedSequence.length !== TIMELINE_EVENTS.length) {
      setFeedback({
        type: 'error',
        message: `Please select all ${TIMELINE_EVENTS.length} events before confirming.`,
      });
      return;
    }

    // Validate chronological order
    const isCorrect = selectedSequence.every(
      (event, index) => event.order === index + 1,
    );

    if (isCorrect) {
      setIsComplete(true);
      setFeedback({
        type: 'success',
        message: 'Perfect! The timeline is correct. The ancient lore reveals itself...',
      });

      // Calculate score based on attempts and time remaining
      const baseScore = 1000;
      const attemptBonus = Math.max(0, 500 - attempts * 100); // Fewer attempts = more bonus
      const timeBonus = Math.floor(timeRemaining * 10);
      const totalScore = baseScore + attemptBonus + timeBonus;

      // Award petals (more for perfect play)
      const petals = attempts === 1 ? 50 : attempts === 2 ? 30 : 20;

      setTimeout(() => {
        onComplete(totalScore, petals);
      }, 2000);
    } else {
      // Find wrong positions
      const wrongIndices: number[] = [];
      selectedSequence.forEach((event, index) => {
        if (event.order !== index + 1) {
          wrongIndices.push(index);
        }
      });

      setFeedback({
        type: 'error',
        message: 'The timeline order is incorrect. Some events are out of place.',
        wrongIndices,
      });
    }
  }, [selectedSequence, attempts, timeRemaining, isComplete, onComplete]);

  const handleReset = useCallback(() => {
    if (isComplete) return;
    setSelectedSequence([]);
    setFeedback({ type: null, message: '' });
  }, [isComplete]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-purple-950 via-pink-950 to-black overflow-auto p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-pink-300 mb-2">Temporal Puzzle</h2>
        <p className="text-sm text-pink-200/70">
          Arrange the events in chronological order. Click events to add them to your timeline.
        </p>
        <div className="mt-2 text-yellow-300">
          Time: {timeRemaining}s | Attempts: {attempts}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100%-120px)]">
        {/* Available Events Panel */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-pink-500/30">
          <h3 className="text-lg font-semibold text-pink-300 mb-3">Available Events</h3>
          <div className="space-y-2 max-h-[calc(100%-60px)] overflow-y-auto">
            {availableEvents.map((event) => {
              const isSelected = selectedSequence.some((e) => e.id === event.id);
              return (
                <motion.button
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-pink-500/30 border-pink-400 text-pink-200'
                      : 'bg-black/30 border-pink-500/20 text-white hover:border-pink-400/50 hover:bg-black/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isComplete}
                >
                  <div className="font-mono text-xs text-pink-400 mb-1">{event.time}</div>
                  <div className="font-semibold">{event.label}</div>
                  <div className="text-xs text-gray-300 mt-1">{event.description}</div>
                  {isSelected && (
                    <div className="text-xs text-pink-400 mt-1">
                      Selected #{selectedSequence.findIndex((e) => e.id === event.id) + 1}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Your Timeline Panel */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-purple-300">Your Timeline</h3>
            {selectedSequence.length > 0 && (
              <button
                onClick={handleReset}
                className="text-xs px-3 py-1 bg-red-500/30 hover:bg-red-500/50 text-red-200 rounded transition-colors"
                disabled={isComplete}
              >
                Reset
              </button>
            )}
          </div>

          {selectedSequence.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>Click events to add them to your timeline</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100%-100px)] overflow-y-auto">
              {selectedSequence.map((event, index) => {
                const isWrong = feedback.wrongIndices?.includes(index);
                return (
                  <motion.div
                    key={`${event.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border-2 ${
                      isWrong
                        ? 'bg-red-500/20 border-red-400'
                        : feedback.type === 'success'
                          ? 'bg-green-500/20 border-green-400'
                          : 'bg-purple-500/20 border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-purple-400">
                            #{index + 1}
                          </span>
                          <span className="font-mono text-xs text-pink-400">{event.time}</span>
                        </div>
                        <div className="font-semibold text-white">{event.label}</div>
                        <div className="text-xs text-gray-300 mt-1">{event.description}</div>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <button
                          onClick={() => handleMoveInSequence(index, 'up')}
                          disabled={index === 0 || isComplete}
                          className="px-2 py-1 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleRemoveFromSequence(event.id)}
                          disabled={isComplete}
                          className="px-2 py-1 bg-red-500/30 hover:bg-red-500/50 text-red-200 rounded text-xs"
                        >
                          ×
                        </button>
                        <button
                          onClick={() => handleMoveInSequence(index, 'down')}
                          disabled={index === selectedSequence.length - 1 || isComplete}
                          className="px-2 py-1 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Confirm Button */}
          {selectedSequence.length > 0 && (
            <div className="mt-4">
              <motion.button
                onClick={handleConfirm}
                disabled={isComplete || selectedSequence.length !== TIMELINE_EVENTS.length}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  selectedSequence.length === TIMELINE_EVENTS.length && !isComplete
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={
                  selectedSequence.length === TIMELINE_EVENTS.length && !isComplete
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  selectedSequence.length === TIMELINE_EVENTS.length && !isComplete
                    ? { scale: 0.98 }
                    : {}
                }
              >
                Confirm Sequence ({selectedSequence.length}/{TIMELINE_EVENTS.length})
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Message */}
      <AnimatePresence>
        {feedback.message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-lg border-2 ${
              feedback.type === 'success'
                ? 'bg-green-500/20 border-green-400 text-green-200'
                : 'bg-red-500/20 border-red-400 text-red-200'
            } backdrop-blur-sm z-50 max-w-md`}
          >
            <p className="font-semibold text-center">{feedback.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {showHint && !isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 right-4 bg-yellow-500/20 border border-yellow-400 rounded-lg p-4 max-w-xs backdrop-blur-sm z-50"
        >
          <h4 className="font-semibold text-yellow-300 mb-2">💡 Hint</h4>
          <p className="text-sm text-yellow-200">
            Look at the time labels on each event. Arrange them from earliest to latest year.
          </p>
        </motion.div>
      )}
    </div>
  );
}

