'use strict';
'use client';
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
const react_1 = __importStar(require('react'));
const framer_motion_1 = require('framer-motion');
const InteractiveCherryBlossom = () => {
  const [petals, setPetals] = (0, react_1.useState)([]);
  const containerRef = (0, react_1.useRef)(null);
  const [containerSize, setContainerSize] = (0, react_1.useState)({ width: 0, height: 0 });
  (0, react_1.useEffect)(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  (0, react_1.useEffect)(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return;
    const createPetal = () => ({
      id: Math.random(), // Unique ID
      x: Math.random() * containerSize.width, // Start within container width
      y: -20, // Start above the container
      size: Math.random() * 15 + 10, // Petal size
      duration: Math.random() * 6 + 4, // Fall duration
      delay: Math.random() * 3, // Staggered delay
      collected: false, // Not collected initially
    });
    // Initial petals
    const initialPetals = Array.from({ length: 50 }, () => createPetal());
    setPetals(initialPetals);
    // Add new petals over time
    const interval = setInterval(() => {
      setPetals(prev => [
        ...prev.filter(p => !p.collected && p.y <= containerSize.height + p.size), // Keep active petals within bounds
        createPetal(),
      ]);
    }, 500); // Add a new petal every 500ms
    return () => clearInterval(interval);
  }, [containerSize]); // Re-run effect when container size changes
  // Remove petals that have fallen off screen
  (0, react_1.useEffect)(() => {
    const cleanupInterval = setInterval(() => {
      setPetals(prev => prev.filter(p => p.y <= containerSize.height + p.size));
    }, 1000);
    return () => clearInterval(cleanupInterval);
  }, [containerSize]);
  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
      <img
        src="/assets/cherry.jpg"
        alt="Cherry Blossom Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <framer_motion_1.AnimatePresence>
        {petals.map(
          petal =>
            !petal.collected && (
              <framer_motion_1.motion.div
                key={petal.id}
                className="absolute left-0 top-0 cursor-pointer"
                initial={{ x: petal.x, y: petal.y, opacity: 1 }}
                animate={{
                  y: containerSize.height + petal.size, // Fall to bottom of container
                  x: petal.x + (Math.random() * 200 - 100), // Horizontal drift
                  opacity: 0,
                  rotate: Math.random() * 360 + 180, // Rotate
                }}
                transition={{
                  duration: petal.duration,
                  delay: petal.delay,
                  ease: 'linear',
                  repeat: Infinity, // Petals keep falling
                  repeatType: 'loop',
                }}
                style={{
                  width: petal.size,
                  height: petal.size,
                }}
              >
                <div className="h-full w-full rounded-full bg-pink-300"></div>
              </framer_motion_1.motion.div>
            )
        )}
      </framer_motion_1.AnimatePresence>
    </div>
  );
};
exports.default = InteractiveCherryBlossom;
