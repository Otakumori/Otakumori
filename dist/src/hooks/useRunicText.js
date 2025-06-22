'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useRunicText = void 0;
const react_1 = require('react');
const useRunicText = ({
  text,
  revealOnHover = true,
  revealOnTap = true,
  revealDuration = 1000,
}) => {
  const [isRevealed, setIsRevealed] = (0, react_1.useState)(false);
  const [displayText, setDisplayText] = (0, react_1.useState)('');
  // Generate runic placeholder
  const generateRunicPlaceholder = length => {
    const runes = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚻᚾᛁᛃᛇᛈᛉᛊᛋᛏᛒᛓᛖᛗᛚᛜᛝᛟᛞᛟᛠᛡᛢᛣᛤᛥᛦᛧᛨᛩᛪ';
    return Array.from({ length }, () => runes[Math.floor(Math.random() * runes.length)]).join('');
  };
  (0, react_1.useEffect)(() => {
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
exports.useRunicText = useRunicText;
