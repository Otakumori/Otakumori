'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { trapFocus } from '@/app/lib/accessibility';

const ONBOARDING_STORAGE_KEY = 'otm-onboarding-completed';

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleComplete = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Check if user has already seen onboarding
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    
    if (!hasSeenOnboarding) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        previousActiveElement.current = document.activeElement as HTMLElement;
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Focus trapping when modal is open
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    // Trap focus within modal
    const cleanup = trapFocus(modalRef.current, previousActiveElement.current || undefined);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      cleanup();
    };
  }, [isOpen, handleSkip]);

  const steps = [
    {
      title: 'Welcome to Otaku-mori!',
      content: (
        <div className="space-y-4">
          <p className="text-white/90">
            You've entered a realm where anime meets gaming. Here's what awaits you:
          </p>
          <ul className="space-y-2 text-white/80 text-sm list-disc list-inside">
            <li>Collect <strong className="text-pink-400">petals</strong> by playing games and completing orders</li>
            <li>Explore your <strong className="text-pink-400">gamified profile</strong> with achievements and stats</li>
            <li>Browse the <strong className="text-pink-400">shop</strong> for exclusive merch</li>
            <li>Play <strong className="text-pink-400">mini-games</strong> in the GameCube hub</li>
            <li>Leave <strong className="text-pink-400">soapstones</strong> for fellow travelers</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Petals & Rewards',
      content: (
        <div className="space-y-4">
          <p className="text-white/90">
            <strong className="text-pink-400">Petals</strong> are your currency here. Earn them by:
          </p>
          <ul className="space-y-2 text-white/80 text-sm list-disc list-inside">
            <li>Completing mini-games</li>
            <li>Making purchases</li>
            <li>Participating in community events</li>
            <li>Completing daily quests</li>
          </ul>
          <p className="text-white/80 text-sm">
            Spend petals in the petal shop for exclusive items and rewards!
          </p>
        </div>
      ),
    },
    {
      title: 'Your Profile',
      content: (
        <div className="space-y-4">
          <p className="text-white/90">
            Your <strong className="text-pink-400">profile</strong> is your journey's record:
          </p>
          <ul className="space-y-2 text-white/80 text-sm list-disc list-inside">
            <li>View your achievements and titles</li>
            <li>Track your petal balance and stats</li>
            <li>See your game scores and leaderboard position</li>
            <li>Customize your character appearance</li>
          </ul>
          <p className="text-white/80 text-sm">
            Visit your profile anytime from the user menu!
          </p>
        </div>
      ),
    },
    {
      title: 'Shop & Games',
      content: (
        <div className="space-y-4">
          <p className="text-white/90">
            Explore everything Otaku-mori has to offer:
          </p>
          <ul className="space-y-2 text-white/80 text-sm list-disc list-inside">
            <li><strong className="text-pink-400">Shop:</strong> Browse exclusive anime merch and collectibles</li>
            <li><strong className="text-pink-400">Mini-Games:</strong> Enter the GameCube hub and play action, puzzle, and strategy games</li>
            <li><strong className="text-pink-400">Soapstones:</strong> Leave messages for other travelers in the community</li>
            <li><strong className="text-pink-400">Wishlist:</strong> Save items you want to purchase later</li>
          </ul>
        </div>
      ),
    },
  ];

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl mx-4 bg-black/90 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl"
        tabIndex={-1}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          aria-label="Close onboarding"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Skip tour
            </button>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h2 id="onboarding-title" className="text-2xl font-bold text-white mb-4">{currentStepData.title}</h2>
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-pink-500' : 'bg-white/30'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={isLastStep ? handleComplete : () => setCurrentStep(currentStep + 1)}
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            {isLastStep ? "Let's Go!" : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

