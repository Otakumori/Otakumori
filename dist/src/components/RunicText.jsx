'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.RunicText = void 0;
const useRunicText_1 = require('@/hooks/useRunicText');
const utils_1 = require('@/lib/utils');
const useAudio_1 = require('@/hooks/useAudio');
const RunicText = ({
  text,
  className,
  revealOnHover = true,
  revealOnTap = true,
  revealDuration = 1000,
  as: Component = 'p',
}) => {
  const { displayText, handleReveal, isRevealed } = (0, useRunicText_1.useRunicText)({
    text,
    revealOnHover,
    revealOnTap,
    revealDuration,
  });
  const { play: playRunicRevealSound } = (0, useAudio_1.useAudio)({
    src: '/assets/sounds/runic-reveal.mp3',
  });
  const handleClick = () => {
    handleReveal();
    if (!isRevealed) {
      playRunicRevealSound();
    }
  };
  return (
    <Component
      className={(0, utils_1.cn)(
        'runic-text cursor-pointer select-none transition-all duration-300',
        'hover:scale-105 active:scale-95',
        'medieval-text text-gray-400',
        isRevealed && 'text-white',
        className
      )}
      onClick={handleClick}
      onTouchStart={handleClick}
      role="button"
      tabIndex={0}
      aria-label={isRevealed ? text : 'Click to reveal text'}
    >
      {displayText}
    </Component>
  );
};
exports.RunicText = RunicText;
