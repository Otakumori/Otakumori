/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";
import { getAsset } from "../_shared/assets-resolver";

interface SceneProps {
  mapUrl?: string;
}

export default function Scene({ mapUrl }: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Use mapUrl if provided, otherwise fall back to the default from assets-roles.json
  const mapAsset = mapUrl || getAsset("rhythm-beat-em-up", "map");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Basic game loop
    const gameLoop = () => {
      if (!isPlaying) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      const bgAsset = getAsset("rhythm-beat-em-up", "bg");
      if (bgAsset) {
        const bg = new Image();
        bg.src = bgAsset;
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      }
      
      // Draw score
      ctx.fillStyle = "#ffffff";
      ctx.font = "24px Arial";
      ctx.fillText(`Score: ${score}`, 20, 40);
      
      requestAnimationFrame(gameLoop);
    };

    if (isPlaying) {
      gameLoop();
    }
  }, [isPlaying, score]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
  };

  const endGame = () => {
    setIsPlaying(false);
    // Post results to the game finish API
    (window as any).__gameEnd({ score, stats: { diff: "easy" } });
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="w-full h-full border border-gray-600"
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Rhythm Beat-Em-Up</h2>
            <button
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      
      {isPlaying && (
        <div className="absolute top-4 left-4">
          <button
            onClick={endGame}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            End Game
          </button>
        </div>
      )}
      
      {mapAsset && (
        <div className="absolute bottom-4 left-4 text-xs text-white/70">
          Map: {mapAsset}
        </div>
      )}
    </div>
  );
}
