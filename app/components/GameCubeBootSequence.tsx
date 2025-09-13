'use client';

import { useState, useEffect, useRef } from 'react';
import { audio } from '@/app/lib/audio';

interface GameCubeBootSequenceProps {
  onBootComplete: () => void;
}

export default function GameCubeBootSequence({ onBootComplete }: GameCubeBootSequenceProps) {
  const [stage, setStage] = useState<'start' | 'logo' | 'loading' | 'complete'>('start');
  const [bootSeen, setBootSeen] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const audioLoaded = useRef(false);

  // Preload audio files
  useEffect(() => {
    const loadAudio = async () => {
      const files: [string, string][] = [
        ['boot_whoosh', '/sfx/boot_whoosh.mp3'],
        ['gamecube_menu', '/sfx/gamecube-menu.mp3'],
        ['samus_jingle', '/sfx/samus-jingle.mp3'],
        ['midna_lament', '/sfx/midna-lament.mp3'],
        ['jpotter_sound', '/sfx/jpotter-sound.mp3'],
      ];
      
      await audio.preload(files);
      audioLoaded.current = true;
    };

    loadAudio();
  }, []);

  // Check if boot has been seen this session
  useEffect(() => {
    const hasBooted = sessionStorage.getItem('otakumori-boot-seen');
    const forceReboot = new URLSearchParams(window.location.search).get('reboot') === '1';
    
    if (hasBooted && !forceReboot) {
      setBootSeen(true);
      onBootComplete();
      return;
    }

    // Show skip option after 2 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);

    return () => clearTimeout(skipTimer);
  }, [onBootComplete]);

  // Boot sequence with SFX
  useEffect(() => {
    if (!audioLoaded.current || bootSeen) return;

    const bootSequence = async () => {
      // Start boot whoosh - plays for entire boot animation duration (4.5 seconds total)
      const bootWhoosh = audio.play('boot_whoosh', { gain: 0.7 });
      
      // Stage 1: Initial logo
      await new Promise(resolve => setTimeout(resolve, 500));
      setStage('logo');

      // Stage 2: Logo phase
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStage('loading');

      // Stage 3: Loading phase
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStage('complete');

      // Stage 4: Complete - boot whoosh should end here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Stop boot whoosh
      if (bootWhoosh) {
        bootWhoosh();
      }
      
      sessionStorage.setItem('otakumori-boot-seen', 'true');
      onBootComplete();
    };

    bootSequence();
  }, [audioLoaded.current, bootSeen, onBootComplete]);

  // Handle skip
  const handleSkip = () => {
    audio.play('samus_jingle', { gain: 0.5 });
    sessionStorage.setItem('otakumori-boot-seen', 'true');
    onBootComplete();
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (bootSeen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
            <div className="text-4xl font-bold text-white">O</div>
          </div>
          <div className="text-2xl font-bold text-white mb-2">Otaku-mori</div>
          <div className="text-gray-400">GameCube Hub</div>
        </div>

        {/* Boot stages */}
        {stage === 'logo' && (
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-pink-400 rounded-lg animate-pulse" />
            <div className="text-lg text-pink-300">Initializing...</div>
          </div>
        )}

        {stage === 'loading' && (
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-pink-400 rounded-lg animate-spin" />
            <div className="text-lg text-pink-300">Loading your adventure...</div>
          </div>
        )}

        {stage === 'complete' && (
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-lg flex items-center justify-center">
              <div className="text-2xl text-white">✓</div>
            </div>
            <div className="text-lg text-green-300">Ready!</div>
          </div>
        )}

        {/* Skip option */}
        {showSkip && (
          <div className="text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-700 rounded">ESC</kbd> to skip
          </div>
        )}
      </div>
    </div>
  );
}
