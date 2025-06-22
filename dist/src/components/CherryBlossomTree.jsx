'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CherryBlossomTree = void 0;
const react_1 = require('react');
const web_1 = require('@react-spring/web');
const react_intersection_observer_1 = require('react-intersection-observer');
const usePetals_1 = require('@/hooks/usePetals');
const useAchievements_1 = require('@/hooks/useAchievements');
const useAudio_1 = require('@/hooks/useAudio');
const CherryBlossomTree = () => {
  const [petals, setPetals] = (0, react_1.useState)([]);
  const [collectedCount, setCollectedCount] = (0, react_1.useState)(0);
  const containerRef = (0, react_1.useRef)(null);
  const { ref: inViewRef, inView } = (0, react_intersection_observer_1.useInView)({
    threshold: 0.1,
    triggerOnce: false,
  });
  const { addPetal } = (0, usePetals_1.usePetals)();
  const { checkAchievements } = (0, useAchievements_1.useAchievements)();
  const { play: playPetalCollectSound } = (0, useAudio_1.useAudio)({
    src: '/assets/sounds/petal-collect.mp3',
  });
  // Animation spring for the tree
  const treeSpring = (0, web_1.useSpring)({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: inView ? 1 : 0, scale: inView ? 1 : 0.9 },
    config: { tension: 280, friction: 60 },
  });
  // Generate initial petals
  (0, react_1.useEffect)(() => {
    if (inView && containerRef.current) {
      const generatePetal = () => ({
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        collected: false,
      });
      const initialPetals = Array.from({ length: 30 }, generatePetal);
      setPetals(initialPetals);
    }
  }, [inView]);
  // Animate petals
  (0, react_1.useEffect)(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setPetals(currentPetals =>
        currentPetals.map(petal => {
          if (petal.collected) return petal;
          return {
            ...petal,
            y: (petal.y + 0.2) % 100,
            x: petal.x + Math.sin(petal.y * 0.1) * 0.5,
            rotation: petal.rotation + 1,
          };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, [inView]);
  const handlePetalClick = petal => {
    if (petal.collected) return;
    setPetals(currentPetals =>
      currentPetals.map(p => (p.id === petal.id ? { ...p, collected: true } : p))
    );
    setCollectedCount(prev => {
      const newCount = prev + 1;
      addPetal();
      checkAchievements(newCount);
      playPetalCollectSound();
      return newCount;
    });
  };
  return (
    <div
      ref={inViewRef}
      className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800"
    >
      <web_1.animated.div
        ref={containerRef}
        style={treeSpring}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Tree Image */}
        <img
          src="/assets/cherry.jpg"
          alt="Cherry Blossom Tree"
          className="h-full w-full object-cover"
        />

        {/* Interactive Petals */}
        {petals.map(petal => (
          <web_1.animated.div
            key={petal.id}
            onClick={() => handlePetalClick(petal)}
            className={`absolute cursor-pointer transition-opacity duration-500 ${petal.collected ? 'opacity-0' : 'opacity-100'}`}
            style={{
              left: `${petal.x}%`,
              top: `${petal.y}%`,
              transform: `rotate(${petal.rotation}deg) scale(${petal.scale})`,
            }}
          >
            <img src="/assets/petal.png" alt="Cherry Blossom Petal" className="h-4 w-4" />
          </web_1.animated.div>
        ))}

        {/* Collection Counter */}
        <div className="absolute bottom-8 left-8 rounded-lg bg-black/50 p-4 text-white">
          <p className="text-lg font-medium">Petals Collected: {collectedCount}</p>
        </div>
      </web_1.animated.div>
    </div>
  );
};
exports.CherryBlossomTree = CherryBlossomTree;
