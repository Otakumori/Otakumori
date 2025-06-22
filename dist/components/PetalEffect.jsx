'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PetalEffect = void 0;
const framer_motion_1 = require('framer-motion');
const animations_1 = require('@/lib/animations');
const useSound_1 = require('@/lib/hooks/useSound');
const useHaptic_1 = require('@/lib/hooks/useHaptic');
const react_1 = require('react');
const PetalEffect = ({
  count = 8,
  color = '#FF69B4',
  size = 20,
  duration = 4,
  interactive = false,
  onCollect,
}) => {
  const controls = (0, framer_motion_1.useAnimation)();
  const { playSound } = (0, useSound_1.useSound)();
  const { vibrate } = (0, useHaptic_1.useHaptic)();
  const mouseX = (0, framer_motion_1.useMotionValue)(0);
  const mouseY = (0, framer_motion_1.useMotionValue)(0);
  const handleMouseMove = e => {
    if (!interactive) return;
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };
  const handlePetalClick = index => {
    if (!interactive) return;
    playSound('petal');
    vibrate('light');
    onCollect?.();
    controls.start({
      scale: [1, 1.2, 0],
      opacity: [1, 1, 0],
      transition: { duration: 0.5 },
    });
  };
  (0, react_1.useEffect)(() => {
    if (interactive) {
      controls.start('animate');
    }
  }, [controls, interactive]);
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {Array.from({ length: count }).map((_, index) => {
        const x = (0, framer_motion_1.useTransform)(mouseX, [0, window.innerWidth], [-20, 20]);
        const y = (0, framer_motion_1.useTransform)(mouseY, [0, window.innerHeight], [-20, 20]);
        return (
          <framer_motion_1.motion.div
            key={index}
            className={`absolute ${interactive ? 'cursor-pointer' : ''}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              x: interactive ? x : 0,
              y: interactive ? y : 0,
            }}
            variants={animations_1.petalFloat}
            initial="initial"
            animate={controls}
            custom={index}
            onClick={() => handlePetalClick(index)}
            whileHover={interactive ? { scale: 1.2 } : undefined}
            whileTap={interactive ? { scale: 0.8 } : undefined}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C15.31 2 18 4.69 18 8C18 11.31 15.31 14 12 14C8.69 14 6 11.31 6 8C6 4.69 8.69 2 12 2ZM12 0C7.58 0 4 3.58 4 8C4 12.42 7.58 16 12 16C16.42 16 20 12.42 20 8C20 3.58 16.42 0 12 0Z"
                fill={color}
                fillOpacity="0.6"
              />
            </svg>
          </framer_motion_1.motion.div>
        );
      })}
    </div>
  );
};
exports.PetalEffect = PetalEffect;
