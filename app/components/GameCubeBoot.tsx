 
 
'use client';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import BootCube3D from '../../components/BootCube3D';
import SakuraParticles3D from '../../components/SakuraParticles3D';

interface GameCubeBootProps {
  onBootComplete?: () => void;
}

export default function GameCubeBoot({ onBootComplete }: GameCubeBootProps) {
  const [stage, setStage] = useState('black');
  const [showLogo, setShowLogo] = useState(false);
  const [showCube3D, setShowCube3D] = useState(false);
  const [showParticles3D, setShowParticles3D] = useState(false);
  const [showInterface, setShowInterface] = useState(false);
  const [showScanlines, setShowScanlines] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cubeTextures = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'];

  const sakuraTexture = '/assets/textures/sakura.png';

  useEffect(() => {
    const bootSequence = async () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.4;
        audioRef.current.play();
      }

      setShowScanlines(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStage('logo');
      setShowLogo(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowLogo(false);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setStage('3d_scene');
      setShowCube3D(true);
      setShowParticles3D(true);
      await new Promise((resolve) => setTimeout(resolve, 4000));

      setStage('interface');
      setShowCube3D(false);
      setShowParticles3D(false);
      setShowInterface(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onBootComplete?.();
    };

    bootSequence();
  }, [onBootComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <audio ref={audioRef} src="/assets/sounds/gamecube-boot.mp3" preload="auto" />

      {showScanlines && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.05) 2px)',
            animation: 'scanline-flicker 0.06s infinite',
            opacity: 0.08,
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {stage === 'logo' && showLogo && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="relative h-64 w-64"
          >
            <Image
              src="/assets/images/gamecube-logo.png"
              alt="GameCube Logo"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        )}

        {stage === '3d_scene' && showCube3D && showParticles3D && (
          <motion.div
            key="3d_scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <BootCube3D textures={cubeTextures} />
            </div>
            <SakuraParticles3D particleCount={500} sakuraTexture={sakuraTexture} />
          </motion.div>
        )}

        {stage === 'interface' && showInterface && (
          <motion.div
            key="interface"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-4 text-4xl font-bold text-pink-500">Welcome to Otakumori</h1>
            <p className="text-lg text-pink-300">Your anime adventure begins here</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes scanline-flicker {
          0%,
          100% {
            opacity: 0.08;
          }
          50% {
            opacity: 0.12;
          }
        }
      `}</style>
    </div>
  );
}
