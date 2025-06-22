'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Tutorial = void 0;
const react_1 = require('react');
const framer_motion_1 = require('framer-motion');
const PhoneCall_1 = require('./PhoneCall');
const useSound_1 = require('@/lib/hooks/useSound');
const useHaptic_1 = require('@/lib/hooks/useHaptic');
const useAchievements_1 = require('@/lib/hooks/useAchievements');
const TUTORIAL_STEPS = [
  {
    character: {
      name: 'Otaku-mori',
      avatar: '🎮',
      role: 'Your Guide',
    },
    messages: [
      {
        text: "Welcome, chosen one. I've been expecting you.",
        type: 'incoming',
        delay: 40,
      },
      {
        text: 'This realm is not what it seems. Every interaction, every choice, shapes your legend.',
        type: 'incoming',
        delay: 30,
      },
    ],
  },
  {
    character: {
      name: 'Otaku-mori',
      avatar: '🎮',
      role: 'Your Guide',
    },
    messages: [
      {
        text: "Your avatar is more than just a face. It's your spirit, your essence in this world.",
        type: 'incoming',
      },
      {
        text: 'Watch how it reacts to your presence, your achievements, your very soul.',
        type: 'incoming',
      },
    ],
    highlight: {
      selector: "[data-tutorial='avatar']",
      message: 'Your avatar will evolve as you progress',
    },
  },
  {
    character: {
      name: 'Otaku-mori',
      avatar: '🎮',
      role: 'Your Guide',
    },
    messages: [
      {
        text: 'The petals you collect are fragments of forgotten dreams. Each one tells a story.',
        type: 'incoming',
      },
      {
        text: 'Gather them, cherish them, and watch as they transform your journey.',
        type: 'incoming',
      },
    ],
    highlight: {
      selector: "[data-tutorial='petals']",
      message: 'Collect petals to unlock new possibilities',
    },
  },
  {
    character: {
      name: 'Otaku-mori',
      avatar: '🎮',
      role: 'Your Guide',
    },
    messages: [
      {
        text: 'But beware, for this world holds secrets within secrets.',
        type: 'incoming',
      },
      {
        text: 'Some achievements are hidden, waiting for those who dare to look deeper.',
        type: 'incoming',
      },
    ],
    highlight: {
      selector: "[data-tutorial='achievements']",
      message: 'Discover hidden achievements through exploration',
    },
  },
];
const Tutorial = () => {
  const [currentStep, setCurrentStep] = (0, react_1.useState)(0);
  const [showTutorial, setShowTutorial] = (0, react_1.useState)(true);
  const { playSound } = (0, useSound_1.useSound)();
  const { vibrate } = (0, useHaptic_1.useHaptic)();
  const { unlockAchievement } = (0, useAchievements_1.useAchievements)();
  (0, react_1.useEffect)(() => {
    // Check if this is the user's first visit
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (hasSeenTutorial) {
      setShowTutorial(false);
    }
  }, []);
  const handleStepComplete = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Tutorial complete
      localStorage.setItem('hasSeenTutorial', 'true');
      setShowTutorial(false);
      playSound('achievement');
      vibrate('success');
      unlockAchievement('first_steps');
    }
  };
  if (!showTutorial) return null;
  return (
    <framer_motion_1.AnimatePresence>
      {showTutorial && (
        <PhoneCall_1.PhoneCall
          character={TUTORIAL_STEPS[currentStep].character}
          messages={TUTORIAL_STEPS[currentStep].messages}
          onComplete={handleStepComplete}
        />
      )}
    </framer_motion_1.AnimatePresence>
  );
};
exports.Tutorial = Tutorial;
