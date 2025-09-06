import { useState, useEffect } from 'react';

interface UseRunicTextProps {
  text: string;
  revealOnHover?: boolean;
  revealOnTap?: boolean;
  revealDuration?: number;
}

export const useRunicText = ({
  text,
  revealOnHover = true,
  revealOnTap = true,
  revealDuration = 1000,
}: UseRunicTextProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [displayText, setDisplayText] = useState('');

  // Generate runic placeholder
  const generateRunicPlaceholder = (length: number) => {
    const runes = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚻᚾᛁᛃᛇᛈᛉᛊᛋᛏᛒᛓᛖᛗᛚᛜᛝᛟᛞᛟᛠᛡᛢᛣᛤᛥᛦᛧᛨᛩᛪ';
    return Array.from({ length }, () => runes[Math.floor(Math.random() * runes.length)]).join('');
  };

  useEffect(() => {
    if (!isRevealed) {
      setDisplayText(generateRunicPlaceholder(text.length));
    } else {
      setDisplayText(text);
    }
  }, [isRevealed, text]);

  const handleReveal = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      // Add subtle animation class
      const element = document.querySelector('.runic-text');
      if (element) {
        element.classList.add('reveal-text');
        setTimeout(() => {
          element.classList.remove('reveal-text');
        }, revealDuration);
      }
    }
  };

  return {
    displayText,
    isRevealed,
    handleReveal,
    revealOnHover,
    revealOnTap,
  };
};
