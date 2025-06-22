'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = PetalCollector;
const react_1 = require('react');
function PetalCollector() {
  const [score, setScore] = (0, react_1.useState)(0);
  const [timeLeft, setTimeLeft] = (0, react_1.useState)(30);
  const [gameActive, setGameActive] = (0, react_1.useState)(false);
  const [petals, setPetals] = (0, react_1.useState)([]);
  const [highScore, setHighScore] = (0, react_1.useState)(0);
  const [multiplier, setMultiplier] = (0, react_1.useState)(1);
  const [powerUps, setPowerUps] = (0, react_1.useState)([]);
  const [combo, setCombo] = (0, react_1.useState)(0);
  const [maxCombo, setMaxCombo] = (0, react_1.useState)(0);
  const collectSoundRef = (0, react_1.useRef)(null);
  const gameOverSoundRef = (0, react_1.useRef)(null);
  const powerUpSoundRef = (0, react_1.useRef)(null);
  const comboSoundRef = (0, react_1.useRef)(null);
  (0, react_1.useEffect)(() => {
    const audioElements = {
      collect: new window.Audio('/assets/collect.mp3'),
      gameOver: new window.Audio('/assets/game-over.mp3'),
      powerUp: new window.Audio('/assets/power-up.mp3'),
      combo: new window.Audio('/assets/combo.mp3'),
    };
    // Set volumes
    Object.values(audioElements).forEach(audio => {
      audio.volume = 0.2;
    });
    // Store references
    collectSoundRef.current = audioElements.collect;
    gameOverSoundRef.current = audioElements.gameOver;
    powerUpSoundRef.current = audioElements.powerUp;
    comboSoundRef.current = audioElements.combo;
    return () => {
      // Cleanup audio elements
      Object.values(audioElements).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      });
      // Clear references
      collectSoundRef.current = null;
      gameOverSoundRef.current = null;
      powerUpSoundRef.current = null;
      comboSoundRef.current = null;
    };
  }, []);
  const spawnPetal = (type = 'normal') => {
    const points = type === 'golden' ? 5 : type === 'special' ? 3 : 1;
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      rotation: Math.random() * 360,
      collected: false,
      type,
      points,
    };
  };
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(30);
    setMultiplier(1);
    setCombo(0);
    setMaxCombo(0);
    setPowerUps([]);
    setPetals(Array.from({ length: 10 }, () => spawnPetal()));
  };
  const collectPetal = id => {
    if (!gameActive) return;
    const petal = petals.find(p => p.id === id);
    if (!petal) return;
    collectSoundRef.current?.play();
    setScore(prev => prev + petal.points * multiplier);
    setCombo(prev => {
      const newCombo = prev + 1;
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      if (newCombo % 5 === 0) {
        comboSoundRef.current?.play();
        setTimeLeft(prev => Math.min(prev + 2, 30));
      }
      return newCombo;
    });
    // Spawn new petal
    const newPetal = spawnPetal(
      Math.random() < 0.1 ? 'golden' : Math.random() < 0.2 ? 'special' : 'normal'
    );
    setPetals(prev => [...prev.filter(p => p.id !== id), newPetal]);
    // Chance to spawn power-up
    if (Math.random() < 0.1) {
      const powerUpTypes = ['time', 'multiplier', 'magnet'];
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      setPowerUps(prev => [
        ...prev,
        {
          id: Date.now(),
          type,
          duration: 10,
          active: true,
        },
      ]);
      powerUpSoundRef.current?.play();
    }
  };
  (0, react_1.useEffect)(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameActive(false);
            if (score > highScore) {
              setHighScore(score);
            }
            gameOverSoundRef.current?.play();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, score, highScore]);
  (0, react_1.useEffect)(() => {
    let timer;
    if (gameActive) {
      timer = setInterval(() => {
        setPowerUps(prev => {
          const updated = prev
            .map(p => ({
              ...p,
              duration: p.duration - 1,
              active: p.duration > 0,
            }))
            .filter(p => p.duration > 0);
          // Update multiplier based on active power-ups
          const hasMultiplier = updated.some(p => p.type === 'multiplier' && p.active);
          setMultiplier(hasMultiplier ? 2 : 1);
          return updated;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameActive]);
  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl bg-black/50">
      {/* Game UI */}
      <div className="absolute left-4 top-4 z-10 text-white">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div className="text-xl">Time: {timeLeft}s</div>
        <div className="text-lg">High Score: {highScore}</div>
        <div className="text-lg">Combo: {combo}x</div>
        <div className="text-lg">Max Combo: {maxCombo}x</div>
        {multiplier > 1 && (
          <div className="animate-pulse text-lg text-pink-400">2x Multiplier!</div>
        )}
      </div>

      {/* Power-ups Display */}
      <div className="absolute right-4 top-4 z-10 text-white">
        {powerUps.map(
          powerUp =>
            powerUp.active && (
              <div key={powerUp.id} className="mb-2">
                <span className="text-pink-400">
                  {powerUp.type === 'time' ? '⏰' : powerUp.type === 'multiplier' ? '✨' : '🧲'}
                  {powerUp.duration}s
                </span>
              </div>
            )
        )}
      </div>

      {/* Game Area */}
      <div className="absolute inset-0">
        {petals.map(
          petal =>
            !petal.collected && (
              <div
                key={petal.id}
                className={`absolute h-4 w-4 transform-gpu cursor-pointer rounded-full transition-transform hover:scale-110 ${
                  petal.type === 'golden'
                    ? 'bg-yellow-400'
                    : petal.type === 'special'
                      ? 'bg-purple-400'
                      : 'bg-pink-300'
                }`}
                style={{
                  left: `${petal.x}%`,
                  top: `${petal.y}%`,
                  transform: `rotate(${petal.rotation}deg)`,
                  filter: 'blur(1px)',
                  animation: `float ${3 + Math.random() * 2}s ease-in-out infinite alternate`,
                }}
                onClick={() => collectPetal(petal.id)}
              />
            )
        )}
      </div>

      {/* Start/Game Over Screen */}
      {!gameActive && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
          <h2 className="mb-4 text-3xl font-bold text-pink-400">
            {timeLeft === 30 ? 'Petal Collector' : 'Game Over!'}
          </h2>
          {timeLeft === 30 ? (
            <button
              className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 font-bold text-white transition-transform hover:scale-105"
              onClick={startGame}
            >
              Start Game
            </button>
          ) : (
            <div className="text-center">
              <p className="mb-2 text-xl text-pink-300">Final Score: {score}</p>
              <p className="mb-4 text-lg text-pink-200">Max Combo: {maxCombo}x</p>
              <button
                className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 font-bold text-white transition-transform hover:scale-105"
                onClick={startGame}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-10px) rotate(10deg);
          }
        }
      `}</style>
    </div>
  );
}
