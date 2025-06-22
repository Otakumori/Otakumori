'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.tapScale =
  exports.hoverScale =
  exports.pageTransition =
  exports.achievementUnlock =
  exports.gameCubeBoot =
  exports.petalFloat =
  exports.scaleIn =
  exports.slideUp =
  exports.fadeIn =
    void 0;
exports.fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};
exports.slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};
exports.scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};
exports.petalFloat = {
  initial: {
    y: -20,
    x: 0,
    rotate: 0,
    opacity: 0,
  },
  animate: {
    y: [0, -30, 0],
    x: [0, 15, -15, 0],
    rotate: [0, 15, -15, 0],
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 4,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};
exports.gameCubeBoot = {
  initial: {
    scale: 0.8,
    opacity: 0,
    rotate: -10,
  },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    scale: 1.2,
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: 'easeIn',
    },
  },
};
exports.achievementUnlock = {
  initial: {
    scale: 0,
    opacity: 0,
    rotate: -180,
  },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};
exports.pageTransition = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: 'easeIn',
    },
  },
};
exports.hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2, ease: 'easeOut' },
};
exports.tapScale = {
  scale: 0.95,
  transition: { duration: 0.1, ease: 'easeIn' },
};
