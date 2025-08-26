/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall } from './PhoneCall';
import { useSound } from '@/lib/hooks/useSound';
import { useHaptic } from '@/lib/hooks/useHaptic';
import { useAchievements } from '@/lib/hooks/useAchievements';

interface TutorialStep {
  character: {
    name: string;
    avatar: string;
    role: string;
  };
  messages: {
    text: string;
    type: 'incoming' | 'outgoing';
    delay?: number;
  }[];
  highlight?: {
    selector: string;
    message: string;
  };
}

const TUTORIAL_STEPS: TutorialStep[] = [
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

export const Tutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const { playSound } = useSound();
  const { vibrate } = useHaptic();
  const { unlockAchievement } = useAchievements();

  useEffect(() => {
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
    <AnimatePresence>
      {showTutorial && (
        <PhoneCall
          character={TUTORIAL_STEPS[currentStep].character}
          messages={TUTORIAL_STEPS[currentStep].messages}
          onComplete={handleStepComplete}
        />
      )}
    </AnimatePresence>
  );
};
