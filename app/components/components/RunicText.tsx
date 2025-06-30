import { useRunicText } from '../../hooks/hooks/useRunicText';
import { cn } from '../../lib/utils';
import { useAudio } from '../../hooks/useAudio';

interface RunicTextProps {
  text: string;
  className?: string;
  revealOnHover?: boolean;
  revealOnTap?: boolean;
  revealDuration?: number;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';
}

export const RunicText = ({
  text,
  className,
  revealOnHover = true,
  revealOnTap = true,
  revealDuration = 1000,
  as: Component = 'p',
}: RunicTextProps) => {
  const { displayText, handleReveal, isRevealed } = useRunicText({
    text,
    revealOnHover,
    revealOnTap,
    revealDuration,
  });

  const { play: playRunicRevealSound } = useAudio('/assets/sounds/runic-reveal.mp3');

  const handleClick = () => {
    handleReveal();
    if (!isRevealed) {
      playRunicRevealSound();
    }
  };

  return (
    <Component
      className={cn(
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
