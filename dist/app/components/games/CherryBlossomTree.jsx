'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.CherryBlossomTree = CherryBlossomTree;
const react_1 = __importStar(require('react'));
const framer_motion_1 = require('framer-motion');
function CherryBlossomTree() {
  const [petals, setPetals] = (0, react_1.useState)([]);
  const [score, setScore] = (0, react_1.useState)(0);
  const [isGameActive, setIsGameActive] = (0, react_1.useState)(false);
  const canvasRef = (0, react_1.useRef)(null);
  const animationRef = (0, react_1.useRef)();
  const lastTimeRef = (0, react_1.useRef)(0);
  (0, react_1.useEffect)(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    setPetals([]);
    lastTimeRef.current = performance.now();
    animate();
  };
  const animate = () => {
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;
    if (!isGameActive) return;
    setPetals(prevPetals => {
      // Add new petals
      if (Math.random() < 0.1) {
        const newPetal = {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: -20,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
          speed: 1 + Math.random() * 2,
        };
        return [...prevPetals, newPetal];
      }
      // Update existing petals
      return prevPetals
        .map(petal => ({
          ...petal,
          y: petal.y + petal.speed,
          x: petal.x + Math.sin(petal.y * 0.01) * 2,
          rotation: petal.rotation + 1,
        }))
        .filter(petal => petal.y < window.innerHeight);
    });
    animationRef.current = requestAnimationFrame(animate);
  };
  const handlePetalClick = petalId => {
    setPetals(prevPetals => prevPetals.filter(p => p.id !== petalId));
    setScore(prev => prev + 1);
  };
  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="absolute inset-0" style={{ background: 'transparent' }} />

      {!isGameActive && (
        <framer_motion_1.motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <button
            onClick={startGame}
            className="transform rounded-full bg-pink-600 px-8 py-4 text-xl font-bold text-white transition-colors duration-300 hover:scale-105 hover:bg-pink-700"
          >
            Start Catching Petals
          </button>
        </framer_motion_1.motion.div>
      )}

      {isGameActive && (
        <div className="absolute right-4 top-4 text-2xl font-bold text-white">Score: {score}</div>
      )}

      {petals.map(petal => (
        <framer_motion_1.motion.div
          key={petal.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: petal.x,
            y: petal.y,
            rotate: petal.rotation,
            scale: petal.scale,
          }}
          exit={{ opacity: 0 }}
          onClick={() => handlePetalClick(petal.id)}
          className="absolute cursor-pointer"
          style={{
            width: '20px',
            height: '20px',
            background: 'url(/assets/images/petal.png) no-repeat center/contain',
          }}
        />
      ))}
    </div>
  );
}
