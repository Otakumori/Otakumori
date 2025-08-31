'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Play, RotateCcw } from 'lucide-react';

interface NotFoundPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotFoundPopup({ isOpen, onClose }: NotFoundPopupProps) {
  const [showGame, setShowGame] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  // Game state
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; clicked: boolean }>>([]);
  const [gameArea, setGameArea] = useState({ width: 0, height: 0 });

  // Reset game when popup opens
  useEffect(() => {
    if (isOpen) {
      setShowGame(false);
      setGameStarted(false);
      setScore(0);
      setTimeLeft(30);
      setGameOver(false);
      setTargets([]);
    }
  }, [isOpen]);

  // Game timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      setGameOver(true);
    }
  }, [gameStarted, timeLeft, gameOver]);

  // Generate targets
  useEffect(() => {
    if (gameStarted && !gameOver && targets.length < 5) {
      const interval = setInterval(() => {
        if (targets.length < 5) {
          const newTarget = {
            id: Date.now() + Math.random(),
            x: Math.random() * (gameArea.width - 60),
            y: Math.random() * (gameArea.height - 60),
            clicked: false,
          };
          setTargets(prev => [...prev, newTarget]);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, targets.length, gameArea]);

  // Auto-remove targets after 3 seconds
  useEffect(() => {
    if (targets.length > 0) {
      const timer = setTimeout(() => {
        setTargets(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [targets.length]);

  const startGame = () => {
    setShowGame(true);
    setGameStarted(true);
    setGameArea({ width: 400, height: 300 });
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setTargets([]);
  };

  const handleTargetClick = (targetId: number) => {
    setTargets(prev => prev.map(target => 
      target.id === targetId ? { ...target, clicked: true } : target
    ));
    setScore(prev => prev + 10);
  };

  const getGameMessage = () => {
    if (!gameStarted) return 'Click the targets to score points!';
    if (gameOver) return `Game Over! Final Score: ${score}`;
    return `Score: ${score} | Time: ${timeLeft}s`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              title="Close popup"
              aria-label="Close popup"
            >
              <X size={24} />
            </button>

            {!showGame ? (
              /* Image and start game section */
              <div className="text-center">
                <div className="mb-6">
                  <Image
                    src="/assets/images/download.jpg"
                    alt="404 Not Found"
                    width={400}
                    height={300}
                    className="mx-auto rounded-lg border border-gray-600"
                    priority
                  />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-4">
                  Oops! Page Not Found
                </h2>
                
                <p className="text-gray-300 mb-6">
                  Looks like you've wandered into the digital void. But don't worry - 
                  we've got a fun game to pass the time while you find your way back!
                </p>

                <button
                  onClick={startGame}
                  className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Play size={20} />
                  Play 404 Game
                </button>
              </div>
            ) : (
              /* Game section */
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    404 Target Practice
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {getGameMessage()}
                  </p>
                </div>

                {!gameOver && gameStarted && (
                  <div 
                    className="relative bg-gray-800 border border-gray-600 rounded-lg overflow-hidden mb-4 mx-auto w-[400px] h-[300px]"
                  >
                    {targets.map((target) => (
                      <motion.button
                        key={target.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTargetClick(target.id)}
                        disabled={target.clicked}
                        title={target.clicked ? 'Target hit!' : 'Click to score points'}
                        aria-label={target.clicked ? 'Target already hit' : 'Click target to score points'}
                        className={`absolute w-12 h-12 rounded-full border-2 transition-all ${
                          target.clicked 
                            ? 'bg-green-500 border-green-400' 
                            : 'bg-red-500 border-red-400 hover:bg-red-400'
                        }`}
                        style={{
                          left: `${target.x}px`,
                          top: `${target.y}px`,
                        }}
                      >
                        {target.clicked ? '✓' : '🎯'}
                      </motion.button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  {!gameStarted && (
                    <button
                      onClick={startGame}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Play size={16} />
                      Start Game
                    </button>
                  )}
                  
                  {(gameOver || gameStarted) && (
                    <button
                      onClick={resetGame}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <RotateCcw size={16} />
                      Reset Game
                    </button>
                  )}
                </div>

                {gameOver && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <p className="text-white font-medium">
                      Final Score: <span className="text-pink-400">{score}</span>
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      {score >= 100 ? 'Excellent!' : score >= 50 ? 'Good job!' : 'Keep practicing!'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
